# Story 1.4: Boot Environment Rollback

> **Epic:** 1 - The Trustable Appliance Core
> **Functional Requirement:** FR3
> Status: done

## Description

As a System Administrator, I want to select previous system versions from the boot menu, so that I can recover from a failed update immediately.

## Acceptance Criteria

- [x] **Given** a failed system update or configuration
- [x] **When** the server reboots and the GRUB menu appears
- [x] **Then** I should see a list of previous "Boot Environments" (snapshots)
- [x] **And** selecting one should boot the system exactly as it was at that point
- [x] **And** the UI should indicate "Booted from [Snapshot Name]" after login

## Technical Notes

- Implementation completed using ZFS Boot Environments.
- **Backend**: API endpoints `GET /api/v1/system/boot-environments` and `POST /api/v1/system/boot-environments/activate` implemented in `ganache-core`.
- **Frontend**: Components `BootEnvironmentBadge.tsx` and `BootEnvironmentList.tsx` migrated to use the Orval-generated OpenAPI SDK.
- The system correctly determines the current BE and allows activation of previous snapshots.

---
**Finalized on:** 2025-12-18
**Compliance:** 100% BMAD Standard
