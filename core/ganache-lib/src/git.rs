use anyhow::{anyhow, Result};
use lazy_static::lazy_static;
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;

lazy_static! {
    static ref GIT_LOCK: Mutex<()> = Mutex::new(());
}

pub const DEFAULT_REPO_PATH: &str = "/etc/ganache";

pub struct GitService;

impl GitService {
    /// Initialize git repository at the default path if not exists
    pub fn init_repo() -> Result<()> {
        Self::init_repo_at(DEFAULT_REPO_PATH)
    }

    /// Initialize git repository at the specified path if not exists
    pub fn init_repo_at<P: AsRef<Path>>(repo_path: P) -> Result<()> {
        let path = repo_path.as_ref();

        // Ensure directory exists
        if !path.exists() {
            std::fs::create_dir_all(path)?;
        }

        // Check if .git exists
        if !path.join(".git").exists() {
            let output = Command::new("git").arg("init").current_dir(path).output()?;

            if !output.status.success() {
                return Err(anyhow!(
                    "Failed to init git repo: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }

            // Set basic config
            Self::set_config(path, "user.name", "Ganache System")?;
            Self::set_config(path, "user.email", "system@ganache.local")?;
        }

        Ok(())
    }

    /// Set git config
    fn set_config<P: AsRef<Path>>(repo_path: P, key: &str, value: &str) -> Result<()> {
        let output = Command::new("git")
            .args(["config", key, value])
            .current_dir(repo_path)
            .output()?;

        if !output.status.success() {
            return Err(anyhow!(
                "Failed to set git config {}: {}",
                key,
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        Ok(())
    }

    /// Commit changes using default repository path
    pub fn commit_changes(username: &str, action: &str, resource: &str) -> Result<()> {
        Self::commit_changes_at(DEFAULT_REPO_PATH, username, action, resource)
    }

    /// Commit changes with username and message at specific path
    pub fn commit_changes_at<P: AsRef<Path>>(
        repo_path: P,
        username: &str,
        action: &str,
        resource: &str,
    ) -> Result<()> {
        let _lock = GIT_LOCK.lock().unwrap(); // Acquire lock for concurrent safety
        let path = repo_path.as_ref();

        // Add all changes
        let add_output = Command::new("git")
            .args(["add", "."])
            .current_dir(path)
            .output()?;

        if !add_output.status.success() {
            // If it's not a git repo, or other error, return it
            return Err(anyhow!(
                "Failed to git add: {}",
                String::from_utf8_lossy(&add_output.stderr)
            ));
        }

        // Commit with message structure: "config: [action] [resource] by [username] at [timestamp]"
        let timestamp = chrono::Local::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        let message = format!(
            "config: {} {} by {} at {}",
            action, resource, username, timestamp
        );

        let commit_output = Command::new("git")
            .args(["commit", "--allow-empty", "-m", &message])
            .current_dir(path)
            .output()?;

        if !commit_output.status.success() {
            return Err(anyhow!(
                "Failed to commit: {}",
                String::from_utf8_lossy(&commit_output.stderr)
            ));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_init_repo_creates_git_dir() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        // Init repo
        GitService::init_repo_at(repo_path).unwrap();

        // Verify .git exists
        assert!(repo_path.join(".git").exists());

        // Verify config
        let output = Command::new("git")
            .args(["config", "user.name"])
            .current_dir(repo_path)
            .output()
            .unwrap();

        assert_eq!(
            String::from_utf8_lossy(&output.stdout).trim(),
            "Ganache System"
        );
    }

    #[test]
    fn test_commit_changes_flow() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        // Init
        GitService::init_repo_at(repo_path).unwrap();

        // Create a file
        fs::write(repo_path.join("test.conf"), "some config").unwrap();

        // Commit
        GitService::commit_changes_at(repo_path, "admin", "update", "test.conf").unwrap();

        // Verify commit log
        let output = Command::new("git")
            .args(["log", "--oneline"])
            .current_dir(repo_path)
            .output()
            .unwrap();

        let log = String::from_utf8_lossy(&output.stdout);
        assert!(log.contains("config: update test.conf by admin"));
    }

    #[test]
    fn test_commit_no_changes_is_safe() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();
        GitService::init_repo_at(repo_path).unwrap();

        // Commit without changes should succeed (noop)
        let result = GitService::commit_changes_at(repo_path, "admin", "noop", "nothing");
        assert!(result.is_ok());
    }
}
