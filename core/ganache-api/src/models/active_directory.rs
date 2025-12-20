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
