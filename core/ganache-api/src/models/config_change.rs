use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Represents a configuration change event for audit logging.
///
/// # Purpose
/// Tracks all configuration modifications in the git-backed config system,
/// providing a complete audit trail of who changed what and when.
///
/// @REF Story-3.1 - Git-backed configuration engine audit trail
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct ConfigChange {
    pub id: String,
    pub timestamp: String,
    pub user: String,
    pub action: String,
    pub resource: String,
    pub details: Option<String>,
}
