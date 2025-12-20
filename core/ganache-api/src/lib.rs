use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub mod models;
pub use models::config_change::ConfigChange;

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
    pub vip_address: String,
    pub network_interface: String,
    #[serde(default = "default_drbd_resource")]
    pub drbd_resource: String,
    #[serde(default)]
    pub dev_mode: bool,
}

fn default_drbd_resource() -> String {
    "r0".to_string()
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct ClusterStatus {
    pub state: String, // "configuring" | "syncing" | "ready" | "error" | "failover"
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

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BootEnvironment {
    pub name: String,
    pub active: String, // "N" (Now), "R" (Reboot), "NR" (Both), "-" (Inactive)
    pub created: String,
    pub space: String,
    pub keep: bool,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BootEnvironmentActivation {
    pub name: String,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct PoolConfig {
    pub name: String,
    pub device: String,
    pub compression: bool,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct PoolInfo {
    pub name: String,
    pub size: String,
    pub alloc: String,
    pub free: String,
    pub health: String,
    pub mountpoint: String,
    pub quota: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct StorageDevice {
    pub path: String,
    pub name: String,
    pub size: String,
    pub device_type: String, // "drbd" | "disk"
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct DatasetConfig {
    pub pool_name: String,
    pub name: String,
    pub compression: Option<String>,
    pub quota: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct DatasetInfo {
    pub pool: String,
    pub name: String,
    pub mountpoint: String,
    pub used: String,
    pub available: String,
    pub compression: String,
    pub quota: String,
}
