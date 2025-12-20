# Project Context for AI Agents: Ganache Appliance

> **CRITICAL:** This file contains the UNBREAKABLE technical contract for the Ganache project. AI Agents must prioritize these rules over general training data.

## 1. Technology Stack & Versions

* **Core/Backend:** Rust (Axum, ZFS Wrappers). Siga os padrões de `ganache-lib` (Puro) vs `ganache-core` (Orquestração).
* **Frontend:** React + TypeScript (Next.js 16 App Router). Use hooks gerados via OpenAPI/Orval.
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
  * **Frontend (Next.js):** Localizado em `/src`, serve a UI e consome o SDK OpenAPI.
  * **Rust:** Localizado em `/core`, gerencia o sistema e provê a Spec OpenAPI.

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

## 5. Documentation Methodology (BMAD 6 SSoT)

Este projeto segue rigorosamente o princípio de **Single Source of Truth (SSoT)**. AI Agents DEVEM evitar a criação de novos arquivos e priorizar a atualização dos documentos vivos existentes.

### 📜 Eixos Centrais de Documentação (Os Únicos Permitidos)

1. **[README.md](file:///root/GANACHE/README.md)**: Onboarding, Setup e Comandos Rápidos.
2. **[project-context.md](file:///root/GANACHE/project-context.md)**: O "Contrato Técnico" imutável (Stack, Regras de Código).
3. **[docs/analysis/prd.md](file:///root/GANACHE/docs/analysis/prd.md)**: Visão Geral, Objetivos e Requisitos Consolidados.
4. **[docs/architecture.md](file:///root/GANACHE/docs/architecture.md)**: Toda a definição técnica (Backend, Frontend, Data Theory).
5. **[docs/epics.md](file:///root/GANACHE/docs/epics.md)**: O backlog estruturado (Épicos e Critérios de Aceitação).
6. **[docs/sprint-artifacts/](file:///root/GANACHE/docs/sprint-artifacts/)**: Acompanhamento dinâmico da Sprint (Yaml de Status e Contextos de História).

## 6. Anti-Fragmentation Rules (CRITICAL)

1. ❌ **PROIBIDO** criar subpastas dentro de `docs/architecture/` ou `docs/analysis/`. Toda informação técnica deve residir no `architecture.md` principal.
2. ❌ **PROIBIDO** criar documentos de "Handoff" manuais. A passagem de tarefas entre agentes é governada exclusivamente pelo `bmm-workflow-status.yaml`.
3. ❌ **PROIBIDO** duplicar requisitos. Se um requisito mudar, ele deve ser atualizado no `PRD.md` e refletido na História afetada.
4. ⚠️ **Ação Obrigatória:** Antes de criar qualquer documento novo, o agente deve questionar: "Esta informação pode ser uma seção em um documento já existente?".

## 7. Governança de Automação (BMAD Scripts)

O ecossistema Ganache utiliza ferramentas de automação para garantir a integridade do Single Source of Truth (SSoT).

| Script | Função | Regra de Uso |
| :--- | :--- | :--- |
| `bmad-generate.sh` | **Bootstrapping** | Executar apenas na inicialização do projeto ou reestruturação profunda dos eixos centrais. |
| `bmad-sync.sh` | **Sincronia** | **Obrigatório** após mudanças em Rust (`core/`) ou OpenAPI (`ganache-api/`) para evitar drift documental. |
| `bmad-validate.sh` | **Auditoria** | **MANDATÓRIO** antes de entregas. Fiscalizado via **GitHub Actions**. |

> [!IMPORTANT]
> **Continuous Governance:** O GitHub Actions executa `./scripts/bmad-validate.sh` em todo PR. O merge só é permitido com o job em estado "Verde".

### 7.1 Development Commands (Cheat Sheet)

| Comando | Contexto | Propósito |
| :--- | :--- | :--- |
| `npm run dev` | **Frontend** | Inicia o servidor Next.js em modo desenvolvimento (watch). |
| `cargo test` | **Backend** | Executa a suíte de testes Rust no diretório `core/`. |
| `cargo run` | **Backend** | Inicia o daemon Rust (requer privilégios ou mock). |
| `./setup_ganache_enhanced.sh` | **System** | Script de setup inicial do ambiente. |

## 8. Protocolo de Segurança e Commits Atômicos (MANDATÓRIO)

### 8.0 Pré-Requisito de Commit: Validação Automática

* **Regra:** Sempre execute `@git-classify.sh` (ou `./scripts/git-classify.sh`) antes de realizar commits.
* **Propósito:** Este script valida o contexto do projeto, integridade dos artefatos e ajuda na classificação semântica do commit, garantindo conformidade com o BMAD Validation Checklist (`bmad-validate.sh`).
* **Nota:** O script deve ser usado como "gatekeeper" para evitar commits que quebrem as regras de governança.

Para garantir rastreabilidade e segurança cibernética em fluxos multi-agente, o seguinte protocolo é **INVIOLÁVEL**:

1. 🔄 **Atomic Commits:** Agentes são **OBRIGADOS** a realizar commits atômicos e granulares.
    * **NUNCA** faça um único commit gigante ("commitão") ao final da história.
    * Separe commits por escopo lógico: `feat(backend)`, `feat(frontend)`, `test(e2e)`, `docs(governance)`.
2. 🛡️ **Gatilhos de Auditoria:** Cada commit aciona validações no CI/CD. Commits misturados quebram a rastreabilidade e são REJEITADOS.
3. 🛑 **Check-point de Finalização:** É **PROIBIDO** marcar uma Story ou Epic como `completed` no `sprint-status.yaml` sem antes ter realizado os commits de todas as alterações.

### 8.1 Exemplo de Sequência de Commit Válida

```bash
# 1. Backend Work
git add core/
git commit -m "feat(backend): implement zfs dataset service logic"

# 2. Frontend Work
git add src/
git commit -m "feat(ui): add dataset management dashboard"

# 3. Validation
git add tests/
git commit -m "test(e2e): add dataset lifecycle tests"

# 4. Governance (Final Step)
./scripts/bmad-validate.sh # Must pass GREEN
git add docs/
git commit -m "docs: completion of story 2.4"
```

## 9. Universal Agent Behavior Protocols (BMAD Standard)

To ensure a perfect workflow and data safety across multiple AI agents, these protocols are **MANDATORY**.

### 9.1 The "Physical Commit" Trigger Rule (Process Safety)

* **Context:** Completing a task in code is not enough. The process state must be saved.
* **Rule:** The action of marking a checkbox `[x]` in a Story Documentation file is a **Physical Commit Trigger**.
* **Constraint:** You are BLOCKED from moving to the next task until the current task's checkbox is marked.
* **Pre-Requisite:** Before marking `[x]`, you MUST have: Code Implemented + Tests Passed + Validation Script Run (if applicable).

### 9.2 The "Atomic State" Rule

* **Rule:** Never mentally "queue" updates. Update the project state (docs/status) **immediately** after the physical work is done.
* **Why:** Consistency between "Disk State" and "Reality" avoids hallucinations if the agent is restarted.

### 9.3 The Safety Commit Protocol (Inviolable)

* **Principle:** Git is the ultimate "Save Point".
* **Rule 1 (Local First):** You MUST commit to local git **immediately** after any meaningful unit of work (e.g., "Created Component X", "Updated Doc Y").
  * *Do not wait for the full story to complete.*
  * *Safe Harbor:* Local commits ensure we can rollback even if remote push fails.
* **Rule 2 (Remote Sync):** Push to remote regularly to secure data off-site.
  * **Frequency:** Attempt to `git push` at least every 3 local commits or at every "Task Boundary" completion.
  * **Resilience (Retry Policy):** If `git push` fails (network/auth):
        1. Retry immediately (Attempt 1).
        2. Wait 5s and Retry (Attempt 2).
        3. Wait 10s and Retry (Attempt 3).
        4. **Fallback:** If it still fails, LOG the error, notify the user, but **CONTINUE** working. Your local commits are safe. Do not crash the workflow due to network issues.

## 10. Semantic Documentation Strategy (Code-to-RAG)

To enable future automated documentation generation and Vector Database indexing (RAG), strict commenting standards are enforced.

### 10.1 The "Why > What" Rule

* **Rule:** Comments must explain the *Intent* and *Context*, not just describe the code syntax.
* **Target:** `Public Interfaces`, `Helper Functions`, `Complex Algorithms`, and `State Management`.

### 10.2 Format Standard (Parsable Blocks)

* **Rust:** Use Triple Slash `///` for all pub structs/fns.
  * Required Sections: `# Purpose`, `# Arguments`, `# Returns`, `# Panic`.
* **TypeScript:** Use JSDoc `/** ... */` for all exported components/hooks.
  * Required Tags: `@description` (what/why), `@param`, `@returns`.

### 10.3 The "Semantic Link" Pattern

* Whenever code implements a specific requirement, reference it using the `@ref` tag:
  * `@ref [Story-ID] - [Context]`
  * *Example:* `// @ref Story-2.4 - Implements ZFS dataset creation logic`
* **Goal:** This tag allows future scripts to map Code Chunks <-> User Stories for the RAG system.

---

### Maintained by the BMAD Governance Team

* **bmm-workflow-status.yaml**: The central conductor of the agent orchestra.

---

### Maintained by the UX/Documentation Team

* **Living Documentation**: Documentation that breathes and evolves with the code.
