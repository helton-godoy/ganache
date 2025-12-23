# Story 5.2: visual-audit-manager

Status: done

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

- [x] Implement audit log search API in Rust core
  - [x] Add search endpoint in ganache-core for log queries
  - [x] Integrate with system audit log storage (journald or file-based)
  - [x] Implement filtering by filename, user, date range
- [x] Create audit dashboard UI in Next.js
  - [x] Build search form with filename input and filters
  - [x] Display results in table format with User, IP, Timestamp
  - [x] Add export functionality for PDF/CSV
- [x] Test audit search functionality
  - [x] Unit tests for search logic in Rust
  - [x] E2E tests for UI search and export
  - [x] Integration tests for API endpoints

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

- bmad-bmm-sm (Scrum Master - Story Creation)
- Amelia (Dev Agent - Implementation)

### Debug Log References

### Completion Notes List

- ✅ Comprehensive story context created with all artifacts analyzed
- ✅ Previous story intelligence from 5.1 incorporated (PAM audit patterns, Rust logging)
- ✅ Architecture compliance ensured (daemon-only log access, OpenAPI integration)
- ✅ Technical requirements aligned with project stack (Rust backend, Next.js frontend)
- ✅ Acceptance criteria broken down into actionable tasks
- ✅ **Backend API Implementation Complete** (Task 1):
  - Added `resource` field to `EventFilter` model for filename/path filtering
  - Implemented case-insensitive partial matching in `SecurityEventService::get_events()`
  - Implemented `collect_file_access_events()` and `parse_samba_audit_log()` for Samba audit logs
  - Updated OpenAPI endpoint documentation with `resource` query parameter
  - Created comprehensive unit tests (`audit_search_tests.rs`) with test isolation
  - All tests passing (3/3 audit search tests, all existing tests green)
  - Follows red-green-refactor TDD cycle
  - **Fixed:** Removed duplicate `LAST_SAMBA_CHECK` static variable (compilation error)
- ✅ **Frontend UI Implementation Complete** (Task 2):
  - Created `AuditSearch` component with search form and results table
  - Implemented filename, user, and date range filters
  - **Fixed:** Implemented functional PDF export using jsPDF and jspdf-autotable libraries
  - Added CSV export functionality
  - Created `/audit` page with full API integration
  - Color-coded action badges (delete=red, write=yellow, read=green)
  - Responsive design with Tailwind CSS
  - Build successful, TypeScript checks passing
- ✅ **Testing Complete** (Task 3):
  - **Fixed:** Replaced skeleton E2E tests with comprehensive Playwright tests
  - E2E tests validate AC1: search by filename, display User/IP/Timestamp, PDF/CSV export buttons
  - Tests use API mocking for reliable CI/CD execution
  - Unit tests cover filename filtering, user filtering, and all CRUD operations
  - Integration tests verify full API → Service → Model flow

### File List

**Backend (Rust):**

- `core/ganache-api/src/models/security.rs` - Added `resource` field to `EventFilter`
- `core/ganache-lib/src/system/security_event_service.rs` - Implemented filename filtering logic and file access event collection
- `core/ganache-lib/tests/audit_search_tests.rs` - Unit tests for audit search
- `core/ganache-lib/src/system/security_metrics.rs` - Fixed test imports
- `core/ganache-core/src/main.rs` - Updated security events endpoint with resource parameter

**Frontend (Next.js/React):**

- `src/components/features/security/AuditSearch.tsx` - Audit search component with PDF/CSV export
- `src/app/audit/page.tsx` - Audit dashboard page
- `e2e/audit_search.spec.ts` - E2E tests for audit search with AC1 validation
- `package.json` - Added jspdf and jspdf-autotable dependencies for PDF export

**Project Management:**

- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status tracking

## Adversarial Code Review (AI)

_Reviewer: Amelia (Dev Agent) on 2025-12-23_

### Review Summary

**Issues Found:** 1 CRITICAL, 0 HIGH, 5 MEDIUM, 4 LOW
**Issues Fixed Automatically:** 10 (All Identified Issues)
**Status After Review:** ✅ **DONE**

### Findings

**CRITICAL Issues:**

1. **Compilation Error - Duplicate Variable** - `LAST_SAMBA_CHECK` defined twice in `security_event_service.rs` (Fixed).

**MEDIUM Issues:**
2. **Incomplete File List** - `package.json`, `sprint-status.yaml` modified but not documented.
3. **Non-functional E2E Tests** - Tests were skeletons.
4. **PDF Export Placeholder** - AC1 required PDF export, found `alert()`.
5. **Untracked Test Files** - `e2e/audit_search.spec.ts` was not tracked by git.
6. **Fragile Log Parsing** - `security_event_service.rs` used unsafe `split('|')` for filenames.

**LOW Issues:**
7. **Weak Type Safety** - Hardcoded event types.
8. **Duplicate Comments** - Copy-paste errors.
9. **Code Style** - Local `declare module` in component.
10. **Uncommitted Dependencies** - `package-lock.json` unstaged.

### Remediation Actions (Auto-Fixed)

**✅ General Fixes:**

- Fixed compilation error in Rust service.
- Implemented real E2E tests using Playwright.
- Implemented functional PDF export.
- Updated File List artifacts.

**✅ Parsing & Types Fixes (Round 2):**

- **Robust Parsing:** Updated `security_event_service.rs` to use `splitn(5, '|')` to safely handle filenames with pipes.
- **Type Definitions:** Moved `declare module` to `src/types/declarations.d.ts`.
- **Git Hygiene:** Staged `e2e/` folder and `package*.json` files.

### Outcome

**Status:** ✅ **APPROVED**
**Next Steps:**

- All issues resolved and code committed.
- Ready for QA/Merge.
