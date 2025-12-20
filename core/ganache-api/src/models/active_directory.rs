use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Request payload for joining an Active Directory domain
///
/// # Purpose
/// Contains all necessary information to join a Ganache appliance to an AD domain
///
/// @ref Story-4.1 - Active Directory domain join request model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct AdJoinRequest {
    /// Active Directory domain name (e.g., "corp.example.com")
    pub domain_name: String,
    /// Domain administrator username
    pub username: String,
    /// Domain administrator password (encrypted in transit via HTTPS)
    pub password: String,
    /// DNS server IP addresses (comma-separated, e.g., "192.168.1.1,192.168.1.2")
    pub dns_servers: String,
    /// Optional organizational unit for computer account (e.g., "OU=Servers,DC=corp,DC=example,DC=com")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub organizational_unit: Option<String>,
}

/// Response after joining AD domain
///
/// # Purpose
/// Provides feedback about AD join operation success/failure
///
/// @ref Story-4.1 - Active Directory domain join response model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct AdJoinResponse {
    /// Success status of the join operation
    pub success: bool,
    /// Detailed status message
    pub message: String,
    /// Current AD domain name if successfully joined
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_domain: Option<String>,
}

/// Active Directory status information
///
/// # Purpose
/// Provides current AD join state and service health
///
/// @ref Story-4.1 - Active Directory status model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct AdStatus {
    /// Whether the system is currently joined to a domain
    pub is_joined: bool,
    /// Current domain name if joined
    #[serde(skip_serializing_if = "Option::is_none")]
    pub domain_name: Option<String>,
    /// Last successful sync timestamp (ISO 8601 format)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_sync: Option<String>,
    /// AD service status: "active", "inactive", "error"
    pub service_status: String,
}

// ===== ACL Models (Story 4.2) =====

/// Type of AD principal (user or group)
///
/// # Purpose
/// Distinguishes between user and group principals in ACL management
///
/// @ref Story-4.2 - ACL principal type enum
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AdPrincipalType {
    /// AD user account
    User,
    /// AD group
    Group,
}

/// Active Directory user or group principal
///
/// # Purpose
/// Represents an AD principal (user or group) for ACL assignment
///
/// @ref Story-4.2 - ACL principal model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct AdPrincipal {
    /// Principal name (e.g., "john.doe" or "Finance-Group")
    pub name: String,
    /// Principal type (user or group)
    pub principal_type: AdPrincipalType,
    /// Full distinguished name (DN) from LDAP
    pub distinguished_name: String,
    /// Security Identifier (SID) for the principal
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sid: Option<String>,
}

/// Request to search/list AD users and groups
///
/// # Purpose
/// Provides filtering and pagination for AD principal searches
///
/// @ref Story-4.2 - ACL search request model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct AdSearchRequest {
    /// Search query (filters by name, case-insensitive substring match)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
    /// Filter by principal type (user, group, or both if None)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub principal_type: Option<AdPrincipalType>,
    /// Page number (0-indexed, default: 0)
    #[serde(default)]
    pub page: u32,
    /// Page size (default: 50, max: 1000)
    #[serde(default = "default_page_size")]
    pub page_size: u32,
}

fn default_page_size() -> u32 {
    50
}

/// Response containing paginated AD principals
///
/// # Purpose
/// Returns search results with pagination metadata
///
/// @ref Story-4.2 - ACL search response model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct AdSearchResponse {
    /// List of matching principals
    pub principals: Vec<AdPrincipal>,
    /// Current page number (0-indexed)
    pub page: u32,
    /// Number of items per page
    pub page_size: u32,
    /// Total number of matching principals
    pub total_count: u32,
    /// Whether there are more pages available
    pub has_more: bool,
}
