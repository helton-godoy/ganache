use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct HardwareInfo {
    /// True if a supported RAID controller is detected (e.g., PERC 6/i)
    pub has_raid: bool,
    /// Name of the detected controller, if any
    pub controller_name: Option<String>,
}
