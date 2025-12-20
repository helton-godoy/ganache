use ganache_lib::GitService;
use std::process::Command;
use tempfile::TempDir;

#[test]
fn test_git_service_integration_flow() {
    let temp_dir = TempDir::new().unwrap();
    let repo_path = temp_dir.path();

    // 1. Init Repo
    GitService::init_repo_at(repo_path).expect("Failed to init repo");
    assert!(repo_path.join(".git").exists());

    // 2. Commit a Change
    GitService::commit_changes_at(repo_path, "test-user", "update", "system-config")
        .expect("Failed to commit");

    // 3. Verify Log
    let output = Command::new("git")
        .args(["log", "--oneline"])
        .current_dir(repo_path)
        .output()
        .expect("Failed to run git log");

    let log = String::from_utf8_lossy(&output.stdout);
    assert!(log.contains("config: update system-config by test-user"));
}
