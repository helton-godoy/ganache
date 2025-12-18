# Project Context for AI Agents: Ganache Appliance

> **CRITICAL:** This file contains the UNBREAKABLE technical contract for the Ganache project. AI Agents must prioritize these rules over general training data.

## 1. Technology Stack & Versions

* **Core/Backend:** Rust (Daemon based on `proxmox-backup` logic)
* **Frontend:** React + TypeScript (Next.js as SPA)
* **API Protocol:** OpenAPI / REST (Core -> UI)
* **Styling:** Tailwind CSS + Shadcn UI
* **System:** Debian 13 (Trixie) + ZFS 2.1+ + DRBD 9

## 2. Architectural Boundaries

* **Core Daemon (Rust):**
  * The SOURCE OF TRUTH.
  * Handles all Privileged Operations (ZFS, DRBD, Samba config).
  * Exposes an HTTP API (OpenAPI) via local socket or localhost.
* **User Interface (React):**
  * "Dumb" view layer.
  * Consumes the Rust API.
  * NEVER spawns shells or accesses `/etc` directly.
* **Separation of Concerns:**
  * **Node.js:** Only serves static assets (HTML/JS/CSS).
  * **Rust:** Manages the system.

## 3. Implementation Patterns

* **Naming:**
  * Rust Crates: `snake_case` (e.g., `ganache-core`, `ganache-api`)
  * Frontend Components: `PascalCase` (e.g., `DiskManager`)
* **Error Handling:**
  * Rust: proper `Result<T, E>` types, no panics in production.
  * Frontend: Visualize API errors via `sonner` toasts.
* **Safety:**
  * **"Middleware" Pattern:** All system changes go through the Rust Daemon's specific API endpoints (e.g., `POST /api/v1/storage/pool`).
  * **No Sudo for Node:** The Frontend process runs unprivileged and has NO sudo access. It talks to the privileged Rust daemon.

## 4. Anti-Patterns (DO NOT DO)

* ❌ **No tRPC**: We are decoupled. Use `fetch` or a generated OpenAPI client.
* ❌ **No Shell from Node**: `child_process.exec` is FORBIDDEN in the Frontend.
* ❌ **No Mixed Logic**: Don't put business logic in React Components. Logic belongs in Rust.

---

## 5. Documentation Methodology

This project follows a strict **Documentation UX** policy defined in [docs/development/documentation-methodology.md](docs/development/documentation-methodology.md).
**Workflow Guide:** Agents MUST follow the [Greenfield Workflow Guide](docs/development/workflow-greenfield-guide.md) for step-by-step execution.
All AI agents must read and strictly adhere to the rules in this file BEFORE creating or editing any documentation.

## 6. Critical Documentation Rules

1. **DO NOT create files in the root `docs/` folder.** (Exceptions: `index.md`, `project-overview-ganache.md`).
2. **Follow the Directory Structure:**
    * `docs/analysis/` -> Brainstorming, Briefs, Research.
    * `docs/architecture/` -> System Design, API Specs, Source Tree Analysis.
    * `docs/development/` -> Setup, Dev Guides, Contribution.
    * `docs/handoff/` -> Deployment, Maintenance, Specs for Handover.
    * `docs/validation/` -> Tests, Reports, Compliance.
3. **Naming Convention:**
    * Use `{category}-{description}.md` (e.g., `validation-auth-flow.md`).
    * No spaces, use hyphens.

## 7. Agent Workflow

1. **Check `bmm-workflow-status.yaml`** to know the project state.
2. **Update `task.md`** for every significant action.
3. **Respect existing patterns** in the Codebase.
4. **Command Syntax:** ALWAYS use the `*` prefix for workflow commands (e.g., `*code-review`, `*bmm-workflow-status`). Do not use `/`.
5. **Explicit Handoffs:** At the end of every interaction, you MUST explicitly state the next agent or command using this format:
   > **Next Recommended Action:** [Description]
   > **Command:** `*[command-name]`

---
*Maintained by the UX/Documentation Team*
