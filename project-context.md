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

## 8. Protocolo de Segurança e Commits Atômicos (MANDATÓRIO)

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

## 9. Regras de Comportamento do Agente (Agent Behavior)

Estas regras têm precedência sobre quaisquer instruções gerais:

1. **Leitura Proativa:** Ao iniciar qualquer tarefa, leia o `project-context.md` e o `AGENTS.md`.
2. **Contexto Limpo:** Nunca assuma que uma biblioteca existe. Verifique `package.json` ou `Cargo.toml`.
3. **Respeito ao Fluxo:**
    * Planejamento (`PLANNING`): Crie/Atualize o plano. Peça Aprovação.
    * Execução (`EXECUTION`): Implemente (Red-Green-Refactor).
    * Verificação (`VERIFICATION`): Testes e Validação BMAD.
    * Finalização: Commits Atômicos -> Atualização de Docs -> Handoff.
4. **Não Adivinhe:** Se um script falhar, investigue o erro. Não tente "pular" para o próximo passo.

## 9. Agent Workflow

---

### Maintained by the BMAD Governance Team

---

### Maintained by the UX/Documentation Team
