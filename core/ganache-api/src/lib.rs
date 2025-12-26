use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub mod models;
pub use models::active_directory::{AdJoinRequest, AdJoinResponse, AdStatus};
pub use models::config_change::ConfigChange;
pub use models::rollback::{RollbackRequest, RollbackResponse};

/// Hardware detection information for RAID controller identification.
///
/// # Purpose
/// Used to detect legacy RAID hardware (PERC 6/i, H700) and determine
/// if the system should run in compatibility mode.
///
/// @REF Story-1.1 - Detect RAID hardware and recommend mode
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct HardwareInfo {
    /// True if a supported RAID controller is detected (e.g., PERC 6/i)
    pub has_raid: bool,
    /// Name of the detected controller, if any
    pub controller_name: Option<String>,
}

/// Configuration for twin-node HA cluster setup.
///
/// # Purpose
/// Defines the cluster topology including node identification, peer networking,
/// virtual IP configuration, and DRBD replication settings.
///
/// @REF Story-2.1 - Twin-node cluster initialization
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

/// Real-time status of the HA cluster.
///
/// # Purpose
/// Provides current cluster state, synchronization progress, and status messages
/// for monitoring and UI display.
///
/// @REF Story-2.1 - Twin-node cluster initialization
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct ClusterStatus {
    pub state: String, // "configuring" | "syncing" | "ready" | "error" | "failover"
    pub progress: f32, // 0.0 to 1.0
    pub message: String,
}

/// System resource metrics including memory and ZFS ARC configuration.
///
/// # Purpose
/// Reports system memory usage and ZFS Adaptive Replacement Cache (ARC) tuning
/// parameters for auto-tuning and monitoring.
///
/// @REF Story-1.3 - System resource auto-tuning
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SystemResources {
    pub total_memory_bytes: u64,
    pub used_memory_bytes: u64,
    pub arc_target_bytes: u64,
    pub status: String,
}

/// ZFS Boot Environment metadata.
///
/// # Purpose
/// Represents a ZFS boot environment (BE) snapshot, enabling system rollback
/// to previous known-good states.
///
/// @REF Story-1.4 - Boot environment rollback
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BootEnvironment {
    pub name: String,
    pub active: String, // "N" (Now), "R" (Reboot), "NR" (Both), "-" (Inactive)
    pub created: String,
    pub space: String,
    pub keep: bool,
}

/// Request to activate a specific boot environment.
///
/// # Purpose
/// Used to request activation of a boot environment for next reboot.
///
/// @REF Story-1.4 - Boot environment rollback
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BootEnvironmentActivation {
    pub name: String,
}

/// Configuration for creating a new ZFS pool.
///
/// # Purpose
/// Specifies the pool name, target device, and compression settings
/// for ZFS pool creation on DRBD devices.
///
/// @REF Story-2.2 - ZFS pool creation on DRBD
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct PoolConfig {
    pub name: String,
    pub device: String,
    pub compression: bool,
}

/// ZFS pool status and capacity information.
///
/// # Purpose
/// Reports pool health, capacity usage, and quota configuration
/// for monitoring and management UI.
///
/// @REF Story-2.2 - ZFS pool creation on DRBD
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

/// Storage device information (DRBD or disk).
///
/// # Purpose
/// Describes available storage devices for pool creation,
/// distinguishing between DRBD replicated devices and local disks.
///
/// @REF Story-2.2 - ZFS pool creation on DRBD
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct StorageDevice {
    pub path: String,
    pub name: String,
    pub size: String,
    pub device_type: String, // "drbd" | "disk"
}

/// Configuration for creating a new ZFS dataset.
///
/// # Purpose
/// Specifies dataset name, compression, and quota settings
/// for creating child datasets within a ZFS pool.
///
/// @REF Story-2.2 - ZFS pool creation on DRBD
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct DatasetConfig {
    pub pool_name: String,
    pub name: String,
    pub compression: Option<String>,
    pub quota: Option<String>,
}

/// ZFS dataset status and capacity information.
///
/// # Purpose
/// Reports dataset usage, mount point, and configuration
/// for management UI and monitoring.
///
/// @REF Story-2.2 - ZFS pool creation on DRBD
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
