# AGENTS.md Template

> Template de AGENTS.md para novos projetos.
> Copie este arquivo para a raiz do seu projeto e customize conforme necessário.

---

## 🛠️ Setup e Build

### Dependências

<!-- Customize: Liste as dependências do seu projeto -->
- Execute: `make install-dev-tools` para instalar ferramentas de desenvolvimento
- Node.js 20+, <!-- Adicione outras versões -->

### Comandos Principais

| Comando | Propósito |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `make check-all` | Valida lint + format + security |
| `make help` | Lista todos os targets |

---

## ✅ Antes de Cada Commit (OBRIGATÓRIO)

```bash
make fmt        # Formata o código
make lint       # Verifica erros
```

---

## 📏 Padrões de Código

<!-- Customize: Adicione padrões específicos do seu projeto -->

### JavaScript/TypeScript

- `prettier` para formatação
- ESLint para linting
- Componentes funcionais com hooks

### Shell Scripts

- `shellcheck` + `shfmt`
- Sempre `set -e` no início

---

## 🏷️ Semantic Tags

Use estas tags em comentários:

| Tag | Uso |
|-----|-----|
| `@REF: Issue-123` | Referência a Issue/Story |
| `@FUNC` | Função-chave |
| `@TODO` | Tarefa pendente |
| `@FIXME` | Código quebrado |

---

## 🚫 Anti-Patterns

<!-- Customize: Adicione anti-patterns específicos -->
- ❌ Commits sem `make fmt`
- ❌ Secrets hardcoded

---

## 📁 Estrutura

<!-- Customize: Descreva a estrutura do seu projeto -->
```
/src        - Código fonte
/scripts    - Automação
/docs       - Documentação
```

---

## 📝 Conventional Commits

```
tipo(escopo): descrição

Tipos: feat, fix, docs, style, refactor, perf, test, chore, ci
```

---

*Template gerado pelo Code Standardization Toolkit*
