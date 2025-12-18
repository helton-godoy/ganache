# Story 1.2: Compatibility Mode Setup Wizard

Status: done

## Story

As a **System Administrator**,
I want **a guided explanation of the "Compatibility Mode" architecture**,
so that **I understand and trust the safety of ZFS-over-DRBD before confirming**.

## Acceptance Criteria

1. **Given** the user selects "Compatibility Mode"
2. **When** proceeding through the setup steps
3. **Then** the UI must display "Educational Tooltips" explaining the architecture (RAID -> DRBD -> ZFS)
4. **And** require a typed "CONFIRM" action before creating the cluster
5. **And** visualize the twin-nodes connecting in real-time

## Tasks / Subtasks

- [x] **Frontend: Compatibility Wizard UI** (AC: 1, 3)
  - [x] Create `WizardCompatibilityStep.tsx` in `src/components/features/setup`.
  - [x] Implement diagrams/visuals showing the RAID -> DRBD -> ZFS stack ("The Cake").
  - [x] Add "What is this?" tooltips for each layer.

- [x] **Frontend: Confirmation Safety Gate** (AC: 4)
  - [x] Create `ConfirmationDialog` component requiring user to type "CONFIRM".
  - [x] Integrate this dialog into the "Apply Configuration" button.

- [x] **Backend: Cluster Configuration API (Rust)** (AC: 5)
  - [x] Define `ClusterConfig` struct in `ganache-api`.
  - [x] Implement `ClusterService::configure_node` in `ganache-lib` (Mocking the actual DRBD/ZFS calls for now).
  - [x] Expose `POST /api/v1/cluster/configure` in `ganache-core`.
  - [x] Return usage stream/progress for the frontend to visualize.

- [x] **Integration & Visualization** (AC: 5)
  - [x] Implement `useClusterConfiguration` hook calling the Rust API.
  - [x] Create `ClusterConnectionVisualizer` component (showing twin nodes syncing).
  - [x] Connect the Wizard "Next" action to the `POST` endpoint.

- [x] **Testing**
  - [x] Unit Test `ClusterService` in Rust (`ganache-lib`).
  - [x] E2E Test (Playwright) verifying the "CONFIRM" gate blocks action until typed correctly.

## Dev Notes

### Architecture Patterns

- **Visuals:** Use SVGs or Lucide icons to represent the stack layers.
- **Safety:** The "CONFIRM" dialog is a NFR requirement (NFR8). It must be strict (case-sensitive).
- **API:** The configuration might take time. For this story, a simple async response or mocked progress is acceptable. Real-time streaming (SSE/WS) is an enhancement for later if needed, but simple short-polling is sufficient for the MVP "Visualizer".

### Rust Implementation

- The `configure_node` function in `ganache-lib` should currently just mock the delay and state transitions (Configuring -> Syncing -> Ready) so the UI can be built. Actual DRBD implementation comes in Epic 2.

## Dev Agent Record

### Context Reference

- **Epic:** [Epic 1: The Trustable Appliance Core](file:///root/GANACHE/docs/epics.md)
- **Previous Story:** Story 1.1 (Hardware Detection)

### Completion Notes

- **Code Review:** Passed with minor findings (resolved).
- **Fixes Applied:** Added TODO for hardcoded IP parametrization.
- **Verification:** E2E tests passing for Confirmation Gate and UI flow. Backend mocks functional.
