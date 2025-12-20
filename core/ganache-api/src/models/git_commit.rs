use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// GitCommit represents a single commit in the configuration repository
///
/// # Purpose
/// Provides commit metadata for the configuration timeline UI
///
/// @ref Story-3.2 - Implements GitCommit model for configuration audit timeline
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct GitCommit {
    /// The commit hash (SHA-1)
    pub id: String,
    /// Author of the commit
    pub author: String,
    /// ISO 8601 formatted date
    pub date: String,
    /// Commit message
    pub message: String,
    /// Number of files changed in this commit
    pub files_changed: u32,
}

/// GitDiff represents the diff content for a specific commit
///
/// # Purpose
/// Provides unified diff view for commit changes in the UI
///
/// @ref Story-3.2 - Implements GitDiff model for visual comparison of configuration changes
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct GitDiff {
    /// The commit hash this diff belongs to
    pub commit_id: String,
    /// List of changed files with their diffs
    pub files: Vec<GitFileDiff>,
}

/// GitFileDiff represents changes to a single file
///
/// # Purpose
/// Contains file-level diff metadata and content
///
/// @ref Story-3.2 - File-level diff details for expandable sections in CommitDiffModal
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct GitFileDiff {
    /// Filename relative to repository root
    pub filename: String,
    /// Number of lines added
    pub additions: u32,
    /// Number of lines deleted
    pub deletions: u32,
    /// Unified diff format content
    pub diff_content: String,
}
