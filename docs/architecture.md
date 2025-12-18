---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
inputDocuments:
  - docs/analysis/prd.md
  - docs/ux-design-specification.md
  - project-context.md
workflowType: 'architecture'
lastStep: 0
project_name: 'GANACHE'
user_name: 'Helton'
date: '2025-12-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

* **Cluster Initialization (Twin-View):** UI must visualize and control the pairing of two physical nodes, managing SSH keys, DRBD resource creation, and ZFS pool formation.
* **Real-time Monitoring:** Dashboard must reflect the exact state of ZPools (zpool status) and DRBD connections (drbdadm status) with minimal latency.
* **Emergency Failover (Panic Mode):** A simplified, mobile-first flow to promote a secondary node to primary, handling potentially dangerous "split-brain" scenarios safely.

**Non-Functional Requirements:**

* **Safety First:** User actions must be validated against destructive data loss. "Zero CLI interaction" means the API must handle all edge cases.
* **Responsiveness:** The UI must feel immediate (optimistic updates) even if the underlying disk operations take time.
* **Accessibility:** WCAG AA compliance is mandatory (critical for stress situations).

**Scale & Complexity:**

* Primary domain: Systems Management / Web Appliance
* Complexity level: High (Hardware/Kernel interaction)
* Architectural Pattern: Full-Stack Monolothic Appliance (Next.js)

### Technical Constraints & Dependencies

* **Technology Stack:** Rust (Backend Daemon - `ganache-core`), React + Next.js (SPA Frontend), OpenAPI (Contract).
* **Technology Stack:** Rust (Backend Daemon - `ganache-core`), React + Next.js (SPA Frontend), OpenAPI (Contract).
* **Language:** TypeScript (Strict).
* **OS:** Linux (Debian 13 / Trixie) with ZFS on Linux and DRBD 9.
* **Privilege Separation:** UI is unprivileged. All privileged ops handled by Rust Daemon (`ganache-core`).

### Cross-Cutting Concerns Identified

*1. **Separated Core:**
    * **Decision:** Build `ganache-core` in Rust to handle all system interactions (ZFS, DRBD, Samba).
    ***Rationale:** Matches PBS architecture, ensures memory safety, and eliminates "shell script glue".
    * **Interface:** Daemon exposes a REST/OpenAPI socket.
2. **Decoupled UI:**
    ***Decision:** Frontend is a pure consumer of the Rust API.
    * **Rationale:** Allows the UI to theoretically run anywhere (remote management) and isolates complex state logic.

* **State Synchronization:** strict adherence to "Server State is Truth". The UI mirrors the output of system commands.
* **Error Handling:** Graceful degradation if system commands fail or timeout.
* **Security:** Input validation at the tRPC boundary to prevent command injection.

## System Components

### 1. Presentation Layer (Next.js Client)

* **Framework**: Next.js 14 (App Router)

* **Styling**: Tailwind CSS + Shadcn UI
* **State Management**:
  * **URL State**: `nuqs` for shareable, bookmarkable UI state (filters, wizard steps).
  * **Server State**: `useQuery` (tRPC) for system data.
  * **Client State**: `Zustand` for complex interactive sessions (e.g., multi-step wizards) only when necessary.

### 2. Strategic Migration Approach

* **Logic Source A: Proxmox (PBS/PVE)**
  * **Strategy:** Direct Code Reuse.
  * **Implementation:** Import official crates (`proxmox-sys`, `proxmox-api`) directly into `ganache-core`.
  * **Goal:** Native compatibility with Debian/ZFS/Proxmox ecosystem without reimplementation.
* **Logic Source B: TrueNAS Scale (Middleware)**
  * **Strategy:** Logic Porting (Python -> Rust).
  * **Implementation:** Read TrueNAS `middlewared` Python source for business logic (ACLs, SMB generation), then reimplement "The Rust Way" using Tokio/Axum.
  * **Goal:** Achieves TrueNAS-level SMB/AD integration with Rust safety/performance.

### 3. Core Rust Stack (Ganache Daemon)

* **Web Framework:** `Axum` (0.8+) - Modern, ergonomic, efficient.
* **Runtime:** `Tokio` (1.48+) - 100% compatible with Proxmox crates.
* **API Spec:** `Utoipa` (5.4+) - Auto-generated OpenAPI v3 contracts.
* **Error Handling:** `thiserror` (Libraries) + `anyhow` (App).

### 4. API / Application Layer (React UI)

* **Role**: Validates user intent, enforces business logic, and orchestrates system operations.

* ❌ **No tRPC**: Use OpenAPI clients generated from Rust specs.
* ❌ **No Direct Shell Calls in Node**: Node.js process has NO sudo access.
* ❌ **No `useEffect` for Data Fetching**: Use React Query (TanStack Query) against OpenAPI hooks.

### 3. System Integration Layer (Server-Side Logic)

* **Location**: `src/lib/*` and `src/server/api/routers/*`.

* **Sudo Wrapper**: `src/lib/sudo.ts` acts as the security gateway. It wraps `exec` calls and ensures only whitelisted commands with validated arguments are executed as root.
* **ZFS / Hardware Modules**: Typed wrappers around CLI tools (`zpool`, `drbdadm`, `lspci`).

### 4. Data Layer (OS & Filesystem)

* **Persistence**: Git-backed configuration `etc` for rollback capabilities (Future feature).

## 5. Implementation Patterns

### 5.1 Rust Workspace Structure (Backend)

* **`ganache-core` (Binary):** The main daemon. Initializes the Tokio Runtime, loads config, and starts the Axum Web Server.
* **`ganache-api` (Library):** Contains Type Definitions (Structs/Enums) and OpenAPI Specs. Shared between Core and Clients.
* **`ganache-lib` (Library):** Pure logic. Contains the "Business Rules" (e.g., ZFS wrapper, DRBD logic). Independent of HTTP.

### 5.2 Error Handling Standard

* **Rust (Backend):**
  * **Result Type:** All API handlers return `Result<Json<ResponseEnvelope<T>>, ApiError>`.
  * **ApiError Enum:** Maps internal errors (e.g., `ZfsError`) to HTTP Status Codes (404, 500, 403).
  * **No Panics:** Production code must NEVER panic. Use `anyhow::Context` to add context to errors before logging.

### 5.3 API Response Strategy

* **Envelope Pattern:** All JSON responses follow a strict schema to prevent parsing ambiguity on the Frontend.

    ```json
    {
      "data": { ... },     // The payload (if success)
      "error": null,       // Error details (if failure)
      "meta": { "timestamp": 123456789 }
    }
    ```

### 5.4 React/Frontend Patterns

* **Generated Client:** The Frontend DOES NOT write manual `fetch` calls. It uses a client generated from the Rust OpenAPI spec (via `orval` or similar).
* **Hooks Strategy:**
  * `useQuery` (React Query) for all GET requests (reading system state).
  * `useMutation` (React Query) for all POST/PUT/DELETE requests (changing system state).

## 6. Project Structure

We follow a **Monorepo Appliance** layout to physically separate the unprivileged UI from the privileged Core.

```text
/root/GANACHE/
├── docs/                   # Documentation Source of Truth
├── ui/                     # [Frontend] Next.js + React Application
│   ├── src/                # Components using strictly defined patterns
│   └── package.json        # Dependencies: React, TanStack Query, Nuqs
├── core/                   # [Backend] Rust Workspace
│   ├── Cargo.toml          # Workspace Definition
│   ├── ganache-core/       # Daemon Binary (Axum + Tokio)
│   ├── ganache-api/        # Shared Types & OpenAPI Specs
│   └── ganache-lib/        # Pure Logic (ZFS, DRBD, Samba wrappers)
└── .bmad/                  # AI Agent Configuration
```

## Data Flow

1. **User Action**: User clicks "Create Pool" in UI.
2. **Client Request**: `ApiClient.zfs.createPool({ name: 'tank', devices: [...] })` is called.
3. **Transport**: JSON Payload sent to `POST /api/v1/pools`.
4. **Daemon Core**:
    * Axum Router receives request.
    * `ganache-api` validates schema (Serde).
    * `ganache-core` calls `ZfsService::create_pool(...)`.
    * Rust Code executes `Command::new("zpool")...`.
5. **Response**: JSON Envelope `{ data: { ... }, error: null }` returned.
6. **Update**: React Query invalidates `poolKeys.list`, triggering a UI refresh.

## Security Model

* **Principle**: The UI is **Untrusted**. The Rust Daemon is the **Trusted Gatekeeper**.
* **Escalation**: The Rust Daemon runs as root (system service). The UI has NO system access.
* **Validation**: All input is strongly typed and sanitized by Serde/Rust Logic before ever touching a shell command.

```
