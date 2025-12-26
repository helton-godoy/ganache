use anyhow::{anyhow, Result};
use lazy_static::lazy_static;
use std::path::Path;
use std::process::Command;
use std::sync::Mutex;

lazy_static! {
    static ref GIT_LOCK: Mutex<()> = Mutex::new(());
}

/// Default path for the git-backed configuration repository.
///
/// # Purpose
/// Defines the standard location where Ganache stores its versioned
/// configuration files. Can be overridden via GANACHE_CONFIG_DIR env var.
///
/// @REF Story-3.1 - Git-backed configuration engine
pub const DEFAULT_REPO_PATH: &str = "/etc/ganache";

/// Service for git-based configuration version control.
///
/// # Purpose
/// Manages a git repository for configuration files, providing init, commit,
/// and rollback operations with full audit trail support.
///
/// @REF Story-3.1 - Git-backed configuration engine
/// @REF Story-3.3 - One-click config rollback
pub struct GitService;

impl GitService {
    /// Get the current repository path (respects GANACHE_CONFIG_DIR env var)
    pub fn get_repo_path() -> std::path::PathBuf {
        if let Ok(path) = std::env::var("GANACHE_CONFIG_DIR") {
            std::path::PathBuf::from(path)
        } else {
            std::path::PathBuf::from(DEFAULT_REPO_PATH)
        }
    }

    /// Initialize git repository at the default path if not exists
    pub fn init_repo() -> Result<()> {
        Self::init_repo_at(Self::get_repo_path())
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
        Self::commit_changes_at(Self::get_repo_path(), username, action, resource)
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

    /// Rollback configuration to a specific commit using default repository path
    ///
    /// # Purpose
    /// One-click rollback of configuration to a previous state
    ///
    /// @ref Story-3.3 - Implements git-based configuration rollback
    pub fn rollback_config(commit_id: &str, username: &str, reason: &str) -> Result<String> {
        Self::rollback_config_to(Self::get_repo_path(), commit_id, username, reason)
    }

    /// Rollback configuration to a specific commit at a specific path
    ///
    /// # Purpose
    /// One-click rollback of configuration to a previous state with audit trail
    ///
    /// # Arguments
    /// * `repo_path` - Path to git repository
    /// * `commit_id` - Commit ID to rollback to
    /// * `username` - User performing the rollback
    /// * `reason` - Reason for rollback (audit trail)
    ///
    /// @ref Story-3.3 - Implements git-based configuration rollback with validation
    pub fn rollback_config_to<P: AsRef<Path>>(
        repo_path: P,
        commit_id: &str,
        username: &str,
        reason: &str,
    ) -> Result<String> {
        let _lock = GIT_LOCK.lock().unwrap(); // Acquire lock for concurrent safety
        let path = repo_path.as_ref();

        // Validate that commit exists
        let rev_parse_output = Command::new("git")
            .args(["rev-parse", "--verify", commit_id])
            .current_dir(path)
            .output()?;

        if !rev_parse_output.status.success() {
            return Err(anyhow!("Invalid commit ID: {}", commit_id));
        }

        // Get current HEAD for rollback commit message
        let current_head_output = Command::new("git")
            .args(["rev-parse", "HEAD"])
            .current_dir(path)
            .output()?;

        let current_head = String::from_utf8_lossy(&current_head_output.stdout)
            .trim()
            .to_string();

        // Checkout the target commit (detached HEAD)
        let checkout_output = Command::new("git")
            .args(["checkout", commit_id, "--", "."])
            .current_dir(path)
            .output()?;

        if !checkout_output.status.success() {
            return Err(anyhow!(
                "Failed to checkout commit {}: {}",
                commit_id,
                String::from_utf8_lossy(&checkout_output.stderr)
            ));
        }

        // Create rollback commit
        let timestamp = chrono::Local::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        let rollback_message = format!(
            "config: ROLLBACK to {} by {} at {} - Reason: {} (from {})",
            &commit_id[..7.min(commit_id.len())],
            username,
            timestamp,
            reason,
            &current_head[..7.min(current_head.len())]
        );

        let commit_output = Command::new("git")
            .args(["commit", "-a", "-m", &rollback_message])
            .current_dir(path)
            .output()?;

        if !commit_output.status.success() {
            // If no changes (already at target state), allow empty commit
            let empty_commit_output = Command::new("git")
                .args(["commit", "--allow-empty", "-m", &rollback_message])
                .current_dir(path)
                .output()?;

            if !empty_commit_output.status.success() {
                return Err(anyhow!(
                    "Failed to create rollback commit: {}",
                    String::from_utf8_lossy(&empty_commit_output.stderr)
                ));
            }
        }

        // Get new HEAD commit ID
        let new_head_output = Command::new("git")
            .args(["rev-parse", "HEAD"])
            .current_dir(path)
            .output()?;

        let rollback_commit_id = String::from_utf8_lossy(&new_head_output.stdout)
            .trim()
            .to_string();

        Ok(rollback_commit_id)
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

    #[test]
    fn test_rollback_config_flow() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        // Init repo
        GitService::init_repo_at(repo_path).unwrap();

        // Create initial config
        fs::write(repo_path.join("cluster.conf"), "mode=standard\nnode_id=1").unwrap();
        GitService::commit_changes_at(repo_path, "admin", "create", "cluster.conf").unwrap();

        // Get the first commit ID
        let first_commit_output = Command::new("git")
            .args(["rev-parse", "HEAD"])
            .current_dir(repo_path)
            .output()
            .unwrap();
        let first_commit = String::from_utf8_lossy(&first_commit_output.stdout)
            .trim()
            .to_string();

        // Make a second change
        fs::write(
            repo_path.join("cluster.conf"),
            "mode=compatibility\nnode_id=2",
        )
        .unwrap();
        GitService::commit_changes_at(repo_path, "admin", "update", "cluster.conf").unwrap();

        // Rollback to first commit
        let rollback_commit_id =
            GitService::rollback_config_to(repo_path, &first_commit, "admin", "Testing rollback")
                .unwrap();

        // Verify rollback commit was created
        assert!(!rollback_commit_id.is_empty());
        assert_ne!(rollback_commit_id, first_commit);

        // Verify config was restored
        let restored_content = fs::read_to_string(repo_path.join("cluster.conf")).unwrap();
        assert_eq!(restored_content, "mode=standard\nnode_id=1");

        // Verify rollback commit message
        let log_output = Command::new("git")
            .args(["log", "--oneline", "-1"])
            .current_dir(repo_path)
            .output()
            .unwrap();
        let log = String::from_utf8_lossy(&log_output.stdout);
        assert!(log.contains("ROLLBACK"));
        assert!(log.contains("admin"));
        assert!(log.contains("Testing rollback"));
    }

    #[test]
    fn test_rollback_invalid_commit() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();
        GitService::init_repo_at(repo_path).unwrap();

        // Try to rollback to invalid commit
        let result =
            GitService::rollback_config_to(repo_path, "invalid_commit_id", "admin", "Test");
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Invalid commit ID"));
    }
}
