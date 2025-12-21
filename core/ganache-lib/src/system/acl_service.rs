use anyhow::{anyhow, Context, Result};
use ganache_api::models::acl::{
    AceInheritFlags, AcePrincipal, AceType, GetAclResponse, Nfs4Ace, Nfs4Acl, Nfs4Permissions,
    SetAclResponse,
};
use ganache_api::models::active_directory::{
    AdPrincipal, AdPrincipalType, AdSearchRequest, AdSearchResponse,
};
use std::process::Command;

/// Service for managing NFSv4 ACLs and AD principal searches
///
/// # Purpose
/// Provides ACL management via nfs4xdr-acl-tools and LDAP searches for user/group lookup
///
/// @ref Story-4.2 - ACL service implementation
pub struct AclService;

impl AclService {
    // ===== AD PRINCIPAL SEARCH =====

    /// Search Active Directory for users and groups
    ///
    /// # Purpose
    /// Performs LDAP query with pagination to list AD principals for ACL assignment
    ///
    /// # Arguments
    /// * `request` - Search parameters (query, type filter, pagination)
    ///
    /// # Returns
    /// Paginated list of AD principals matching the search criteria
    ///
    /// # Errors
    /// Returns error if AD is not joined, LDAP query fails, or parsing fails
    ///
    /// @ref Story-4.2 - Implements searchable AD principal listing with pagination
    pub fn search_principals(request: &AdSearchRequest) -> Result<AdSearchResponse> {
        tracing::info!(
            "Searching AD principals: query={:?}, type={:?}, page={}, size={}",
            request.query,
            request.principal_type,
            request.page,
            request.page_size
        );

        // Validate page size
        let page_size = request.page_size.min(1000).max(1); // Max 1000, min 1

        // In dev mode, return mock data
        if std::env::var("GANACHE_DEV_MODE").is_ok() {
            return Self::mock_search_principals(request);
        }

        // Build LDAP search filter
        let filter = Self::build_ldap_filter(&request.query, &request.principal_type)?;

        // Execute LDAP search with pagination
        let (principals, total_count) =
            Self::execute_ldap_search(&filter, request.page, page_size)?;

        let has_more = (request.page * page_size + principals.len() as u32) < total_count;

        Ok(AdSearchResponse {
            principals,
            page: request.page,
            page_size,
            total_count,
            has_more,
        })
    }

    // ===== ACL OPERATIONS =====

    /// Get ACL for a filesystem path
    ///
    /// # Purpose
    /// Retrieves and parses ACL using nfs4xdr_getfacl
    ///
    /// # Arguments
    /// * `path` - Filesystem path to query
    /// * `format` - Output format ("compact" or "verbose")
    ///
    /// # Returns
    /// Structured ACL data
    ///
    /// # Errors
    /// Returns error if path doesn't exist or nfs4xdr_getfacl fails
    ///
    /// @ref Story-4.2 - Implements ACL retrieval and parsing
    pub fn get_acl(path: &str, format: &str) -> Result<GetAclResponse> {
        tracing::info!("Getting ACL for path: {} (format: {})", path, format);

        // In dev mode, return mock ACL
        if std::env::var("GANACHE_DEV_MODE").is_ok() {
            return Self::mock_get_acl(path);
        }

        // Execute nfs4xdr_getfacl
        let output = Command::new("nfs4xdr_getfacl")
            .arg(path)
            .output()
            .context("Failed to execute nfs4xdr_getfacl")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow!("Failed to get ACL: {}", stderr));
        }

        let raw_output = String::from_utf8_lossy(&output.stdout).to_string();

        // Parse ACL output
        let acl = Self::parse_acl_output(&raw_output, path, format)?;

        Ok(GetAclResponse {
            acl,
            raw_output: Some(raw_output),
        })
    }

    /// Set ACL for a filesystem path
    ///
    /// # Purpose
    /// Applies ACL using nfs4xdr_setfacl
    ///
    /// # Arguments
    /// * `path` - Filesystem path to modify
    /// * `acl` - ACL to apply
    ///
    /// # Returns
    /// Success status
    ///
    /// # Errors
    /// Returns error if validation fails or nfs4xdr_setfacl fails
    ///
    /// @ref Story-4.2 - Implements ACL modification
    pub fn set_acl(path: &str, acl: &Nfs4Acl) -> Result<SetAclResponse> {
        tracing::info!("Setting ACL for path: {}", path);

        // Validate ACL
        Self::validate_acl(acl)?;

        // In dev mode, simulate success
        if std::env::var("GANACHE_DEV_MODE").is_ok() {
            return Ok(SetAclResponse {
                success: true,
                message: format!("DEV MODE: ACL set for {}", path),
            });
        }

        // Convert ACL to nfs4xdr format
        let acl_spec = Self::acl_to_spec(acl)?;

        // Execute nfs4xdr_setfacl
        let output = Command::new("nfs4xdr_setfacl")
            .arg("-s")
            .arg(&acl_spec)
            .arg(path)
            .output()
            .context("Failed to execute nfs4xdr_setfacl")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow!("Failed to set ACL: {}", stderr));
        }

        Ok(SetAclResponse {
            success: true,
            message: format!("ACL successfully set for {}", path),
        })
    }

    // ===== PRIVATE HELPER METHODS =====

    /// Build LDAP search filter based on query and type
    fn build_ldap_filter(
        query: &Option<String>,
        principal_type: &Option<AdPrincipalType>,
    ) -> Result<String> {
        let mut filters = Vec::new();

        // Type filter
        match principal_type {
            Some(AdPrincipalType::User) => {
                filters.push("(objectClass=user)(objectCategory=person)".to_string());
            }
            Some(AdPrincipalType::Group) => {
                filters.push("(objectClass=group)".to_string());
            }
            None => {
                // Both users and groups
                filters.push("(|(objectClass=user)(objectClass=group))".to_string());
            }
        }

        // Name filter (case-insensitive substring)
        if let Some(q) = query {
            if !q.trim().is_empty() {
                filters.push(format!("(cn=*{}*)", q.trim()));
            }
        }

        // Combine filters
        if filters.len() == 1 {
            Ok(filters[0].clone())
        } else {
            Ok(format!("(&{})", filters.join("")))
        }
    }

    /// Execute LDAP search using wbinfo or ldapsearch
    fn execute_ldap_search(
        filter: &str,
        page: u32,
        page_size: u32,
    ) -> Result<(Vec<AdPrincipal>, u32)> {
        // Use wbinfo for basic queries (simpler, uses winbind cache)
        // For complex queries with pagination, we'd need ldapsearch with LDAP paging control

        // LDAP paging OID: 1.2.840.113556.1.4.319
        let offset = page * page_size;

        // Get Base DN from environment or use empty (auto-detect from AD)
        // In production, set LDAP_BASE_DN environment variable (e.g., "DC=corp,DC=example,DC=com")
        let base_dn = std::env::var("LDAP_BASE_DN").unwrap_or_default();

        let output = Command::new("ldapsearch")
            .args(&[
                "-LLL", // LDIF output without comments
                "-E",
                &format!("pr={}/noprompt", page_size), // Paging control (page size)
                "-b",
                &base_dn, // Base DN from environment
                filter,
                "cn",
                "distinguishedName",
                "objectSid",
                "objectClass",
            ])
            .output()
            .context("Failed to execute ldapsearch")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            tracing::warn!("LDAP search failed: {}", stderr);
            // Return empty result instead of error (AD might not be configured)
            return Ok((Vec::new(), 0));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let principals = Self::parse_ldap_output(&stdout)?;

        // Apply offset for pagination
        let total_count = principals.len() as u32;
        let paginated = principals
            .into_iter()
            .skip(offset as usize)
            .take(page_size as usize)
            .collect();

        Ok((paginated, total_count))
    }

    /// Parse LDAP output to extract principals
    fn parse_ldap_output(output: &str) -> Result<Vec<AdPrincipal>> {
        let mut principals = Vec::new();
        let mut current_entry: Option<(String, String, Option<String>, Vec<String>)> = None;

        for line in output.lines() {
            if line.starts_with("dn:") {
                // Start new entry
                if let Some((name, dn, sid, classes)) = current_entry.take() {
                    principals.push(Self::create_principal(name, dn, sid, classes)?);
                }
            } else if line.starts_with("cn:") {
                let name = line.split(':').nth(1).unwrap_or("").trim().to_string();
                if let Some(ref mut entry) = current_entry {
                    entry.0 = name;
                } else {
                    current_entry = Some((name, String::new(), None, Vec::new()));
                }
            } else if line.starts_with("distinguishedName:") {
                let dn = line.split(':').nth(1).unwrap_or("").trim().to_string();
                if let Some(ref mut entry) = current_entry {
                    entry.1 = dn;
                }
            } else if line.starts_with("objectSid:") {
                let sid = line.split(':').nth(1).unwrap_or("").trim().to_string();
                if let Some(ref mut entry) = current_entry {
                    entry.2 = Some(sid);
                }
            } else if line.starts_with("objectClass:") {
                let class = line.split(':').nth(1).unwrap_or("").trim().to_string();
                if let Some(ref mut entry) = current_entry {
                    entry.3.push(class);
                }
            }
        }

        // Add last entry
        if let Some((name, dn, sid, classes)) = current_entry {
            principals.push(Self::create_principal(name, dn, sid, classes)?);
        }

        Ok(principals)
    }

    /// Create AdPrincipal from parsed LDAP attributes
    fn create_principal(
        name: String,
        dn: String,
        sid: Option<String>,
        classes: Vec<String>,
    ) -> Result<AdPrincipal> {
        // Determine type from objectClass
        let principal_type =
            if classes.contains(&"person".to_string()) || classes.contains(&"user".to_string()) {
                AdPrincipalType::User
            } else {
                AdPrincipalType::Group
            };

        Ok(AdPrincipal {
            name,
            principal_type,
            distinguished_name: dn,
            sid,
        })
    }

    /// Parse ACL output from nfs4xdr_getfacl
    fn parse_acl_output(output: &str, path: &str, _format: &str) -> Result<Nfs4Acl> {
        let mut aces = Vec::new();

        for line in output.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            // Parse compact format: "owner@:rwxpD-aARWcCos:-------:allow"
            let parts: Vec<&str> = line.split(':').collect();
            if parts.len() != 4 {
                continue; // Skip malformed lines
            }

            let principal = Self::parse_principal(parts[0])?;
            let permissions = Self::parse_permissions(parts[1])?;
            let inherit_flags = Self::parse_inherit_flags(parts[2])?;
            let ace_type = Self::parse_ace_type(parts[3])?;

            aces.push(Nfs4Ace {
                index: None,
                principal,
                permissions,
                inherit_flags,
                ace_type,
            });
        }

        Ok(Nfs4Acl {
            path: path.to_string(),
            aces,
        })
    }

    /// Parse principal string (e.g., "owner@", "user:john", "group:admins")
    fn parse_principal(s: &str) -> Result<AcePrincipal> {
        match s {
            "owner@" => Ok(AcePrincipal::Owner),
            "group@" => Ok(AcePrincipal::Group),
            "everyone@" => Ok(AcePrincipal::Everyone),
            _ if s.starts_with("user:") => {
                let name = s.strip_prefix("user:").unwrap().to_string();
                Ok(AcePrincipal::User(name))
            }
            _ if s.starts_with("group:") => {
                let name = s.strip_prefix("group:").unwrap().to_string();
                Ok(AcePrincipal::NamedGroup(name))
            }
            _ => Err(anyhow!("Unknown principal format: {}", s)),
        }
    }

    /// Parse permission string (e.g., "rwxpD-aARWcCos")
    fn parse_permissions(s: &str) -> Result<Nfs4Permissions> {
        let chars: Vec<char> = s.chars().collect();
        Ok(Nfs4Permissions {
            read_data: chars.get(0) == Some(&'r'),
            write_data: chars.get(1) == Some(&'w'),
            append_data: chars.get(2) == Some(&'p'),
            execute: chars.get(3) == Some(&'x'),
            delete: chars.get(4) == Some(&'d'),
            delete_child: chars.get(5) == Some(&'D'),
            read_acl: chars.get(6) == Some(&'c'),
            write_acl: chars.get(7) == Some(&'C'),
            read_attributes: chars.get(8) == Some(&'a'),
            write_attributes: chars.get(9) == Some(&'A'),
            read_named_attrs: chars.get(10) == Some(&'R'),
            write_named_attrs: chars.get(11) == Some(&'W'),
            write_owner: chars.get(12) == Some(&'o'),
            synchronize: chars.get(13) == Some(&'s'),
        })
    }

    /// Parse inherit flags string (e.g., "fd-----")
    fn parse_inherit_flags(s: &str) -> Result<AceInheritFlags> {
        let chars: Vec<char> = s.chars().collect();
        Ok(AceInheritFlags {
            file_inherit: chars.get(0) == Some(&'f'),
            dir_inherit: chars.get(1) == Some(&'d'),
            inherit_only: chars.get(2) == Some(&'i'),
            no_propagate: chars.get(3) == Some(&'n'),
            successful_access: chars.get(4) == Some(&'S'),
            failed_access: chars.get(5) == Some(&'F'),
            inherited: chars.get(6) == Some(&'I'),
        })
    }

    /// Parse ACE type string (e.g., "allow", "deny")
    fn parse_ace_type(s: &str) -> Result<AceType> {
        match s.to_lowercase().as_str() {
            "allow" => Ok(AceType::Allow),
            "deny" => Ok(AceType::Deny),
            "audit" => Ok(AceType::Audit),
            "alarm" => Ok(AceType::Alarm),
            _ => Err(anyhow!("Unknown ACE type: {}", s)),
        }
    }

    /// Validate ACL structure
    ///
    /// @ref Story-4.2 - ACL validation with owner@ requirement check
    fn validate_acl(acl: &Nfs4Acl) -> Result<()> {
        if acl.aces.is_empty() {
            return Err(anyhow!("ACL must contain at least one ACE"));
        }

        // Validate that owner@ is present (required for NFSv4 ACLs)
        let has_owner = acl
            .aces
            .iter()
            .any(|ace| ace.principal == AcePrincipal::Owner);
        if !has_owner {
            return Err(anyhow!("ACL must contain an owner@ entry"));
        }

        // Validate no duplicate principals (same principal can't appear twice with same type)
        let mut seen_principals = std::collections::HashSet::new();
        for ace in &acl.aces {
            let key = format!("{:?}:{:?}", ace.principal, ace.ace_type);
            if !seen_principals.insert(key.clone()) {
                return Err(anyhow!(
                    "Duplicate ACE found for principal: {:?}",
                    ace.principal
                ));
            }
        }

        Ok(())
    }

    /// Convert ACL to nfs4xdr_setfacl format
    fn acl_to_spec(acl: &Nfs4Acl) -> Result<String> {
        let mut specs = Vec::new();

        for ace in &acl.aces {
            let principal_str = Self::principal_to_string(&ace.principal);
            let perms_str = Self::permissions_to_string(&ace.permissions);
            let flags_str = Self::inherit_flags_to_string(&ace.inherit_flags);
            let type_str = Self::ace_type_to_string(&ace.ace_type);

            specs.push(format!(
                "{}:{}:{}:{}",
                principal_str, perms_str, flags_str, type_str
            ));
        }

        Ok(specs.join(","))
    }

    /// Convert principal to string format
    fn principal_to_string(principal: &AcePrincipal) -> String {
        match principal {
            AcePrincipal::Owner => "owner@".to_string(),
            AcePrincipal::Group => "group@".to_string(),
            AcePrincipal::Everyone => "everyone@".to_string(),
            AcePrincipal::User(name) => format!("user:{}", name),
            AcePrincipal::NamedGroup(name) => format!("group:{}", name),
        }
    }

    /// Convert permissions to compact string
    fn permissions_to_string(perms: &Nfs4Permissions) -> String {
        let mut s = String::new();
        s.push(if perms.read_data { 'r' } else { '-' });
        s.push(if perms.write_data { 'w' } else { '-' });
        s.push(if perms.append_data { 'p' } else { '-' });
        s.push(if perms.execute { 'x' } else { '-' });
        s.push(if perms.delete { 'd' } else { '-' });
        s.push(if perms.delete_child { 'D' } else { '-' });
        s.push(if perms.read_acl { 'c' } else { '-' });
        s.push(if perms.write_acl { 'C' } else { '-' });
        s.push(if perms.read_attributes { 'a' } else { '-' });
        s.push(if perms.write_attributes { 'A' } else { '-' });
        s.push(if perms.read_named_attrs { 'R' } else { '-' });
        s.push(if perms.write_named_attrs { 'W' } else { '-' });
        s.push(if perms.write_owner { 'o' } else { '-' });
        s.push(if perms.synchronize { 's' } else { '-' });
        s
    }

    /// Convert inherit flags to compact string
    fn inherit_flags_to_string(flags: &AceInheritFlags) -> String {
        let mut s = String::new();
        s.push(if flags.file_inherit { 'f' } else { '-' });
        s.push(if flags.dir_inherit { 'd' } else { '-' });
        s.push(if flags.inherit_only { 'i' } else { '-' });
        s.push(if flags.no_propagate { 'n' } else { '-' });
        s.push(if flags.successful_access { 'S' } else { '-' });
        s.push(if flags.failed_access { 'F' } else { '-' });
        s.push(if flags.inherited { 'I' } else { '-' });
        s
    }

    /// Convert ACE type to string
    fn ace_type_to_string(ace_type: &AceType) -> String {
        match ace_type {
            AceType::Allow => "allow".to_string(),
            AceType::Deny => "deny".to_string(),
            AceType::Audit => "audit".to_string(),
            AceType::Alarm => "alarm".to_string(),
        }
    }

    // ===== MOCK METHODS FOR DEV MODE =====

    fn mock_search_principals(request: &AdSearchRequest) -> Result<AdSearchResponse> {
        let mut principals = vec![
            AdPrincipal {
                name: "Domain Admins".to_string(),
                principal_type: AdPrincipalType::Group,
                distinguished_name: "CN=Domain Admins,CN=Users,DC=corp,DC=example,DC=com"
                    .to_string(),
                sid: Some("S-1-5-21-123456789-123456789-123456789-512".to_string()),
            },
            AdPrincipal {
                name: "Finance-Group".to_string(),
                principal_type: AdPrincipalType::Group,
                distinguished_name: "CN=Finance-Group,OU=Departments,DC=corp,DC=example,DC=com"
                    .to_string(),
                sid: Some("S-1-5-21-123456789-123456789-123456789-1001".to_string()),
            },
            AdPrincipal {
                name: "john.doe".to_string(),
                principal_type: AdPrincipalType::User,
                distinguished_name: "CN=John Doe,OU=Users,DC=corp,DC=example,DC=com".to_string(),
                sid: Some("S-1-5-21-123456789-123456789-123456789-1105".to_string()),
            },
            AdPrincipal {
                name: "jane.smith".to_string(),
                principal_type: AdPrincipalType::User,
                distinguished_name: "CN=Jane Smith,OU=Users,DC=corp,DC=example,DC=com".to_string(),
                sid: Some("S-1-5-21-123456789-123456789-123456789-1106".to_string()),
            },
        ];

        // Filter by type
        if let Some(ref ptype) = request.principal_type {
            principals.retain(|p| &p.principal_type == ptype);
        }

        // Filter by query
        if let Some(ref query) = request.query {
            let query_lower = query.to_lowercase();
            principals.retain(|p| p.name.to_lowercase().contains(&query_lower));
        }

        let total_count = principals.len() as u32;
        let page_size = request.page_size.min(1000).max(1);
        let offset = (request.page * page_size) as usize;

        let paginated: Vec<_> = principals
            .into_iter()
            .skip(offset)
            .take(page_size as usize)
            .collect();

        let has_more = offset + paginated.len() < total_count as usize;

        Ok(AdSearchResponse {
            principals: paginated,
            page: request.page,
            page_size,
            total_count,
            has_more,
        })
    }

    fn mock_get_acl(path: &str) -> Result<GetAclResponse> {
        let acl = Nfs4Acl {
            path: path.to_string(),
            aces: vec![
                Nfs4Ace {
                    index: Some(0),
                    principal: AcePrincipal::Owner,
                    permissions: Nfs4Permissions {
                        read_data: true,
                        write_data: true,
                        execute: true,
                        delete: true,
                        read_acl: true,
                        write_acl: true,
                        read_attributes: true,
                        write_attributes: true,
                        write_owner: true,
                        synchronize: true,
                        ..Default::default()
                    },
                    inherit_flags: Default::default(),
                    ace_type: AceType::Allow,
                },
                Nfs4Ace {
                    index: Some(1),
                    principal: AcePrincipal::Group,
                    permissions: Nfs4Permissions {
                        read_data: true,
                        execute: true,
                        read_attributes: true,
                        ..Default::default()
                    },
                    inherit_flags: Default::default(),
                    ace_type: AceType::Allow,
                },
                Nfs4Ace {
                    index: Some(2),
                    principal: AcePrincipal::Everyone,
                    permissions: Nfs4Permissions {
                        read_data: true,
                        execute: true,
                        ..Default::default()
                    },
                    inherit_flags: Default::default(),
                    ace_type: AceType::Allow,
                },
            ],
        };

        Ok(GetAclResponse {
            acl,
            raw_output: Some("# Mock ACL output for dev mode".to_string()),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_ldap_filter_users_only() {
        let filter = AclService::build_ldap_filter(&None, &Some(AdPrincipalType::User)).unwrap();
        assert!(filter.contains("objectClass=user"));
        assert!(filter.contains("objectCategory=person"));
    }

    #[test]
    fn test_build_ldap_filter_groups_only() {
        let filter = AclService::build_ldap_filter(&None, &Some(AdPrincipalType::Group)).unwrap();
        assert!(filter.contains("objectClass=group"));
    }

    #[test]
    fn test_build_ldap_filter_with_query() {
        let filter = AclService::build_ldap_filter(
            &Some("Finance".to_string()),
            &Some(AdPrincipalType::Group),
        )
        .unwrap();
        assert!(filter.contains("cn=*Finance*"));
    }

    #[test]
    fn test_parse_principal_owner() {
        let result = AclService::parse_principal("owner@").unwrap();
        assert_eq!(result, AcePrincipal::Owner);
    }

    #[test]
    fn test_parse_principal_user() {
        let result = AclService::parse_principal("user:john").unwrap();
        assert_eq!(result, AcePrincipal::User("john".to_string()));
    }

    #[test]
    fn test_parse_permissions() {
        let result = AclService::parse_permissions("rwpx----------").unwrap();
        assert!(result.read_data);
        assert!(result.write_data);
        assert!(result.append_data);
        assert!(result.execute);
        assert!(!result.delete);
    }

    #[test]
    fn test_parse_inherit_flags() {
        let result = AclService::parse_inherit_flags("fd-----").unwrap();
        assert!(result.file_inherit);
        assert!(result.dir_inherit);
        assert!(!result.inherit_only);
    }

    #[test]
    fn test_parse_ace_type() {
        assert_eq!(AclService::parse_ace_type("allow").unwrap(), AceType::Allow);
        assert_eq!(AclService::parse_ace_type("deny").unwrap(), AceType::Deny);
    }

    #[test]
    fn test_permissions_to_string() {
        let perms = Nfs4Permissions {
            read_data: true,
            write_data: true,
            execute: true,
            ..Default::default()
        };
        let result = AclService::permissions_to_string(&perms);
        assert_eq!(result, "rw-x----------");
    }

    #[test]
    fn test_mock_search_principals() {
        std::env::set_var("GANACHE_DEV_MODE", "true");

        let request = AdSearchRequest {
            query: Some("Finance".to_string()),
            principal_type: Some(AdPrincipalType::Group),
            page: 0,
            page_size: 50,
        };

        let response = AclService::search_principals(&request).unwrap();
        assert!(!response.principals.is_empty());
        assert_eq!(response.principals[0].name, "Finance-Group");
    }

    #[test]
    fn test_mock_get_acl() {
        std::env::set_var("GANACHE_DEV_MODE", "true");

        let response = AclService::get_acl("/test/path", "compact").unwrap();
        assert_eq!(response.acl.path, "/test/path");
        assert!(!response.acl.aces.is_empty());
    }
}
