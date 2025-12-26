use anyhow::{Ok, Result};
use ganache_api::BootEnvironment;

/// Service for managing ZFS Boot Environments (BEs).
///
/// # Purpose
/// Lists and activates ZFS boot environments, enabling system rollback
/// to previous known-good states before applying updates or changes.
///
/// @REF Story-1.4 - Boot environment rollback
pub struct BootService;

impl BootService {
    /// Lists available ZFS Boot Environments
    /// In a real system, would parse `zfs list` or `beadm list`.
    /// Here we return a mock list.
    pub fn list_boot_environments() -> Result<Vec<BootEnvironment>> {
        // Mock data
        let bes = vec![
            BootEnvironment {
                name: "default".to_string(),
                active: "NR".to_string(), // Active Now & Reboot
                created: "2024-01-01 10:00".to_string(),
                space: "1.2G".to_string(),
                keep: true,
            },
            BootEnvironment {
                name: "pre-update-2024-12".to_string(),
                active: "-".to_string(),
                created: "2024-12-01 15:30".to_string(),
                space: "500M".to_string(),
                keep: false,
            },
            BootEnvironment {
                name: "initial-install".to_string(),
                active: "-".to_string(),
                created: "2023-11-15 09:00".to_string(),
                space: "800M".to_string(),
                keep: true,
            },
        ];

        // If we "activated" one previously via sticky mock state (file based maybe?), we could reflect it.
        // For simplicity, we'll just check if a certain file exists to toggle the "R" flag for testing purposes?
        // Actually, let's keep it simple statless mock for list for now, unless we need state for the test interaction.

        Ok(bes)
    }

    /// Activates a Boot Environment for next reboot
    /// In real system: `grub-reboot` or zfs properties
    pub fn activate_boot_environment(name: &str) -> Result<String> {
        // Validation: In real world, check if BE exists.

        // Mock Action
        println!("Mocking activation of BE: {}", name);

        Ok(format!(
            "Boot Environment '{}' activated for next reboot.",
            name
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_bes_returns_data() {
        let bes = BootService::list_boot_environments().unwrap();
        assert!(bes.len() >= 3);
        assert_eq!(bes[0].active, "NR");
    }

    #[test]
    fn test_activate_returns_success_message() {
        let result = BootService::activate_boot_environment("initial-install");
        assert!(result.is_ok());
        assert!(result.unwrap().contains("activated"));
    }
}
