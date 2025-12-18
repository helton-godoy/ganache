use ganache_api::SystemResources;
use sysinfo::System;
use tracing::{info, warn};

pub struct MemoryService;

impl MemoryService {
    /// Calculate the target ZFS ARC size based on system RAM rules.
    ///
    /// Policies:
    /// 1. RAM < 32GB: ARC = 50% of RAM
    /// 2. RAM >= 32GB: ARC = RAM - 2GB
    /// 3. Safety Constraint: Ensure at least 4GB is reserved for OS + Middleware.
    pub fn calculate_arc_target(total_ram_bytes: u64) -> u64 {
        let gib = 1024 * 1024 * 1024;
        let reserved_min = 4 * gib;

        // Base calculation
        let mut target = if total_ram_bytes < 32 * gib {
            total_ram_bytes / 2
        } else {
            if total_ram_bytes > 2 * gib {
                total_ram_bytes - (2 * gib)
            } else {
                0
            }
        };

        // Apply safety margin (Reserve 4GB for OS)
        if total_ram_bytes > reserved_min {
            let max_allowed = total_ram_bytes - reserved_min;
            if target > max_allowed {
                warn!(
                    "Calculated ARC target ({:.2} GB) violates 4GB OS reserve. Clamping to {:.2} GB.",
                    target as f64 / gib as f64,
                    max_allowed as f64 / gib as f64
                );
                target = max_allowed;
            }
        } else {
            warn!(
                "System RAM ({:.2} GB) is below 4GB Safety Reserve! Disabling ARC (0).",
                total_ram_bytes as f64 / gib as f64
            );
            target = 0;
        }

        target
    }

    /// Mock applying the tuning
    pub async fn apply_arc_tuning() -> SystemResources {
        let mut sys = System::new_all();
        sys.refresh_memory();

        // Rust sysinfo 0.30+ docs: `total_memory()` returns BYTES.
        let total_ram = sys.total_memory();

        let target = Self::calculate_arc_target(total_ram);

        info!(
            "Auto-Tuning ZFS ARC: Target = {:.2} GB (Total RAM: {:.2} GB)",
            target as f64 / (1024.0 * 1024.0 * 1024.0),
            total_ram as f64 / (1024.0 * 1024.0 * 1024.0)
        );

        SystemResources {
            total_memory_bytes: total_ram,
            used_memory_bytes: sys.used_memory(), // also bytes
            arc_target_bytes: target,
            status: "tuned".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1024 * 1024 * 1024;

    #[test]
    fn test_arc_under_32gb() {
        assert_eq!(MemoryService::calculate_arc_target(16 * GIB), 8 * GIB);
    }

    #[test]
    fn test_arc_over_32gb() {
        assert_eq!(MemoryService::calculate_arc_target(64 * GIB), 60 * GIB);
    }

    #[test]
    fn test_arc_low_memory_safety() {
        assert_eq!(MemoryService::calculate_arc_target(6 * GIB), 2 * GIB);
    }

    #[test]
    fn test_arc_exact_boundary() {
        assert_eq!(MemoryService::calculate_arc_target(32 * GIB), 28 * GIB);
    }
}
