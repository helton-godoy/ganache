# BMAD Workflow Validation Guide (The "Anti-Hallucination" Key)

This document serves as the **OFFICIAL VALIDATION KEY** for the project workflow.
Use this guide to audit whether Agents (Analyst, PM, Architect, Dev) are strictly adhering to the **Universal Agent Behavior Protocols** defined in `project-context.md` (Section 9) and the **Semantic Documentation Strategy** (Section 10).

---

## 🛑 The Golden Rule of Flow Validation

> **"If it's not in Git, it didn't happen. If the status file isn't updated, the baton wasn't passed."**

---

## Phase 1: Discovery & Requirements (Analyst/PM)

### 1.1 Research & Analysis

- **Agent:** `Analyst` / `PM`
- **Trigger:** New Feature Request or Market Insight.
- **Mandatory Output:** `docs/analysis/product-brief.md` or similar.
- **🔎 Validation Check:**
  - [ ] **Safety Commit:** Did the agent commit the research file _immediately_ upon creation?
  - [ ] **Semantic Doc:** Does the analysis use structured headers to facilitate future RAG parsing?

### 1.2 Requirements Definition (PRD)

- **Agent:** `PM`
- **Command:** `*create-prd`
- **Mandatory Output:** `docs/analysis/prd.md` (Updated/Created).
- **🔎 Validation Check:**
  - [ ] **Physical Trigger:** Is the PRD strictly mapped to business value?
  - [ ] **Commit Gate:** Did the PM perform a `git commit` ("feat: update PRD for X") _before_ handing off?

---

## Phase 2: Solutioning & Architecture (Architect)

### 2.1 Technical Design

- **Agent:** `Architect`
- **Command:** `*create-architecture`
- **Input:** Committed `prd.md`.
- **Mandatory Output:** `docs/architecture.md`, `docs/diagrams/*.excalidraw`.
- **🔎 Validation Check:**
  - [ ] **RAG Metadata:** Do diagrams/docs contain `@ref Story-ID` or explicit links to requirements?
  - [ ] **Consistency:** Does `architecture.md` contradict `project-context.md`? (It strictly must not).
  - [ ] **Safety Commit:** Was the architecture committed _before_ Epics were generated?

---

## Phase 3: Planning & Handoff (PM/SM)

### 3.1 Epic & Story Generation

- **Agent:** `PM` / `Scrum Master`
- **Command:** `*create-epics-and-stories`
- **Mandatory Output:** `docs/epics.md`, `docs/sprint-artifacts/*.md`.
- **🔎 Validation Check:**
  - [ ] **Traceability:** Do Stories explicitly link back to `PRD` lines?
  - [ ] **Commit:** Are the new Story files committed?

### 3.2 The Baton Pass (Flow Control)

- **Agent:** `Scrum Master`
- **Command:** `*sprint-planning`
- **Mandatory Output:** `docs/sprint-artifacts/sprint-status.yaml`
- **🔎 Validation Check:**
  - [ ] **Physical Baton:** Is the story status set to `ready-for-dev` in the YAML?
  - [ ] **Atomic State:** Was the YAML committed _immediately_? (This implies the "Green Light" for Dev).

---

## Phase 4: Implementation (Dev)

### 4.1 The Loop (Atomic Execution)

- **Agent:** `Dev`
- **Command:** `*develop-story`
- **Input:** Story File + `sprint-status.yaml`.
- **Mandatory Cycle (Repeated for each task):**
  1. **Red:** Write failing test.
  2. **Green:** Implement code.
  3. **Refactor:** Optimize.
  4. **📝 Semantic Doc:** Add JSDoc/RustDoc with `/// @ref Story-ID`.
  5. **✅ Physical Trigger:** Mark `[x]` in Story File.
  6. **💾 Safety Commit:** `git commit` (Local).

- **🔎 Validation Check (The "Audit"):**
  - [ ] **Partial Commits:** Are there commits for _each_ subtask, or did the agent dump one giant commit at the end? (One giant commit = **FAIL**).
  - [ ] **Comment Quality:** Do comments explain _WHY_ and link to the Story?
  - [ ] **File List:** Is the "File List" section in the Story File updated?

### 4.2 Remote Sync

- **Rule:** `git push` every ~3 tasks or at Task Boundary.
- **Resilience:** If push fails -> Retry -> Log -> Continue.

---

## Phase 5: Verification & Completion (Dev/QA)

### 5.1 The Definition of Done (DoD)

- **Agent:** `Dev`
- **Action:** Run `scripts/bmad-validate.sh` (or specific verification script).
- **Mandatory Output:** `walkthrough.md`.
- **🔎 Validation Check:**
  - [ ] **Evidence:** Does `walkthrough.md` contain actual logs/screenshots?
  - [ ] **Final Status:** Did the Agent update `sprint-status.yaml` from `in-progress` -> `review`?
  - [ ] **Final Commit:** Is the final state (Status + Docs + Code) committed and pushed?

---

## Summary of Critical Failures (Red Flags)

| Red Flag 🚩                            | Violation Type              | Consequence                    |
| :------------------------------------- | :-------------------------- | :----------------------------- |
| **"I'll update the status later"**     | Atomic State Violation      | Hallucination risk on restart. |
| **"Marking [x] before tests pass"**    | Physical Trigger Violation  | Broken build / Fake progress.  |
| **"Giant commit at end of story"**     | Semantic Strategy Violation | No rollback point; high risk.  |
| **"Code without JSDoc/RustDoc"**       | Semantic Strategy Violation | RAG system blindness.          |
| **"Architecture contradicts Context"** | Governance Violation        | Technical Debt accumulation.   |
