use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct HardwareInfo {
    /// True if a supported RAID controller is detected (e.g., PERC 6/i)
    pub has_raid: bool,
    /// Name of the detected controller, if any
    pub controller_name: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct ClusterConfig {
    pub mode: String, // "compatibility" | "standard"
    pub node_id: i32,
    pub peer_ip: String,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct ClusterStatus {
    pub state: String, // "configuring" | "syncing" | "ready" | "error"
    pub progress: f32, // 0.0 to 1.0
    pub message: String,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SystemResources {
    pub total_memory_bytes: u64,
    pub used_memory_bytes: u64,
    pub arc_target_bytes: u64,
    pub status: String,
}
