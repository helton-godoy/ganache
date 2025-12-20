use crate::GitService;
use anyhow::Result;
use serde::Serialize;
use std::fs;
use std::path::Path;

pub struct ConfigDb;

impl ConfigDb {
    /// Save configuration to a JSON file in the git-backed directory and commit
    pub fn save_and_commit<T: Serialize>(
        filename: &str,
        data: &T,
        username: &str,
        action: &str,
        resource: &str,
    ) -> Result<()> {
        let root = crate::git::DEFAULT_REPO_PATH;
        let db_dir = Path::new(root).join("db");

        // Ensure db directory exists
        if !db_dir.exists() {
            fs::create_dir_all(&db_dir)?;
        }

        let file_path = db_dir.join(filename);
        let json = serde_json::to_string_pretty(data)?;
        fs::write(file_path, json)?;

        // Trigger git commit
        GitService::commit_changes(username, action, resource)
    }

    /// Delete a configuration file and commit
    pub fn delete_and_commit(
        filename: &str,
        username: &str,
        action: &str,
        resource: &str,
    ) -> Result<()> {
        let root = crate::git::DEFAULT_REPO_PATH;
        let file_path = Path::new(root).join("db").join(filename);

        if file_path.exists() {
            fs::remove_file(file_path)?;
        }

        // Trigger git commit
        GitService::commit_changes(username, action, resource)
    }
}
