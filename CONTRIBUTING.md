# 🛑 STOP: CONTRIBUTION GUIDELINES

This project adheres to the **BMAD-METHOD** (Business-Managed Agent Development) framework. To contribute, whether you are a Human or an AI Agent, you MUST follow the governance protocols defined in our Single Source of Truth (SSoT).

## 🧭 Where to Start?

Do not guess. Load the context.

| If you are looking for... | Go here... |
| :--- | :--- |
| **The Rules of the Game** | [project-context.md](./project-context.md) (MANDATORY READ) |
| **Architecture & Design** | [docs/architecture.md](./docs/architecture.md) |
| **Current Tasks/Sprint** | [docs/sprint-artifacts/sprint-status.yaml](./docs/sprint-artifacts/sprint-status.yaml) |
| **How to Validate Code** | Run `./scripts/bmad-validate.sh` (details in [project-context.md](./project-context.md)) |

## 🤖 For AI Agents

* **Mode:** ALWAYS operate in `AGENTIC` mode (if available).
* **Context:** Ingest `project-context.md` at the start of every session.
* **Workflows:** Check `.agent/workflows/` for specialized tasks (e.g., `/dev`, `/tests`, `/pm`).

## 👨‍💻 For Humans

* **Commits:** Follow the **Atomic Commit** protocol. 1 Change = 1 Commit.
* **PRs:** Pull Requests MUST pass the `docs-bmad` validation workflow.

> **Failure to follow BMAD protocols will result in rejected PRs/Commits.**
