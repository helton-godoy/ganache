use ganache_lib::GitService;
use tracing::warn;

pub struct GitServiceIntegration;

impl GitServiceIntegration {
    /// Initialize the git repository
    pub fn init() {
        if let Err(e) = GitService::init_repo() {
            warn!("Failed to initialize git repository: {}", e);
        }
    }

    /// Commit changes with a specific username (mocked for now until auth context is ready)
    pub fn commit(username: &str, action: &str, resource: &str) {
        if let Err(e) = GitService::commit_changes(username, action, resource) {
            warn!("Failed to commit {} {}: {}", action, resource, e);
        }
    }

    /// Helper to commit system operations (internal system actions)
    pub fn commit_system(action: &str, resource: &str) {
        Self::commit("system", action, resource);
    }
}
