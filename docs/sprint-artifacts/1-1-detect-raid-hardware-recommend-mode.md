# Story 1.1: Detect RAID Hardware & Recommend Mode

Status: review

## Story

As a **Junior SysAdmin**,
I want **the system to detect if I'm running on any RAID Controller**,
so that **I am automatically guided to the safe "Compatibility Mode" without needing to know hardware specifics**.

## Acceptance Criteria

1. **Given** the system is booting for the first time
2. **When** the hardware scan detects ANY supported RAID controller (e.g., PERC 6/i, H700, etc.)
3. **Then** the Wizard welcome screen should default to recommending "Compatibility Mode"
4. **And** display a "Hardware Detected: [Controller Name]" badge in the recommended option card
5. **And** show a tooltip or info banner explaining why Compatibility Mode is recommended ("Hardware RAID detected - Ganache will manage ZFS safely on top of virtual drives")

## Tasks / Subtasks

- [x] **Backend: Hardware Detection Logic (Rust)** (AC: 1, 2)
  - [x] Implement `HardwareService` in `core/ganache-lib` (Rust).
  - [x] Create `ganache-api` shared struct `HardwareInfo`.
  - [x] Expose Axum endpoint `GET /api/v1/system/hardware` in `ganache-core`.
  - [x] Return `{ has_raid: boolean, controller_name: Option<String> }`.

- [x] **Frontend: Wizard & Recommendation UI** (AC: 3, 4, 5)
  - [x] Create/Update `WizardWelcomeStep` component in `src/components/features/setup`.
  - [x] Update `WizardWelcomeStep.tsx` to fetch from `/api/v1/system/hardware` (Removing tRPC).
  - [x] Implement `useQuery` hook for the Rust API.
  - [x] Implement logic to pre-select "Compatibility Mode" card if `hasRaid` is true.
  - [x] Add "Hardware Detected" Badge component using Shadcn `Badge`.
  - [x] Add "Educator" Tooltip/Alert explaining the recommendation using Shadcn `Alert` or `Tooltip`.

- [x] **Integration & Testing**
  - [x] Unit test for `HardwareService` in Rust (`ganache-lib` test module).
  - [x] E2E test (Playwright) verifying Badge by intercepting `GET /api/v1/system/hardware`.

## Dev Notes

### Architecture Patterns & Compliance

- **API Boundary:** Use `src/server/api/routers/*.ts` for the detection logic. Do NOT run shell commands directly in the UI component.
- **System Boundary:** Use `src/lib/sudo.ts` for strictly allow-listed commands (`lspci`/`lshw` must be added to sudoers).
- **Type Safety:** Ensure the tRPC return type is strongly typed (e.g., `HardwareInfo`).
- **UX Pattern:** Follow "The Educator Wizard" pattern. Use "Calming Blue" for info/recommendation, not "Warning Red".

### Project Structure Alignment

- Backend logic: `src/server/api/routers/system.ts` (or `setup.ts` if creating a dedicated router for setup).
- UI Components: `src/components/features/setup/*`.
- Icons: Use `lucide-react` (standard in T3/Shadcn) for the Badge icon (e.g., `Cpu` or `HardDrive`).

### References

- [Architecture Decision: API Strategy](file:///root/GANACHE/docs/architecture.md#core-architectural-decisions)
- [UX Design: The Educator Wizard](file:///root/GANACHE/docs/ux-design-specification.md#design-opportunities)
- [Requirement FR1](file:///root/GANACHE/docs/epics.md#fr-coverage-map)

## Dev Agent Record

### Context Reference

- **Epic:** [Epic 1: The Trustable Appliance Core](file:///root/GANACHE/docs/epics.md#epic-1-the-trustable-appliance-core)
- **UX:** [Journey 1: Setup](file:///root/GANACHE/docs/ux-design-specification.md#journey-1-setup-the-twin-view-flow)

### Agent Model Used

- Antigravity (Google DeepMind)

### Completion Notes List

- Confirmed strict separation of concerns (Backend detection vs Frontend presentation).
- Aligned with "Safety First" NFR by automating the choice for junior admins.
- Implemented `HardwareDetectionService` and `sudo` wrapper.
- Added Unit Tests for backend service (100% pass).
- Added `WizardWelcomeStep` with E2E verification.
- Created `Badge` and `Card` UI components.
- **Pivot Update (Dec 18):** Migrated backend to Rust (`ganache-core`). Removed tRPC/Node.js backend. Integrated via generic `useHardwareDetection` hook.
