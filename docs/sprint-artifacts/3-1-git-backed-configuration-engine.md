# Story 3.1: git-backed-configuration-engine

Status: ready-for-dev

## Story

As a System Developer/Admin,
I want the system to automatically commit every configuration change to a local Git repository,
so that I have an immutable history of who changed what and when, without manual effort.

## Acceptance Criteria

1. **Given** the system middleware is running
   **When** any configuration file in `/etc/ganache` or database entry is modified via the UI/API
   **Then** the system must trigger a `git commit` operation
   **And** include the authenticated username and timestamp in the commit message
   **And** ensure the repository remains consistent even if concurrent edits occur

## Tasks / Subtasks

- [ ] Implement Git repository initialization in `/etc/ganache`
  - [ ] Create .git directory if not exists
  - [ ] Set up basic git config (user.name, user.email)
- [ ] Create GitService module in ganache-lib
  - [ ] Add git commit function with username and message
  - [ ] Handle concurrent commits with locking mechanism
- [ ] Integrate GitService in ganache-core
  - [ ] Hook into configuration change endpoints
  - [ ] Extract authenticated user from request context
- [ ] Add database change tracking
  - [ ] Implement database diff detection
  - [ ] Serialize changes for commit
- [ ] Update OpenAPI spec for any new endpoints
- [ ] Add unit tests for GitService
- [ ] Add integration tests for configuration commits

## Dev Notes

- Relevant architecture patterns and constraints: Backend Rust daemon handles privileged operations, frontend Next.js for UI. Use ganache-lib for system wrappers, ganache-core for orchestration.
- Source tree components to touch: core/ganache-lib/src/ (add git module), core/ganache-core/src/ (integrate service), src/api/ (update OpenAPI if needed)
- Testing standards summary: Unit tests in Rust with cargo test, integration tests with Playwright for UI flows, burn-in tests for critical paths.
- Commit message format: "config: [action] [resource] by [username] at [timestamp]" (e.g., "config: update network settings by admin at 2025-12-20T01:45:20Z")

### Project Structure Notes

- Alignment with unified project structure: Follow core/ workspace for Rust crates, src/ for frontend.
- Detected conflicts or variances: Ensure git operations are wrapped securely in ganache-lib to prevent command injection.

### References

- Epic 3 requirements: [Source: docs/epics.md#Epic-3-Config-Time-Machine]
- Architecture backend: [Source: docs/architecture.md#3.-Arquitetura-de-Backend-(Rust)]
- Security model: [Source: docs/architecture.md#6.-Modelo-de-Segurança]
- Testing strategy: [Source: docs/architecture.md#7.-Qualidade-e-Automação-(CI/CD)]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

x-ai/grok-code-fast-1

### Debug Log References

### Completion Notes List

### File List

- core/ganache-lib/src/git.rs (new)
- core/ganache-core/src/services/git_service.rs (new)
- core/ganache-api/src/models/config_change.rs (new)
- src/api/generated/ (regenerate after OpenAPI update)

## Developer Context Section

### Technical Requirements

- Implement Git-backed configuration versioning for all system changes
- Support concurrent configuration edits without repository corruption
- Include authenticated user context in commit messages
- Handle both file-based (/etc/ganache) and database configuration changes
- Ensure atomic commits for multi-file changes
- Integrate with existing audit logging system to correlate git commits with system logs
- Implement merge conflict resolution strategy for concurrent configuration changes

### Architecture Compliance

- Use ganache-lib for secure git command execution
- Follow Contract Prime: Update ganache-api first, then regenerate OpenAPI
- Maintain separation: lib for wrappers, core for orchestration, api for contracts
- Implement as privileged operation through Rust daemon

### Library Framework Requirements

- Use standard git commands via shell execution (secure wrapper)
- Consider libgit2-rust for future native implementation
- No external dependencies beyond existing Rust ecosystem
- Follow existing error handling patterns with Result<T, E>

### File Structure Requirements

- Configuration repository at /etc/ganache/.git
- Follow existing /etc/ganache structure for config files
- Database changes serialized to /etc/ganache/db/ for versioning
- Maintain compatibility with existing file permissions

### Testing Requirements

- Unit tests for git operations in ganache-lib
- Integration tests for full commit workflow
- Concurrent edit stress testing
- Playwright E2E tests for UI-triggered commits
- Burn-in testing for critical commit paths

## Previous Story Intelligence

N/A - First story in Epic 3

## Git Intelligence Summary

Recent commits show consistent use of conventional commit messages and atomic changes. Patterns include:

- Feature implementations in separate commits
- Bug fixes with clear descriptions
- No concurrent edit conflicts observed in recent history

## Latest Tech Information

Git remains the standard for version control with stable APIs. No breaking changes in recent versions affect basic commit operations. Libgit2-rust v0.14 provides native Rust bindings if needed for performance.

## Project Context Reference

Refer to project-context.md for overall governance and BMAD workflow compliance. This story aligns with Epic 3 goals of configuration versioning and auditability.

## Story Completion Status

Status: ready-for-dev
Completion note: "Ultimate context engine analysis completed - comprehensive developer guide created"
