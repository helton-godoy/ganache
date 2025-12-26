# Story 3.2: configuration-timeline-ui

Status: done

## Story

As a System Administrator,
I want to view a chronological timeline of all system changes,
So that I can audit recent activity or troubleshoot when a problem started.

## Acceptance Criteria

**Given** the "History" dashboard page
**When** I load the view
**Then** I should see a list of commits with Date, Author, and a brief summary
**And** clicking a commit should show a simple "Diff" (Visual comparison of changes)
**And** the view should allow filtering by user or date range

## Tasks / Subtasks

- [ ] Implement Git History API endpoint in ganache-core
  - [ ] Add git service to read commit log from configuration repository
  - [ ] Create endpoint to fetch commits with pagination
  - [ ] Add endpoint to get diff for specific commit
- [ ] Create History page component (src/app/history/page.tsx)
  - [ ] Implement timeline layout with commit cards
  - [ ] Add filtering controls (user, date range)
  - [ ] Integrate with React Query for data fetching
- [ ] Create HistoryTimeline feature component (src/components/features/HistoryTimeline.tsx)
  - [ ] Display commits in chronological order
  - [ ] Show commit metadata (date, author, summary)
  - [ ] Handle loading and error states
- [ ] Create CommitDiff modal component
  - [ ] Display unified diff view
  - [ ] Syntax highlighting for configuration files
  - [ ] Expandable/collapsible file sections
- [ ] Add accessibility features (WCAG AA compliance)
  - [ ] Keyboard navigation: Tab/Shift+Tab for timeline, Enter to open diff, Escape to close modal
  - [ ] Screen reader support: Announce "Loading commits..." during fetch, "X commits found" after load
  - [ ] High contrast mode support with proper color contrast ratios
  - [ ] Focus management: Auto-focus on first commit after load, focus trap in modal
- [ ] Implement dark mode support for history page with theme-aware syntax highlighting
- [ ] Add E2E tests for history functionality including accessibility testing

## Dev Notes

- Relevant architecture patterns and constraints: Use OpenAPI generated hooks for type-safe API calls. Implement server state with TanStack React Query. Use Zustand for client state if needed for filters.
- Source tree components to touch: src/app/history/page.tsx, src/components/features/HistoryTimeline.tsx, src/components/features/CommitDiffModal.tsx, core/ganache-core/src/services/git_service.rs (new), core/ganache-api/src/models/git_commit.rs (new)
- Testing standards summary: Use Playwright for E2E tests of the history page. Add unit tests for git service functions.

### Project Structure Notes

- Alignment with unified project structure: Follow src/components/features for smart components, src/api/generated for API hooks.
- Detected conflicts or variances: Ensure API follows OpenAPI spec generated from ganache-api crate.

### References

- [Source: docs/epics.md#Story 3.2: Configuration Timeline UI] - Story requirements and acceptance criteria
- [Source: docs/architecture.md#4. Arquitetura de Frontend] - Frontend patterns and technologies
- [Source: docs/architecture.md#5. Estratégia de Integração] - API integration strategy
- [Source: docs/ux-design-specification.md] - UI design guidelines and accessibility requirements
- [Source: project-context.md#3. Implementation Patterns] - Naming conventions and error handling

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

x-ai/grok-code-fast-1

### Debug Log References

### Completion Notes List

### File List

## Developer Context

### Technical Requirements

- **Git Repository Location:** Configuration changes tracked in `/etc/ganache/.git` repository (established by story 3.1)

- **API Endpoints Needed:**
  - `GET /api/v1/config/history?limit=50&offset=0&author_filter=&date_from=&date_to=` - Fetch paginated list of configuration commits (default 50 per page)
  - `GET /api/v1/config/history/{commit_id}/diff` - Get unified diff for specific commit
  - Query parameters: limit (default: 50, max: 200), offset, author_filter, date_from, date_to

- **Data Models:**

  ```typescript
  interface GitCommit {
    id: string;
    author: string;
    date: string; // ISO 8601
    message: string;
    files_changed: number;
  }

  interface GitDiff {
    commit_id: string;
    files: Array<{
      filename: string;
      additions: number;
      deletions: number;
      diff_content: string; // Unified diff format
    }>;
  }
  ```

- **Error Handling Scenarios:**
  - Repository not initialized: Return 503 with message "Configuration repository not yet created"
  - Corrupted git history: Return 500 with message "Git repository corrupted, check /etc/ganache/.git"
  - Permission denied: Return 403 with message "Insufficient permissions to read configuration history"
  - No commits found: Return empty array with 200 status

- **Frontend State Management:**
  - Use React Query for server state (commits list, diff data) with 30s stale time
  - Use Zustand for client state (filters, selected commit) with persistence

- **UI Components:**
  - Timeline layout using CSS Grid with responsive breakpoints
  - Filter form with date pickers (react-datepicker) and user select dropdown
  - Modal for diff display with Prism.js syntax highlighting, collapsible file sections, and line numbers

### Architecture Compliance

- **Backend:** Implement git history service in ganache-core following the service pattern in core/ganache-core/src/services/
- **API Contract:** Define models in ganache-api/src/models/git_commit.rs with Serde derives
- **Frontend:** Use generated OpenAPI hooks from src/api/generated/
- **Security:** Ensure git operations are read-only and don't expose sensitive paths outside /etc/ganache
- **Performance:** Implement pagination (50 commits default, 200 max), React Query caching (30s stale time), and background refetching for real-time updates
- **Error Handling:** Follow Rust Result<T,E> patterns with specific error types for git operations, frontend error toasts with actionable messages

### Library Framework Requirements

- **Frontend Libraries:**
  - TanStack React Query v5 for data fetching with 30s stale time and background refetching
  - Zustand v4 for state management with persistence for filter state
  - React Hook Form + Zod for filter forms validation
  - Prism.js for diff syntax highlighting with line numbers and collapsible sections
  - date-fns for date filtering and formatting
  - react-datepicker for date picker components

- **Backend Libraries:**
  - git2 crate for Git operations (safe Rust bindings)
  - chrono for date handling
  - serde for serialization

### File Structure Requirements

- **New Files:**
  - core/ganache-api/src/models/git_commit.rs
  - core/ganache-core/src/services/git_history_service.rs
  - src/app/history/page.tsx
  - src/components/features/HistoryTimeline.tsx
  - src/components/features/CommitDiffModal.tsx

- **Modified Files:**
  - core/ganache-api/src/lib.rs (add git_commit module)
  - core/ganache-core/src/services/mod.rs (add git_history_service)
  - core/ganache-core/src/main.rs (add routes for history endpoints)

### Testing Requirements

- **Unit Tests:** Test git service functions with mock repository
- **Integration Tests:** Test API endpoints with real git repo
- **E2E Tests:** Playwright tests for history page interaction, filtering, diff viewing
- **Accessibility Tests:** Playwright accessibility tests for keyboard navigation (Tab order, Enter/Escape), screen reader announcements, and WCAG AA compliance using axe-core

### Previous Story Intelligence

**Previous Story (3.1 Git-Backed Configuration Engine):**

- Established git repository for configuration changes
- Implemented automatic commits on config changes
- Created foundation for configuration versioning
- Lessons: Ensure atomic commits, handle concurrent edits, include user context in messages

**Actionable Insights:**

- Build on existing git infrastructure from story 3.1
- Reuse commit message format and user identification
- Ensure timeline shows only configuration-related commits
- Handle cases where git repo might not exist yet

### Git Intelligence Summary

**Recent Commit Patterns:**

- Configuration changes committed with format: "feat(config): [action] [resource] by [user]"
- Includes username and timestamp in commit messages
- Files changed: /etc/ganache/\*, database entries tracked via git

**Code Patterns Established:**

- Use git2 crate for safe Git operations
- Handle repository initialization and error cases
- Parse commit metadata for API responses

### Latest Tech Information

**Git2 Crate:** Latest version (0.18+) provides safe Rust bindings for libgit2. Supports reading commit history, diffs, and repository operations without shell commands. Use for secure git operations in /etc/ganache/.git.

**React Query v5:** Latest stable version includes improved caching with configurable stale times, background refetching, and optimistic updates. Essential for efficient data synchronization with 30s stale time for commit data.

**Zustand v4:** Lightweight state management with TypeScript support and persistence middleware. Suitable for complex filter state with localStorage persistence for user preferences.

**Prism.js:** Syntax highlighting library with support for diff syntax, line numbers, and collapsible code sections. Use for enhanced diff display in commit modal.

### Project Context Reference

- Follow Single Source of Truth principle - all documentation in docs/
- Use atomic commits with conventional commit messages
- Implement safety commit protocol for all changes
- Ensure BMAD validation passes before completion

## Story Completion Status

Status updated to: ready-for-dev
Completion note: Ultimate story context created with comprehensive developer guidance, enhanced error handling, performance optimizations, accessibility features, and LLM-optimized content structure. All quality competition improvements applied for flawless implementation.
