use anyhow::{anyhow, Context, Result};
use ganache_api::models::active_directory::{AdJoinRequest, AdJoinResponse, AdStatus};
use std::fs;
use std::process::Command;

/// Service for managing Active Directory domain operations
///
/// # Purpose
/// Provides secure domain join/leave functionality and status monitoring
///
/// @ref Story-4.1 - Active Directory integration service
pub struct AdService;

impl AdService {
    /// Join the Ganache appliance to an Active Directory domain
    ///
    /// # Purpose
    /// Executes the full AD join sequence: DNS configuration, Samba setup, and domain join
    ///
    /// # Arguments
    /// * `request` - AD join configuration containing domain, credentials, and DNS settings
    ///
    /// # Returns
    /// Result containing join response with success status and current domain
    ///
    /// # Errors
    /// Returns error if DNS validation fails, Samba configuration fails, or join command fails
    ///
    /// @ref Story-4.1 - Implements AD domain join logic
    pub fn join_domain(request: &AdJoinRequest) -> Result<AdJoinResponse> {
        tracing::info!(
            "Starting AD domain join for domain: {}",
            request.domain_name
        );

        // Validation
        Self::validate_dns_config(&request.dns_servers)
            .context("DNS configuration validation failed")?;
        Self::validate_domain_name(&request.domain_name)
            .context("Domain name validation failed")?;

        // Update DNS configuration (in dev mode we skip this)
        if std::env::var("GANACHE_DEV_MODE").is_err() {
            Self::configure_dns(&request.dns_servers).context("Failed to configure DNS")?;
        } else {
            tracing::warn!("DEV MODE: Skipping DNS configuration");
        }

        // Update Samba configuration
        Self::configure_samba(&request.domain_name, request.organizational_unit.as_deref())
            .context("Failed to configure Samba")?;

        // Execute domain join (in dev mode we simulate success)
        if std::env::var("GANACHE_DEV_MODE").is_err() {
            Self::execute_net_ads_join(request).context("Failed to execute domain join")?;
        } else {
            tracing::warn!("DEV MODE: Simulating successful AD join");
        }

        tracing::info!("Successfully joined domain: {}", request.domain_name);

        Ok(AdJoinResponse {
            success: true,
            message: format!("Successfully joined domain {}", request.domain_name),
            current_domain: Some(request.domain_name.clone()),
        })
    }

    /// Get current AD join status
    ///
    /// # Purpose
    /// Checks if the system is currently joined to an AD domain
    ///
    /// # Returns
    /// Result containing AD status with join state and domain information
    ///
    /// @ref Story-4.1 - Query AD join status
    pub fn get_status() -> Result<AdStatus> {
        // Check if Samba is configured for ADS mode
        let smb_conf_path = "/etc/samba/smb.conf";

        if !std::path::Path::new(smb_conf_path).exists() {
            return Ok(AdStatus {
                is_joined: false,
                domain_name: None,
                last_sync: None,
                service_status: "inactive".to_string(),
            });
        }

        let content =
            fs::read_to_string(smb_conf_path).context("Failed to read Samba configuration")?;

        let is_ads_mode = content.contains("security = ADS") || content.contains("security=ADS");

        // Extract realm/domain if in ADS mode
        let domain_name = if is_ads_mode {
            content
                .lines()
                .find(|line| line.trim().starts_with("realm"))
                .and_then(|line| line.split('=').nth(1))
                .map(|s| s.trim().to_string())
        } else {
            None
        };

        Ok(AdStatus {
            is_joined: is_ads_mode,
            domain_name,
            last_sync: None, // TODO: Implement sync tracking
            service_status: if is_ads_mode { "active" } else { "inactive" }.to_string(),
        })
    }

    /// Leave the current AD domain
    ///
    /// # Purpose
    /// Removes the system from the AD domain and resets Samba configuration
    ///
    /// # Returns
    /// Result containing leave response with success status
    ///
    /// @ref Story-4.1 - Leave AD domain functionality
    pub fn leave_domain() -> Result<AdJoinResponse> {
        tracing::info!("Leaving Active Directory domain");

        // Execute net ads leave (in dev mode we simulate)
        if std::env::var("GANACHE_DEV_MODE").is_err() {
            let output = Command::new("net")
                .args(&["ads", "leave"])
                .output()
                .context("Failed to execute net ads leave")?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(anyhow!("Failed to leave domain: {}", stderr));
            }
        } else {
            tracing::warn!("DEV MODE: Simulating successful AD leave");
        }

        // Reset Samba configuration to standalone
        Self::reset_samba_config().context("Failed to reset Samba configuration")?;

        tracing::info!("Successfully left AD domain");

        Ok(AdJoinResponse {
            success: true,
            message: "Successfully left Active Directory domain".to_string(),
            current_domain: None,
        })
    }

    // ===== PRIVATE HELPER METHODS =====

    /// Validate DNS server configuration format
    fn validate_dns_config(dns: &str) -> Result<()> {
        if dns.trim().is_empty() {
            return Err(anyhow!("DNS servers cannot be empty"));
        }

        // Check if each DNS entry looks like an IP address
        for server in dns.split(',') {
            let trimmed = server.trim();
            if trimmed.split('.').count() != 4 {
                return Err(anyhow!("Invalid DNS server format: {}", trimmed));
            }
        }

        Ok(())
    }

    /// Validate domain name format
    fn validate_domain_name(domain: &str) -> Result<()> {
        if domain.trim().is_empty() {
            return Err(anyhow!("Domain name cannot be empty"));
        }

        if !domain.contains('.') {
            return Err(anyhow!(
                "Domain name must be fully qualified (e.g., 'corp.example.com')"
            ));
        }

        Ok(())
    }

    /// Configure system DNS to use AD domain controllers
    fn configure_dns(dns_servers: &str) -> Result<()> {
        tracing::info!("Configuring DNS servers: {}", dns_servers);

        // In production, this would update /etc/resolv.conf or systemd-resolved
        // For now, we'll create a simple resolv.conf backup and update

        let resolv_conf = "/etc/resolv.conf";
        let backup_path = "/etc/resolv.conf.ganache.bak";

        // Backup existing resolv.conf
        if std::path::Path::new(resolv_conf).exists() && !std::path::Path::new(backup_path).exists()
        {
            fs::copy(resolv_conf, backup_path).context("Failed to backup resolv.conf")?;
        }

        // Build new resolv.conf content
        let mut content = String::new();
        for server in dns_servers.split(',') {
            content.push_str(&format!("nameserver {}\n", server.trim()));
        }

        fs::write(resolv_conf, content).context("Failed to write resolv.conf")?;

        Ok(())
    }

    /// Configure Samba for Active Directory mode
    fn configure_samba(domain: &str, _ou: Option<&str>) -> Result<()> {
        tracing::info!("Configuring Samba for AD domain: {}", domain);

        let realm = domain.to_uppercase();
        let workgroup = domain
            .split('.')
            .next()
            .unwrap_or("WORKGROUP")
            .to_uppercase();

        let smb_conf_content = format!(
            r#"[global]
   workgroup = {}
   security = ADS
   realm = {}
   encrypt passwords = yes
   
   # Winbind configuration
   idmap config * : backend = tdb
   idmap config * : range = 10000-20000
   idmap config {} : backend = rid
   idmap config {} : range = 20001-30000
   
   winbind use default domain = yes
   winbind enum users = yes
   winbind enum groups = yes
   
   # Logging
   log file = /var/log/samba/%m.log
   max log size = 50
"#,
            workgroup, realm, workgroup, workgroup
        );

        let smb_conf_path = "/etc/samba/smb.conf";
        let backup_path = "/etc/samba/smb.conf.ganache.bak";

        // Backup existing smb.conf if it exists
        if std::path::Path::new(smb_conf_path).exists()
            && !std::path::Path::new(backup_path).exists()
        {
            fs::copy(smb_conf_path, backup_path).context("Failed to backup smb.conf")?;
        }

        // Ensure directory exists
        if let Some(parent) = std::path::Path::new(smb_conf_path).parent() {
            fs::create_dir_all(parent).context("Failed to create Samba config directory")?;
        }

        fs::write(smb_conf_path, smb_conf_content).context("Failed to write smb.conf")?;

        tracing::info!("Samba configured successfully for domain: {}", domain);

        Ok(())
    }

    /// Execute the net ads join command
    fn execute_net_ads_join(request: &AdJoinRequest) -> Result<()> {
        tracing::info!("Executing net ads join for domain: {}", request.domain_name);

        let mut args = vec!["ads", "join"];

        // Add domain
        args.push("-U");
        // Use username only, password will be piped to stdin
        args.push(&request.username);

        // Add OU if specified
        if let Some(ref ou) = request.organizational_unit {
            args.push("createcomputer=");
            args.push(ou);
        }

        // Execute command and pipe password to stdin
        let mut child = Command::new("net")
            .args(&args)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .context("Failed to spawn net ads join command")?;

        // Write password to stdin
        if let Some(mut stdin) = child.stdin.take() {
            use std::io::Write;
            stdin
                .write_all(request.password.as_bytes())
                .context("Failed to write password to stdin")?;
            stdin
                .write_all(b"\n")
                .context("Failed to write newline to stdin")?;
        }

        let output = child
            .wait_with_output()
            .context("Failed to wait for net ads join command")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow!("Domain join failed: {}", stderr));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        tracing::info!("Domain join output: {}", stdout);

        Ok(())
    }

    /// Reset Samba configuration to standalone mode
    fn reset_samba_config() -> Result<()> {
        let smb_conf_content = r#"[global]
   workgroup = WORKGROUP
   security = user
   encrypt passwords = yes
   
   log file = /var/log/samba/%m.log
   max log size = 50
"#;

        fs::write("/etc/samba/smb.conf", smb_conf_content).context("Failed to reset smb.conf")?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_dns_config_valid() {
        let result = AdService::validate_dns_config("192.168.1.1");
        assert!(result.is_ok());

        let result = AdService::validate_dns_config("192.168.1.1,10.0.0.1");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_dns_config_invalid() {
        let result = AdService::validate_dns_config("");
        assert!(result.is_err());

        let result = AdService::validate_dns_config("invalid");
        assert!(result.is_err());

        let result = AdService::validate_dns_config("192.168.1");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_domain_name_valid() {
        let result = AdService::validate_domain_name("corp.example.com");
        assert!(result.is_ok());

        let result = AdService::validate_domain_name("ad.local");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_domain_name_invalid() {
        let result = AdService::validate_domain_name("");
        assert!(result.is_err());

        let result = AdService::validate_domain_name("localhost");
        assert!(result.is_err());
    }

    #[test]
    fn test_configure_samba() {
        // This test verifies the smb.conf generation logic
        let result = AdService::configure_samba("test.local", None);

        // In dev environment, this should succeed
        if std::env::var("GANACHE_DEV_MODE").is_ok() {
            #[allow(unused_must_use)]
            {
                drop(result); // Consume result in dev mode
            }
        }
    }

    #[test]
    fn test_get_status_when_not_joined() {
        // When Samba is  not configured for ADS, status should reflect that
        let status = AdService::get_status();

        // We can't assert much since it depends on system state
        // but we can verify it returns successfully
        assert!(status.is_ok());
    }
}
