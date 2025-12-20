use anyhow::{anyhow, Result};
use ganache_api::models::git_commit::{GitCommit, GitDiff, GitFileDiff};
use std::path::Path;
use std::process::Command;

/// GitHistoryService provides read-only operations for git repository history
///
/// # Purpose
/// Enables configuration timeline UI by exposing commit log and diff capabilities
///
/// @ref Story-3.2 - Git history service for configuration audit timeline
pub struct GitHistoryService;

impl GitHistoryService {
    /// Read commit log with pagination and filtering
    ///
    /// # Purpose
    /// Fetches paginated list of commits from the configuration repository
    ///
    /// # Arguments
    /// * `repo_path` - Path to git repository (typically /etc/ganache)
    /// * `limit` - Maximum commits to return (default 50, max 200)
    /// * `offset` - Number of commits to skip
    /// * `author_filter` - Optional author name filter
    /// * `date_from` - Optional start date (ISO 8601)
    /// * `date_to` - Optional end date (ISO 8601)
    ///
    /// # Returns
    /// Vec of GitCommit structs with metadata
    ///
    /// # Errors
    /// Returns error if repository doesn't exist or is corrupted
    ///
    /// @ref Story-3.2 - Server-side filtering and pagination for commit history
    pub fn read_commit_log<P: AsRef<Path>>(
        repo_path: P,
        limit: u32,
        offset: u32,
        author_filter: Option<&str>,
        date_from: Option<&str>,
        date_to: Option<&str>,
    ) -> Result<Vec<GitCommit>> {
        let path = repo_path.as_ref();

        // Validate repository exists
        if !path.join(".git").exists() {
            return Err(anyhow!("Configuration repository not yet created"));
        }

        // Cap limit at 200
        let limit = limit.min(200);

        // Build git log command with formatting
        let mut git_args = vec![
            "log".to_string(),
            "--pretty=format:%H|%an|%aI|%s".to_string(),
            format!("--skip={}", offset),
            format!("--max-count={}", limit),
        ];

        // Add author filter
        if let Some(author) = author_filter {
            if !author.is_empty() {
                git_args.push(format!("--author={}", author));
            }
        }

        // Add date range filters
        if let Some(date_from) = date_from {
            if !date_from.is_empty() {
                git_args.push(format!("--since={}", date_from));
            }
        }

        if let Some(date_to) = date_to {
            if !date_to.is_empty() {
                git_args.push(format!("--until={}", date_to));
            }
        }

        let output = Command::new("git")
            .args(&git_args)
            .current_dir(path)
            .output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            if stderr.contains("not a git repository") {
                return Err(anyhow!("Configuration repository not yet created"));
            }
            // Empty repository (no commits yet) is valid - return empty list
            if stderr.contains("does not have any commits yet")
                || stderr.contains("your current branch")
            {
                return Ok(Vec::new());
            }
            return Err(anyhow!("Git repository corrupted, check /etc/ganache/.git"));
        }

        let log_output = String::from_utf8_lossy(&output.stdout);
        let mut commits = Vec::new();

        for line in log_output.lines() {
            if line.is_empty() {
                continue;
            }

            let parts: Vec<&str> = line.split('|').collect();
            if parts.len() < 4 {
                continue;
            }

            // Get files changed count
            let files_changed = Self::count_files_changed(path, parts[0])?;

            commits.push(GitCommit {
                id: parts[0].to_string(),
                author: parts[1].to_string(),
                date: parts[2].to_string(),
                message: parts[3].to_string(),
                files_changed,
            });
        }

        Ok(commits)
    }

    /// Get diff for a specific commit
    ///
    /// # Purpose
    /// Retrieves unified diff showing changes in a specific commit
    ///
    /// # Arguments
    /// * `repo_path` - Path to git repository
    /// * `commit_id` - SHA-1 commit hash
    ///
    /// # Returns
    /// GitDiff struct with file-level diffs
    ///
    /// # Errors
    /// Returns error if commit doesn't exist or repository is corrupted
    ///
    /// @ref Story-3.2 - Visual comparison of configuration changes
    pub fn get_commit_diff<P: AsRef<Path>>(repo_path: P, commit_id: &str) -> Result<GitDiff> {
        let path = repo_path.as_ref();

        if !path.join(".git").exists() {
            return Err(anyhow!("Configuration repository not yet created"));
        }

        // Get numstat for file-level stats (additions/deletions)
        let numstat_output = Command::new("git")
            .args(["show", "--numstat", "--format=", commit_id])
            .current_dir(path)
            .output()?;

        if !numstat_output.status.success() {
            return Err(anyhow!("Failed to get diff for commit {}", commit_id));
        }

        let numstat = String::from_utf8_lossy(&numstat_output.stdout);
        let mut files = Vec::new();

        for line in numstat.lines() {
            if line.is_empty() {
                continue;
            }

            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() < 3 {
                continue;
            }

            let additions = parts[0].parse::<u32>().unwrap_or(0);
            let deletions = parts[1].parse::<u32>().unwrap_or(0);
            let filename = parts[2].to_string();

            // Get unified diff for this file
            let _diff_output = Command::new("git")
                .args(["show", &format!("{}:{}", commit_id, filename)])
                .current_dir(path)
                .output()?;

            // Get full diff content for the file
            let diff_content_output = Command::new("git")
                .args([
                    "diff",
                    &format!("{}^", commit_id),
                    commit_id,
                    "--",
                    &filename,
                ])
                .current_dir(path)
                .output()?;

            let diff_content = String::from_utf8_lossy(&diff_content_output.stdout).to_string();

            files.push(GitFileDiff {
                filename,
                additions,
                deletions,
                diff_content,
            });
        }

        Ok(GitDiff {
            commit_id: commit_id.to_string(),
            files,
        })
    }

    /// Count files changed in a commit (helper)
    fn count_files_changed<P: AsRef<Path>>(repo_path: P, commit_id: &str) -> Result<u32> {
        let output = Command::new("git")
            .args(["show", "--numstat", "--format=", commit_id])
            .current_dir(repo_path)
            .output()?;

        if !output.status.success() {
            return Ok(0);
        }

        let lines = String::from_utf8_lossy(&output.stdout)
            .lines()
            .filter(|l| !l.is_empty())
            .count();

        Ok(lines as u32)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ganache_lib::GitService;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_read_commit_log_empty_repo() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        GitService::init_repo_at(repo_path).unwrap();

        let commits =
            GitHistoryService::read_commit_log(repo_path, 50, 0, None, None, None).unwrap();

        assert_eq!(commits.len(), 0);
    }

    #[test]
    fn test_read_commit_log_with_commits() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        GitService::init_repo_at(repo_path).unwrap();

        // Create commits
        fs::write(repo_path.join("file1.conf"), "config1").unwrap();
        GitService::commit_changes_at(repo_path, "admin", "create", "file1.conf").unwrap();

        fs::write(repo_path.join("file2.conf"), "config2").unwrap();
        GitService::commit_changes_at(repo_path, "operator", "create", "file2.conf").unwrap();

        let commits =
            GitHistoryService::read_commit_log(repo_path, 50, 0, None, None, None).unwrap();

        assert_eq!(commits.len(), 2);
        assert!(commits[0].message.contains("file2.conf"));
        assert_eq!(commits[0].author, "Ganache System");
    }

    #[test]
    fn test_read_commit_log_with_pagination() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        GitService::init_repo_at(repo_path).unwrap();

        // Create 3 commits
        for i in 1..=3 {
            fs::write(
                repo_path.join(format!("file{}.conf", i)),
                format!("config{}", i),
            )
            .unwrap();
            GitService::commit_changes_at(repo_path, "admin", "create", &format!("file{}.conf", i))
                .unwrap();
        }

        // Get first 2 commits
        let commits =
            GitHistoryService::read_commit_log(repo_path, 2, 0, None, None, None).unwrap();
        assert_eq!(commits.len(), 2);

        // Get next commit (offset 2)
        let commits =
            GitHistoryService::read_commit_log(repo_path, 2, 2, None, None, None).unwrap();
        assert_eq!(commits.len(), 1);
    }

    #[test]
    fn test_read_commit_log_no_repo() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        let result = GitHistoryService::read_commit_log(repo_path, 50, 0, None, None, None);

        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Configuration repository not yet created"));
    }

    #[test]
    fn test_get_commit_diff() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        GitService::init_repo_at(repo_path).unwrap();

        fs::write(repo_path.join("test.conf"), "original content").unwrap();
        GitService::commit_changes_at(repo_path, "admin", "create", "test.conf").unwrap();

        // Get commit ID
        let commits =
            GitHistoryService::read_commit_log(repo_path, 1, 0, None, None, None).unwrap();
        assert_eq!(commits.len(), 1);

        let commit_id = &commits[0].id;

        // Get diff
        let diff = GitHistoryService::get_commit_diff(repo_path, commit_id).unwrap();

        assert_eq!(diff.commit_id, *commit_id);
        assert!(diff.files.len() > 0);
    }

    #[test]
    fn test_files_changed_count() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path();

        GitService::init_repo_at(repo_path).unwrap();

        // Create commit with 2 files
        fs::write(repo_path.join("file1.conf"), "config1").unwrap();
        fs::write(repo_path.join("file2.conf"), "config2").unwrap();
        GitService::commit_changes_at(repo_path, "admin", "create", "multiple files").unwrap();

        let commits =
            GitHistoryService::read_commit_log(repo_path, 1, 0, None, None, None).unwrap();

        assert_eq!(commits[0].files_changed, 2);
    }
}
