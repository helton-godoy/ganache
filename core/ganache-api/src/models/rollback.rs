use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Rollback request payload
///
/// # Purpose
/// Request to rollback configuration to a specific git commit
///
/// @ref Story-3.3 - Implements rollback request model for one-click config rollback
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct RollbackRequest {
    /// Commit ID to rollback to
    pub commit_id: String,
    /// Reason for rollback (for audit trail)
    pub reason: String,
}

/// Rollback response payload
///
/// # Purpose
/// Confirmation of successful rollback operation
///
/// @ref Story-3.3 - Rollback success response
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct RollbackResponse {
    /// Success status
    pub success: bool,
    /// Rollback commit ID
    pub rollback_commit_id: String,
    /// Message describing the rollback
    pub message: String,
}
