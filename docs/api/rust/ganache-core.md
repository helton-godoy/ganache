# Documentation: ganache-core

## File: `src/auth.rs`

Simple authenticated user extractor for configuration change tracking

This extractor reads the username from the `X-Auth-User` HTTP header.
If the header is not present or invalid, it defaults to "system" for
backward compatibility.

# Usage

Add `AuthenticatedUser` as a parameter to any Axum handler:

```rust,ignore
async fn my_handler(user: AuthenticatedUser, Json(payload): Json<MyPayload>) {
    println!("User: {}", user.username);
}
```

# Note

This is a **placeholder implementation** until a full authentication system
(OAuth2, JWT, session-based auth, etc.) is implemented in a future story.
The current implementation trusts the client to send the correct header.

@ref Story-3.1 - Git-backed configuration engine with user attribution

```rust
pub struct AuthenticatedUser
```

---

## File: `src/services/git_service.rs`

High-level wrapper for git operations in the core daemon.

# Purpose

Provides a simplified interface for git-backed configuration management,
handling initialization and commit operations with proper error logging.

@REF Story-3.1 - Git-backed configuration engine

```rust
pub struct GitServiceIntegration;
```

---

Initialize the git repository

```rust
pub fn init()
```

---

Commit changes with a specific username (mocked for now until auth context is ready)

```rust
pub fn commit(username: &str, action: &str, resource: &str)
```

---

Helper to commit system operations (internal system actions)

```rust
pub fn commit_system(action: &str, resource: &str)
```

---

## File: `src/services/git_history_service.rs`

GitHistoryService provides read-only operations for git repository history

# Purpose

Enables configuration timeline UI by exposing commit log and diff capabilities

@ref Story-3.2 - Git history service for configuration audit timeline

```rust
pub struct GitHistoryService;
```

---

Read commit log with pagination and filtering

# Purpose

Fetches paginated list of commits from the configuration repository

# Arguments

- `repo_path` - Path to git repository (typically /etc/ganache)
- `limit` - Maximum commits to return (default 50, max 200)
- `offset` - Number of commits to skip
- `author_filter` - Optional author name filter
- `date_from` - Optional start date (ISO 8601)
- `date_to` - Optional end date (ISO 8601)

# Returns

Vec of GitCommit structs with metadata

# Errors

Returns error if repository doesn't exist or is corrupted

@ref Story-3.2 - Server-side filtering and pagination for commit history

```rust
pub fn read_commit_log<P: AsRef<Path>>(
```

---

Get diff for a specific commit

# Purpose

Retrieves unified diff showing changes in a specific commit

# Arguments

- `repo_path` - Path to git repository
- `commit_id` - SHA-1 commit hash

# Returns

GitDiff struct with file-level diffs

# Errors

Returns error if commit doesn't exist or repository is corrupted

@ref Story-3.2 - Visual comparison of configuration changes

```rust
pub fn get_commit_diff<P: AsRef<Path>>(repo_path: P, commit_id: &str) -> Result<GitDiff>
```

---
