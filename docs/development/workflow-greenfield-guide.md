# BMAD Greenfield Workflow Guide

> **AI AGENT INSTRUCTION:**
> This document is the **Source of Truth** for the "Standard Greenfield" workflow.
> When navigating a project from scratch, follow these phases sequentially.
> **ALWAYS** use the specified **Agent** and **Command** for each step.

---

## 🟢 Phase 1: Discovery (Optional)

**Goal:** Understand the problem space, market validation, and initial ideation.

### 1.1 Brainstorming

* **Description:** Ideation session to explore possibilities.
* **👤 Agent:** `*bmad-master`
* **🛠️ Workflow:** `*brainstorming-session`

### 1.2 Research

* **Description:** Market, technical, or domain research to validate ideas.
* **👤 Agent:** `*analyst`
* **🛠️ Workflow:** `*research`

### 1.3 Product Brief

* **Description:** High-level summary of the product vision.
* **👤 Agent:** `*analyst`
* **🛠️ Workflow:** `*create-product-brief`

---

## 🔵 Phase 2: Planning (Required)

**Goal:** Define *what* we are building (requirements) and *how* it looks (design).

### 2.1 Product Requirements Document (PRD)

* **Description:** Detailed functional and non-functional requirements.
* **👤 Agent:** `*pm`
* **🛠️ Workflow:** `*create-prd`

### 2.2 UX Design (If UI exists)

* **Description:** Wireframes, flows, and visual design system.
* **👤 Agent:** `*ux-designer`
* **🛠️ Workflow:** `*create-ux-design`

---

## 🟠 Phase 3: Solutioning (Required)

**Goal:** Define *how* we will build it (architecture) and break it down (stories).

### 3.1 Architecture

* **Description:** System design, tech stack, data models, and API specs.
* **👤 Agent:** `*architect`
* **🛠️ Workflow:** `*create-architecture`

### 3.2 Epics & Stories

* **Description:** Breakdown of the PRD into actionable development items.
* **👤 Agent:** `*pm` (Collaborating with Dev/Architect)
* **🛠️ Workflow:** `*create-epics-stories`

### 3.3 Test Design

* **Description:** Strategy for quality assurance and test coverage.
* **👤 Agent:** `*tea`
* **🛠️ Workflow:** `*testarch-test-design`

### 3.4 Implementation Readiness Check

* **Description:** Final gate check to ensure everything is ready for code.
* **👤 Agent:** `*sm`
* **🛠️ Workflow:** `*check-implementation-readiness`

---

## 🟣 Phase 4: Implementation (Required)

**Goal:** Build, test, and ship the software in iterations.

### 4.1 Sprint Planning

* **Description:** Select stories for the current iteration.
* **👤 Agent:** `*sm`
* **🛠️ Workflow:** `*sprint-planning`

### 🔄 The Story Loop (Repeat for each Story)

#### A. Develop Story

* **Description:** Write code, tests, and implement functionality.
* **👤 Agent:** `*dev`
* **🛠️ Workflow:** `*dev-story`

#### B. Code Review

* **Description:** Adversarial review of the implemented code.
* **👤 Agent:** `*architect` (or Peer Dev)
* **🛠️ Workflow:** `*code-review`

#### C. Test Review (Optional)

* **Description:** Verify test coverage and quality.
* **👤 Agent:** `*tea`
* **🛠️ Workflow:** `*testarch-test-review`

---

### 4.2 Retrospective

* **Description:** Review the sprint/project performance and learn.
* **👤 Agent:** `*sm`
* **🛠️ Workflow:** `*retrospective`

---

## 🆘 Lost?

If you are unsure of the current state, ask the Master:

* **👤 Agent:** `*bmad-master`
* **🛠️ Command:** `*workflow-status`
