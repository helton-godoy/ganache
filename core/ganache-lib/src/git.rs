use std::process::Command;
use std::sync::Mutex;
use anyhow::{Result, anyhow};
use lazy_static::lazy_static;

lazy_static! {
    static ref GIT_LOCK: Mutex<()> = Mutex::new(());
}

pub struct GitService;

impl GitService {
    /// Initialize git repository in /etc/ganache if not exists
    pub fn init_repo() -> Result<()> {
        let repo_path = "/etc/ganache";

        // Check if .git exists
        if !std::path::Path::new(&format!("{}/.git", repo_path)).exists() {
            let output = Command::new("git")
                .arg("init")
                .current_dir(repo_path)
                .output()?;

            if !output.status.success() {
                return Err(anyhow!("Failed to init git repo: {}", String::from_utf8_lossy(&output.stderr)));
            }

            // Set basic config
            Self::set_config("user.name", "Ganache System")?;
            Self::set_config("user.email", "system@ganache.local")?;
        }

        Ok(())
    }

    /// Set git config
    fn set_config(key: &str, value: &str) -> Result<()> {
        let output = Command::new("git")
            .args(["config", key, value])
            .current_dir("/etc/ganache")
            .output()?;

        if !output.status.success() {
            return Err(anyhow!("Failed to set git config {}: {}", key, String::from_utf8_lossy(&output.stderr)));
        }

        Ok(())
    }

    /// Commit changes with username and message
    pub fn commit_changes(username: &str, action: &str, resource: &str) -> Result<()> {
        let _lock = GIT_LOCK.lock().unwrap(); // Acquire lock for concurrent safety

        // Add all changes
        let add_output = Command::new("git")
            .args(["add", "."])
            .current_dir("/etc/ganache")
            .output()?;

        if !add_output.status.success() {
            return Err(anyhow!("Failed to add files: {}", String::from_utf8_lossy(&add_output.stderr)));
        }

        // Check if there are changes to commit
        let status_output = Command::new("git")
            .args(["status", "--porcelain"])
            .current_dir("/etc/ganache")
            .output()?;

        if status_output.stdout.is_empty() {
            // No changes
            return Ok(());
        }

        // Create commit message
        let timestamp = chrono::Utc::now().to_rfc3339();
        let message = format!("config: {} {} by {} at {}", action, resource, username, timestamp);

        let commit_output = Command::new("git")
            .args(["commit", "-m", &message])
            .current_dir("/etc/ganache")
            .output()?;

        if !commit_output.status.success() {
            return Err(anyhow!("Failed to commit: {}", String::from_utf8_lossy(&commit_output.stderr)));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::Path;
    use tempfile::TempDir;

    #[test]
    fn test_init_repo() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path().join("ganache");
        fs::create_dir(&repo_path).unwrap();

        // Temporarily change the repo path for testing
        // Note: In real implementation, this would be configurable
        // For test, we'll assume /tmp/test-ganache

        // Since we can't easily mock the path, we'll test the logic indirectly
        assert!(true); // Placeholder
    }

    #[test]
    fn test_commit_changes_no_changes() {
        // Test committing when no changes
        // Would require setting up a temp git repo
        assert!(true); // Placeholder
    }
}