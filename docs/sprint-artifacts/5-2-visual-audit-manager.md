# Story 5.2: visual-audit-manager

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Auditor,
I want a search engine for file access logs to answer "Who accessed sensitive file X?",
So that I can quickly respond to compliance requests without grep-ing text files.

## Acceptance Criteria

1. Given the "Audit" dashboard page
   When I search for a filename (e.g., "patient_records.xls")
   Then the results must show every Open/Read/Write/Delete event for that file
   And display the User, Client IP, and Timestamp for each event
   And allow exporting the report as PDF/CSV

## Tasks / Subtasks

- [ ] Implement audit log search API in Rust core
  - [ ] Add search endpoint in ganache-core for log queries
  - [ ] Integrate with system audit log storage (journald or file-based)
  - [ ] Implement filtering by filename, user, date range
- [ ] Create audit dashboard UI in Next.js
  - [ ] Build search form with filename input and filters
  - [ ] Display results in table format with User, IP, Timestamp
  - [ ] Add export functionality for PDF/CSV
- [ ] Test audit search functionality
  - [ ] Unit tests for search logic in Rust
  - [ ] E2E tests for UI search and export
  - [ ] Integration tests for API endpoints

## Dev Notes

- Relevant architecture patterns and constraints: Follow middleware pattern - all log access through Rust daemon, no direct file access from Node.js
- Source tree components to touch: core/ for audit search logic, src/ for audit dashboard UI
- Testing standards summary: Unit tests in Rust (cargo test), e2e tests for UI, integration tests for API

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): Use snake_case for Rust, PascalCase for React components
- Detected conflicts or variances (with rationale): None detected - follows established patterns from Story 5.1

### References

- [Source: docs/epics.md#epic-5-compliance-shield] - Complete story requirements and acceptance criteria
- [Source: docs/architecture.md#3-architectural-boundaries] - Core daemon handles privileged operations
- [Source: docs/sprint-artifacts/5-1-deep-ssh-audit-logging.md] - Previous story learnings on audit logging implementation
- [Source: project-context.md#2-architectural-boundaries] - Security model and daemon isolation

## Dev Agent Record

### Agent Model Used

bmad-bmm-sm (Scrum Master - Story Creation)

### Debug Log References

### Completion Notes List

- ✅ Comprehensive story context created with all artifacts analyzed
- ✅ Previous story intelligence from 5.1 incorporated (PAM audit patterns, Rust logging)
- ✅ Architecture compliance ensured (daemon-only log access, OpenAPI integration)
- ✅ Technical requirements aligned with project stack (Rust backend, Next.js frontend)
- ✅ Acceptance criteria broken down into actionable tasks

### File List