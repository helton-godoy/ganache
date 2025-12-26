# Project Context: GANACHE

This file establishes the critical rules, patterns, and constraints for the Ganache project. All agents must adhere to these guidelines.

## 1. Core Architecture Pattern: "Dual Mode"

The system must support two storage backends via the Strategy Pattern:

- **LegacyHA (Default/Priority):** For Dell 2950 servers with PERC 6/i controllers. Uses DRBD + Pacemaker + ZFS.
- **NativeZFS:** For modern HBA hardware. Direct ZFS.

**Constraint:** The API surface (`StorageStrategy` trait) must be identical for both.

## 2. Critical Safety Rule: The "Hardware Safety Gate"

- **Requirement:** Before creating any ZFS pool, the system MUST validate the underlying hardware.
- **Implementation:**
  - **Frontend:** If `controller == PERC`, disable/gray out "Native ZFS" option.
  - **Backend:** In `create_pool()`, if hardware is RAID, return `400 Bad Request` if strategy is `native_zfs`.
- **Goal:** Prevent data corruption caused by running ZFS on hardware RAID without DRBD.

## 3. Implementation Workflow

- **Source of Truth:** `.bmad/docs/project-backlog.md` defines WHAT to build.
- **Reference Material:** See `Ganache Architecture Materialization.md` for "Spike" code (React Wizard, Rust Traits). Use this logic, but write production-quality code.
- **API First:** All frontend development must match `api-spec/openapi.json`.

## 4. Tech Stack

- **Backend:** Rust (Proxmox Backup Server ecosystem).
- **Frontend:** React (Vite) + TypeScript + Tailwind.
- **Mocking:** MSW (Mock Service Worker) for simulating DRBD Split-Brain states during UI dev.
