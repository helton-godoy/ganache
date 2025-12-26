# AGENTS.md

> Instruções para agentes de IA que trabalham neste repositório.
> Este arquivo é parseado automaticamente por assistentes de código como
> OpenAI Codex, Claude, Cursor, GitHub Copilot, Google Jules, etc.

---

## 🛑 PRIMEIRO: Carregue o Contexto

Este repositório segue o **BMAD-METHOD**. Antes de agir:

1. **Leia [project-context.md](./project-context.md)** - Contrato técnico mandatório
2. **Consulte workflows em [.agent/workflows/](./.agent/workflows/)** para tasks complexas

| Informação | Documento |
|------------|-----------|
| Regras Técnicas | [project-context.md](./project-context.md) |
| Arquitetura | [docs/architecture.md](./docs/architecture.md) |
| Requisitos (PRD) | [docs/analysis/prd.md](./docs/analysis/prd.md) |
| Stories Atuais | [docs/sprint-artifacts/](./docs/sprint-artifacts/) |

---

## 🛠️ Setup e Build

### Dependências

- Execute: `make install-dev-tools` para instalar todas as ferramentas de desenvolvimento
- Node.js 20+, Rust 1.65+, Python 3.10+

### Comandos Principais

| Comando | Propósito |
|---------|-----------|
| `npm run dev` | Inicia servidor Next.js |
| `cargo test` | Executa testes Rust |
| `make check-all` | Valida lint + format + security |
| `make help` | Lista todos os targets |

---

## ✅ Antes de Cada Commit (OBRIGATÓRIO)

```bash
make fmt        # Formata TODO o código automaticamente
make lint       # Verifica erros de lint
```

O pre-commit hook fará isso automaticamente.

---

## 📏 Padrões de Código

### Rust

- `cargo fmt` + `cargo clippy` antes de commitar
- Error handling: `Result<T, E>`, nunca `panic!` em produção
- Doc comments `///` com seções: `# Purpose`, `# Arguments`, `# Returns`

### TypeScript/React

- `prettier` para formatação, ESLint para linting
- Componentes funcionais com hooks
- Tailwind CSS + Shadcn UI
- Consuma API via hooks gerados (Orval/OpenAPI)

### Shell Scripts

- `shellcheck` + `shfmt`
- Sempre `set -e` no início
- Prefixe funções com `# @FUNC:`

---

## 🏷️ Semantic Tags (USE EM COMENTÁRIOS)

| Tag | Uso |
|-----|-----|
| `@REF: Story-X.Y` | Referência a Story/Epic |
| `@FUNC` | Função-chave do sistema |
| `@TODO` | Tarefa pendente |
| `@FIXME` | Código quebrado |
| `@SECURITY` | Código de segurança |
| `@CRITICAL` | Código crítico |

**Formato**: `@TAG: [contexto] - [descrição]`

---

## 🚫 Anti-Patterns

- ❌ `child_process.exec` no frontend
- ❌ tRPC (use OpenAPI/fetch)
- ❌ Lógica de negócio em componentes React
- ❌ Commits sem `make fmt`
- ❌ Secrets hardcoded

---

## 📁 Estrutura

```
/core       - Backend Rust (daemon privilegiado)
/src        - Frontend Next.js (UI)
/scripts    - Automação e qualidade
/docs       - Documentação
/.githooks  - Hooks customizados
```

---

## 📝 Conventional Commits

```
tipo(escopo): descrição

Tipos: feat, fix, docs, style, refactor, perf, test, chore, ci
```

---

## 🔍 Validação Final

Antes de marcar tarefa como completa:

```bash
./scripts/force-agent-compliance.sh
```

---

*Última atualização: 2025-12-25*
