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

### 8.0 Githooks Inteligentes e Validação Automática

O projeto GANACHE implementa um **sistema completo de githooks** que valida automaticamente a qualidade do código e conformidade com padrões em cada commit e push.

#### Instalação Obrigatória

Após clonar o repositório, execute:

```bash
./scripts/install-githooks.sh
```

Este comando instala os seguintes hooks:

| Hook | Quando Executa | O Que Faz |
| :--- | :--- | :--- |
| **pre-commit** | Antes de cada commit | Valida conflitos de merge, segredos expostos, formatação de código (rustfmt, prettier), linting (clippy, ESLint), verificação de tipos TypeScript, testes unitários e conformidade BMAD |
| **prepare-commit-msg** | Antes de editar mensagem | Cria template de mensagem com auto-detecção de escopo baseado em arquivos modificados e referência automática a Story IDs do branch |
| **commit-msg** | Ao salvar mensagem | Valida formato Conventional Commits e consistência entre tipo de commit e arquivos modificados |
| **post-commit** | Após commit bem-sucedido | Notifica sucesso, verifica sincronização de `sprint-status.yaml`, auto-executa `bmad-sync.sh` se OpenAPI mudou, sugere push após múltiplos commits locais |
| **pre-push** | Antes de push remoto | Valida nome do branch, working tree limpo, executa validação BMAD completa, testes de integração (opcional), verifica builds de produção e registra auditoria de classificações |

#### Ferramenta de Classificação de Mudanças

Antes de realizar commits, use `git-classify.sh` para classificar e validar mudanças:

```bash
# Classificar mudanças pendentes por categoria (feat, test, docs, etc)
./scripts/git-classify.sh

# Executar validações completas de integridade (compilação, tipos, BMAD)
./scripts/git-classify.sh --validate

# Auto-remover build artifacts do staging
./scripts/git-classify.sh --fix

# Modo interativo para staging seletivo
./scripts/git-classify.sh --interactive
```

**Funcionalidades do git-classify.sh v2.0:**

* ✅ Detecta e bloqueia conflitos de merge (status `UU` e marcadores `<<<<<<<`)
* ✅ Rastreia arquivos removidos separadamente
* ✅ Valida integridade de código Rust e TypeScript
* ✅ Avisa sobre arquivos grandes (>1MB)
* ✅ Integra validação BMAD automaticamente com `--validate`
* ✅ Categoriza mudanças semanticamente (feat, fix, test, docs, etc.)

#### Bypass de Hooks (Apenas Emergências)

Em situações críticas, hooks podem ser pulados com `--no-verify`:

```bash
git commit --no-verify -m "fix: correção emergencial"
git push --no-verify
```

**⚠️ AVISO:** Use com extrema moderação! Hooks existem para proteger a qualidade do código e conformidade do projeto.

### 8.1 Pré-Requisito de Commit: Conventional Commits

* **Regra:** Todas as mensagens de commit DEVEM seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/).
* **Formato:** `tipo(escopo): descrição`
  * **Tipos válidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
  * **Escopo:** Área afetada (`backend`, `frontend`, `governance`, etc.) - detectado automaticamente pelo `prepare-commit-msg`
* **Validação:** O hook `commit-msg` bloqueia commits que não seguem o padrão.
* **Nota:** O hook `prepare-commit-msg` cria um template automático para facilitar a conformidade.

Para garantir rastreabilidade e segurança cibernética em fluxos multi-agente, o seguinte protocolo é **INVIOLÁVEL**:

### 8.2 Atomic Commits

1. 🔄 **Atomic Commits:** Agentes são **OBRIGADOS** a realizar commits atômicos e granulares.
   * **NUNCA** faça um único commit gigante ("commitão") ao final da história.
   * Separe commits por escopo lógico: `feat(backend)`, `feat(frontend)`, `test(e2e)`, `docs(governance)`.

2. 🛡️ **Gatilhos de Auditoria:** Cada commit aciona validações no CI/CD. Commits misturados quebram a rastreabilidade e são REJEITADOS.

3. 🛑 **Check-point de Finalização:** É **PROIBIDO** marcar uma Story ou Epic como `completed` no `sprint-status.yaml` sem antes ter realizado os commits de todas as alterações.

4. 🧹 **Zero Pending Policy:** Antes de finalizar qualquer tarefa, execute `scripts/ensure-clean-git.sh`. Se houver arquivos pendentes (modificados ou untracked), o agente está **BLOQUEADO** de prosseguir.

### 8.3 Exemplo de Sequência de Commit Válida

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

### 9.4 🛡️ PROTOCOLO ANTI-ALUCINAÇÃO (OBRIGATÓRIO PARA AGENTES DE IA)

**CRÍTICO:** Agentes de IA podem "alucinar" sobre ter completado operações que não foram efetivamente executadas. O seguinte protocolo é **INVIOLÁVEL**:

> [!CAUTION]
> **COMANDO OBRIGATÓRIO ANTES DE QUALQUER AFIRMAÇÃO:**
>
> ```bash
> ./scripts/force-agent-compliance.sh
> ```
>
> **VOCÊ DEVE EXECUTAR ESTE COMANDO E CAPTURAR O OUTPUT ANTES DE:**
>
> * Afirmar que fez commits
> * Afirmar que o repositório está limpo
> * Marcar tarefas como concluídas
> * Dizer "pode prosseguir"
> * Dizer "ambiente está compliant"
>
> **Se este script retornar exit 1 (falha):**
>
> * 🚫 Você **NÃO PODE** afirmar nada
> * 🚫 Você **DEVE** fazer os commits faltantes
> * 🚫 Você **DEVE** executar o script novamente até passar
>
> **Só quando retornar exit 0 (sucesso) você pode prosseguir.**

#### Regra 1: Verificação Obrigatória Antes de Afirmar Sucesso

Antes de afirmar que você commitou código ou completou uma tarefa, você **DEVE** executar:

```bash
./scripts/agent-commit-guard.sh --task "nome da tarefa" --expected-commits N
```

Este script valida:

* ✅ **ZERO** arquivos staged (se houver staged, commits não foram feitos!)
* ✅ Commits recentes existem (nas últimas 2 horas)
* ✅ Quantidade de commits bate com o esperado
* ✅ Repositório está limpo (sem unstaged/untracked críticos)

**Se o script FALHAR (exit 1):**

* 🚫 Você **NÃO PODE** afirmar que commitou
* 🚫 Você **NÃO PODE** marcar tarefas como concluídas
* ✅ Você **DEVE** fazer os commits faltantes
* ✅ Você **DEVE** executar o guard novamente

#### Regra 2: Verificação Pós-Commit

Após executar `git commit`, **IMEDIATAMENTE** verifique:

```bash
# Verificar que não há staged files
git diff --cached --name-only
# Deve retornar VAZIO

# Verificar último commit
git log -1 --oneline
# Deve mostrar SEU commit recente
```

**Se ainda houver arquivos staged:** Você **alucinuou** o commit. Repita o comando `git commit`.

#### Regra 3: Validação de Realidade ao Final

Ao finalizar **qualquer** tarefa multi-commit, execute:

```bash
./scripts/verify-commit-reality.sh
```

Este script detecta:

* ❌ Arquivos staged (alucinação de commit)
* ❌ Zero commits recentes (alucinação total)
* ⚠️ Arquivos unstaged/untracked (trabalho incompleto)

**Bloqueios Automáticos:**

* Se **staged > 0**: Script retorna **exit 1** (BLOQUEIO TOTAL)
* Se **commits recentes = 0**: Script retorna **exit 1** (BLOQUEIO TOTAL)

#### Regra 4: Comunicação Honesta

**NUNCA** afirme:

* ❌ "Commitei 4 mudanças atômicas" se você apenas stageu
* ❌ "Repositório está limpo" sem executar `git status`
* ❌ "Executei os testes" sem capturar o output

**SEMPRE:**

* ✅ Execute os scripts de validação **ANTES** de afirmar
* ✅ Mostre evidências (output de comandos)
* ✅ Admita se você **não tem certeza**

#### Exemplo de Uso Correto

```bash
# 1. Fazer commits (múltiplos)
git add core/
git commit -m "feat(backend): implementar serviço X"

git add tests/
git commit -m "test: adicionar testes do serviço X"

git add docs/
git commit -m "docs: documentar serviço X"

# 2. ANTES de afirmar sucesso: VALIDAR
./scripts/agent-commit-guard.sh --task "Implementar Serviço X" --expected-commits 3

# 3. Se passou: AGORA você pode afirmar
echo "✅ Commitei 3 mudanças atômicas e o guard passou!"

# 4. Validação final
./scripts/verify-commit-reality.sh
```

#### Penalidades por Violação

Se um agente afirmar sucesso sem executar os guards e for detectada alucinação:

1. **Primeira vez:** Aviso documentado
2. **Segunda vez:** Revisão obrigatória de todos os commits do agente
3. **Terceira vez:** Agente não pode fazer commits sem supervisão humana

**ESTA REGRA NÃO É NEGOCIÁVEL.**

---

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
