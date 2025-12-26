# Tech-Spec: Kit de Padronização de Código (Code Standardization Toolkit)

**Created:** 2025-12-25  
**Updated:** 2025-12-25  
**Status:** Ready for Development

---

## Overview

### Problem Statement

O projeto GANACHE utiliza o plugin Trunk do VSCode para linting, formatação e segurança. Contudo, depender exclusivamente de um plugin de IDE cria problemas:

1. **Portabilidade**: Desenvolvedores que não usam VSCode ficam sem as ferramentas
2. **Consistência CI/CD**: O CI/CD não tem acesso nativo às mesmas validações
3. **Reutilização**: Não há template exportável para novos projetos
4. **Controle**: Dependência de versões do plugin e suas atualizações
5. **Agentes LLM**: Não há orientação clara para agentes usarem ferramentas de formatação

### Solution

Criar um **toolkit standalone** de linting, formatação e segurança que:

- Funciona via linha de comando (`make lint`, `make fmt`, `make security`)
- Inclui script de instalação **idempotente** para Debian/Ubuntu
- **Auto-formata** código automaticamente via git hooks (pre-commit)
- Instala **LSP servers** para editores e agentes LLM
- É portátil para CI/CD (GitHub Actions)
- É exportável como template para outros projetos

### Scope

**In Scope:**

- Script de instalação idempotente (`install-dev-tools.sh`) para Debian/Ubuntu
- Makefile com targets para lint, fmt, security, check-all
- Scripts bash standalone para cada categoria de ferramenta
- Instalação de LSP servers para editores/agentes
- Extensão do pre-commit hook com **auto-format**
- Atualização de `.vscode/settings.json` e `extensions.json`
- Guia para agentes LLM usarem as ferramentas
- Exemplo de workflow GitHub Actions
- Documentação de uso como template exportável

**Out of Scope:**

- Modificação dos workflows GitHub Actions existentes (apenas exemplo)
- Substituição do Trunk (coexistência)
- Suporte a outras distros além de Debian/Ubuntu (por enquanto)

---

## Context for Development

### Codebase Patterns

O projeto segue padrões bem definidos em `project-context.md`:

| Componente | Padrão |
|------------|--------|
| **Git Hooks** | `.githooks/` com instalação via `scripts/install-githooks.sh` |
| **Validação** | `scripts/bmad-validate.sh` como validação master |
| **Classificação** | `scripts/git-classify.sh` para análise semântica |
| **CI/CD** | `.github/workflows/` com múltiplos pipelines |
| **Node Scripts** | `package.json` com `lint`, `type-check`, `test:e2e` |

### Files to Reference

| Arquivo | Propósito |
|---------|-----------|
| [.trunk/trunk.yaml](file:///root/GANACHE/.trunk/trunk.yaml) | Configuração atual do Trunk (lista de ferramentas) |
| [.githooks/pre-commit](file:///root/GANACHE/.githooks/pre-commit) | Hook de pre-commit existente |
| [scripts/install-githooks.sh](file:///root/GANACHE/scripts/install-githooks.sh) | Instalador de hooks |
| [Makefile](file:///root/GANACHE/Makefile) | Makefile existente (mínimo) |
| [package.json](file:///root/GANACHE/package.json) | Scripts Node existentes |
| [.vscode/settings.json](file:///root/GANACHE/.vscode/settings.json) | Configurações VSCode |
| [.vscode/extensions.json](file:///root/GANACHE/.vscode/extensions.json) | Extensões recomendadas (vazio) |

### Technical Decisions

1. **Instalação Idempotente**: O script pode ser executado múltiplas vezes sem efeitos colaterais
2. **Auto-Format no Pre-Commit**: Código é formatado automaticamente antes do commit
3. **LSP Servers**: Instalação de rust-analyzer, typescript-language-server, pyright, bash-language-server
4. **Makefile Delegando para Scripts**: Interface unificada delegando para scripts modulares
5. **Tolerância com Logging**: Se ferramenta não estiver instalada, loga warning e continua

---

## Proposed Architecture

### Directory Structure

```shell
├── Makefile                          # [MODIFY] Interface unificada
├── AGENTS.md                         # [NEW] Instruções para agentes LLM
├── scripts/
│   ├── code-quality/                 # [NEW] Diretório do toolkit
│   │   ├── install-dev-tools.sh      # Script de instalação completo
│   │   ├── lint.sh                   # Executa todos os linters
│   │   ├── fmt.sh                    # Formata código automaticamente
│   │   ├── fmt-check.sh              # Verifica formatação (para CI)
│   │   ├── security.sh               # Executa scanners de segurança
│   │   ├── check-all.sh              # Executa tudo (lint + fmt-check + security)
│   │   ├── config.sh                 # Configuração de linguagens ativas
│   │   └── templates/                # [NEW] Templates exportáveis
│   │       └── AGENTS-example.md     # Template de AGENTS.md para novos projetos
│   │
│   └── ...existing scripts...
│
├── .githooks/
│   └── pre-commit                    # [MODIFY] Adicionar auto-format
│
├── .vscode/
│   ├── settings.json                 # [MODIFY] Adicionar formatters
│   └── extensions.json               # [MODIFY] Recomendar extensões
│
└── .github/
    └── workflows/
        └── code-quality.yml.example  # [NEW] Exemplo de workflow
```

### AGENTS.md Standard

O arquivo `AGENTS.md` é o **padrão emergente** para instruir agentes de IA em projetos de código. Adotado por OpenAI, Google (Jules), Cursor, Amp, Factory e mais de **60.000 projetos open-source**.

#### Diferenças entre AGENTS.md e README.md

| Aspecto | README.md | AGENTS.md |
|---------|-----------|-----------|
| **Público** | Humanos | Agentes LLM |
| **Conteúdo** | Visão geral, instalação | Regras, comandos, restrições |
| **Estilo** | Narrativo, amigável | Diretivo, máquina-parseável |
| **Verbosidade** | Moderada | Alta (quanto mais contexto, melhor) |

#### Estrutura do AGENTS.md (Este Projeto)

```markdown
# AGENTS.md

> Instruções para agentes de IA que trabalham neste repositório.
> Este arquivo é parseado automaticamente por assistentes de código como
> OpenAI Codex, Claude, Cursor, GitHub Copilot, Google Jules, etc.

## 🛠️ Setup e Build

### Dependências
- Execute: `make install-dev-tools` para instalar todas as ferramentas de desenvolvimento
- Node.js 20+, Rust 1.65+, Python 3.10+

### Comandos Principais
| Comando | Propósito |
|---------|-----------|
| `npm run dev` | Inicia servidor Next.js em dev mode |
| `cargo test` | Executa testes Rust |
| `cargo run` | Inicia daemon Rust |
| `make check-all` | Valida lint + format + security |

## ✅ Antes de Cada Commit

**OBRIGATÓRIO**: Execute estes comandos antes de qualquer commit:

```bash
make fmt        # Formata TODO o código automaticamente
make lint       # Verifica erros de lint
```

O pre-commit hook fará isso automaticamente, mas é boa prática executar durante o desenvolvimento.

## 📏 Padrões de Código

### Rust

- Use `cargo fmt` antes de commitar
- Use `cargo clippy` para verificar warnings
- Siga as convenções de `ganache-lib` (puro) vs `ganache-core` (orquestração)
- Error handling: `Result<T, E>`, nunca `panic!` em produção

### TypeScript/React

- Use `prettier` para formatação
- Use ESLint para linting
- Componentes funcionais com hooks
- Use Tailwind CSS + Shadcn UI
- Consuma API via hooks gerados (Orval/OpenAPI)

### Shell Scripts

- Use `shellcheck` para linting
- Use `shfmt` para formatação
- Sempre inclua `set -e` no início

### Python (se aplicável)

- Use `black` + `isort` para formatação
- Use `ruff` para linting
- Use `bandit` para segurança

## 🚫 Anti-Patterns (NÃO FAÇA)

- ❌ **Nunca** use `child_process.exec` no frontend Node.js
- ❌ **Nunca** use tRPC - somos desacoplados, use `fetch` ou cliente OpenAPI
- ❌ **Nunca** coloque lógica de negócio em componentes React
- ❌ **Nunca** faça commits sem executar `make fmt` primeiro
- ❌ **Nunca** pule os git hooks (exceto emergências)

## 📁 Estrutura do Projeto

- `/core` - Backend Rust (daemon privilegiado)
- `/src` - Frontend Next.js (UI não-privilegiada)
- `/scripts` - Scripts de automação e qualidade
- `/docs` - Documentação do projeto
- `/.githooks` - Hooks do Git

## 🔒 Segurança

- O frontend NUNCA tem acesso sudo
- Todas as operações privilegiadas passam pelo daemon Rust
- Secrets NUNCA devem ser commitados (use variáveis de ambiente)
- O pre-commit hook escaneia automaticamente por secrets expostos

## 📝 Conventional Commits

Todas as mensagens de commit DEVEM seguir o padrão:

```yaml
tipo(escopo): descrição

Tipos: feat, fix, docs, style, refactor, perf, test, chore, ci
```

Exemplos:

- `feat(backend): implementar endpoint de dataset`
- `fix(ui): corrigir overflow no dashboard`
- `docs: atualizar AGENTS.md`

## 🔍 Validação Obrigatória

Antes de marcar qualquer tarefa como completa, execute:

```bash
./scripts/force-agent-compliance.sh
```

Este script valida que:

- Não há arquivos staged pendentes
- Commits recentes existem
- Repositório está limpo

```bash
./scripts/force-agent-compliance.sh
```

#### Template AGENTS-example.md (Para Novos Projetos)

O instalador criará um arquivo `scripts/code-quality/templates/AGENTS-example.md` que pode ser copiado e adaptado para novos projetos.

---

### Semantic Tags System (RAG-Friendly Documentation)

Sistema padronizado de tags para documentação de código otimizado para:

- **Indexação RAG** (Retrieval-Augmented Generation)
- **Busca com grep/ripgrep**
- **Navegação manual por desenvolvedores e agentes LLM**
- **Geração automática de documentação**

> **Nota:** Este sistema complementa as convenções JSDoc e Rust Docs já definidas no `project-context.md`, adicionando tags semânticas específicas para facilitar a localização e indexação.

#### Formato Base das Tags

Todas as tags seguem o formato consistente para facilitar busca via grep:

```
@TAG_NAME: [contexto] - [descrição detalhada]
```

**Convenções:**

- Tags são SEMPRE em MAIÚSCULAS
- Sempre precedidas por `@`
- Podem ser usadas dentro de comentários de qualquer linguagem
- Devem estar em uma linha dedicada (não inline com código)

#### Categorias de Tags

##### 1. Tags de Rastreabilidade (Linking)

| Tag | Propósito | Exemplo |
|-----|-----------|---------|
| `@REF` | Referência a Story/Epic/Requisito | `@REF: Story-2.4 - Implements ZFS dataset creation` |
| `@IMPLEMENTS` | Indica implementação de interface/contrato | `@IMPLEMENTS: OpenAPI /api/v1/datasets` |
| `@DEPENDS` | Dependência crítica de outro módulo | `@DEPENDS: ganache-lib::zfs - Requires ZFS wrappers` |
| `@USES` | Utiliza serviço/função externa | `@USES: SecurityEventService for audit logging` |

##### 2. Tags de Estado/Atenção

| Tag | Propósito | Prioridade | Exemplo |
|-----|-----------|------------|---------|
| `@TODO` | Tarefa pendente não urgente | Baixa | `@TODO: Add pagination support` |
| `@FIXME` | Código quebrado que precisa correção | Alta | `@FIXME: Race condition on concurrent access` |
| `@BUG` | Bug conhecido documentado | Crítica | `@BUG: #123 - Memory leak in long-running sessions` |
| `@HACK` | Workaround temporário | Média | `@HACK: Workaround for upstream bug in v2.3` |
| `@XXX` | Código que funciona mas precisa revisão | Média | `@XXX: Magic number, needs refactor` |

##### 3. Tags de Documentação Semântica

| Tag | Propósito | Exemplo |
|-----|-----------|---------|
| `@FUNC` | Marca função-chave do sistema | `@FUNC: Core dataset creation logic` |
| `@ENTRY` | Ponto de entrada principal | `@ENTRY: Main API handler for /datasets` |
| `@CRITICAL` | Código crítico para segurança/estabilidade | `@CRITICAL: Authentication validation` |
| `@HOT` | Código de hot path (performance) | `@HOT: Called 1000x per second, optimize` |
| `@UNSAFE` | Código unsafe que requer atenção | `@UNSAFE: Raw pointer manipulation for ZFS` |

##### 4. Tags de Otimização e Performance

| Tag | Propósito | Exemplo |
|-----|-----------|---------|
| `@OPT` | Oportunidade de otimização | `@OPT: Can be parallelized with rayon` |
| `@PERF` | Nota sobre performance | `@PERF: O(n²) - acceptable for n < 100` |
| `@CACHE` | Behavior de cache documentado | `@CACHE: Results cached for 5 minutes` |
| `@ASYNC` | Nota sobre comportamento async | `@ASYNC: Non-blocking, returns immediately` |

##### 5. Tags de Arquitetura

| Tag | Propósito | Exemplo |
|-----|-----------|---------|
| `@LAYER` | Indica camada arquitetural | `@LAYER: Domain - Business logic only` |
| `@API` | Marca interface pública | `@API: v1 - Stable, do not break` |
| `@INTERNAL` | Marca como uso interno apenas | `@INTERNAL: Not for external use` |
| `@DEPRECATED` | Marca como obsoleto | `@DEPRECATED: Use DatasetServiceV2 instead` |

##### 6. Tags de Segurança

| Tag | Propósito | Exemplo |
|-----|-----------|---------|
| `@SECURITY` | Nota de segurança importante | `@SECURITY: Validates JWT before processing` |
| `@AUDIT` | Código relacionado a auditoria | `@AUDIT: Logs all access attempts` |
| `@PRIVILEGE` | Requer privilégios elevados | `@PRIVILEGE: Requires root for ZFS ops` |
| `@SENSITIVE` | Manipula dados sensíveis | `@SENSITIVE: Contains user credentials` |

#### Exemplos de Uso por Linguagem

**Rust:**

```rust
/// Creates a new ZFS dataset with the given configuration.
///
/// # Purpose
/// Entry point for dataset creation, handles validation and delegation
/// to the ZFS library.
///
/// # Arguments
/// * `config` - Dataset configuration including name, quota, compression
///
/// # Returns
/// * `Ok(Dataset)` - Created dataset metadata
/// * `Err(ZfsError)` - Creation failure with detailed error
///
/// @REF: Story-2.4 - Dataset creation implementation
/// @FUNC: Core dataset creation logic
/// @CRITICAL: Validates quota before creation to prevent disk exhaustion
/// @USES: ganache-lib::zfs::create_dataset
pub fn create_dataset(config: DatasetConfig) -> Result<Dataset, ZfsError> {
    // @SECURITY: Validate user has permission to create datasets
    validate_permissions(&config.owner)?;
    
    // @TODO: Add support for encryption options
    // @PERF: O(1) - ZFS creation is constant time
    zfs::create_dataset(&config)
}
```

**TypeScript:**

```typescript
/**
 * Dataset creation hook for React components.
 *
 * @description Provides mutation hook for creating ZFS datasets via API.
 * Handles loading state, error handling, and cache invalidation.
 *
 * @REF Story-2.4 - Frontend dataset creation UI
 * @FUNC Core mutation hook for dataset operations
 * @USES @tanstack/react-query for state management
 *
 * @returns Mutation object with create function and state
 */
export function useCreateDataset() {
  // @CACHE: Invalidates 'datasets' query on success
  return useMutation({
    mutationFn: createDataset,
    onSuccess: () => {
      // @TODO: Add optimistic update
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}
```

**Shell Script:**

```bash
#!/bin/bash
# @FUNC: Main installation script for dev tools
# @REF: Tech-Spec-Code-Standardization - install-dev-tools.sh
# @DEPENDS: apt, npm, pip, cargo

# @SECURITY: Requires sudo for apt installations
check_sudo() {
    # @FIXME: Should use polkit instead of raw sudo
    if [ "$EUID" -ne 0 ]; then
        echo "Please run with sudo"
        exit 1
    fi
}

# @OPT: Could parallelize pip and npm installs
install_python_tools() {
    # @TODO: Add version pinning
    pip install black isort ruff bandit
}
```

#### Comandos de Busca Úteis

```bash
# Encontrar todos os TODOs
grep -rn "@TODO" --include="*.rs" --include="*.ts" --include="*.sh"

# Listar todos os FIXMEs críticos
rg "@FIXME" -g "*.rs" -g "*.ts"

# Encontrar código relacionado a uma Story
grep -rn "@REF: Story-2.4" .

# Listar todas as funções-chave
rg "@FUNC" --line-number

# Encontrar código de segurança crítico
rg "@SECURITY|@CRITICAL|@PRIVILEGE" -g "*.rs"

# Gerar relatório de TODOs/FIXMEs/BUGs
rg "@(TODO|FIXME|BUG|HACK)" --count-matches | sort -t: -k2 -nr
```

#### Script de Validação de Tags

O toolkit incluirá um script `scripts/code-quality/validate-tags.sh` que:

- Verifica se todos os `@REF` apontam para Stories válidas
- Lista `@FIXME` e `@BUG` não resolvidos
- Gera relatório de dívida técnica baseado em tags
- Valida formato correto das tags

#### Integração com RAG

Para sistemas de RAG, as tags servem como **metadata enriquecida**:

1. **Chunking Semântico**: Blocos de código podem ser chunkeados por tag `@FUNC` ou `@ENTRY`
2. **Filtragem por Categoria**: Queries podem filtrar por `@SECURITY` ou `@CRITICAL`
3. **Rastreabilidade**: `@REF` permite mapear código ↔ requisitos automaticamente
4. **Priorização**: Tags como `@HOT` e `@CRITICAL` indicam importância para retrieval

---

### Tools Matrix

| Categoria | Ferramenta | Linguagem | Comando | Instalação Debian |
|-----------|------------|-----------|---------|-------------------|
| **Lint:Python** | bandit | Python | `bandit -r .` | `pip install bandit` |
| **Lint:Python** | ruff | Python | `ruff check .` | `pip install ruff` |
| **Lint:Rust** | clippy | Rust | `cargo clippy` | `rustup component add clippy` |
| **Lint:JS/TS** | eslint | JS/TS | `npx eslint .` | `npm install -g eslint` |
| **Lint:Shell** | shellcheck | Shell | `shellcheck scripts/*.sh` | `apt install shellcheck` |
| **Lint:YAML** | yamllint | YAML | `yamllint .` | `pip install yamllint` |
| **Lint:Markdown** | markdownlint | MD | `npx markdownlint-cli2 '**/*.md'` | `npm install -g markdownlint-cli2` |
| **Lint:Actions** | actionlint | GH | `actionlint` | Binary download |
| **Fmt:Python** | black | Python | `black .` | `pip install black` |
| **Fmt:Python** | isort | Python | `isort .` | `pip install isort` |
| **Fmt:Rust** | rustfmt | Rust | `cargo fmt` | `rustup component add rustfmt` |
| **Fmt:JS/TS** | prettier | JS/TS | `npx prettier --write .` | `npm install -g prettier` |
| **Fmt:Shell** | shfmt | Shell | `shfmt -w scripts/` | `apt install shfmt` ou binary |
| **Fmt:TOML** | taplo | TOML | `taplo fmt` | `cargo install taplo-cli` |
| **Fmt:SVG** | svgo | SVG | `npx svgo -r .` | `npm install -g svgo` |
| **Security** | osv-scanner | All | `osv-scanner --lockfile=*` | Binary download |
| **Security** | trufflehog | All | `trufflehog filesystem .` | Binary download |
| **Security** | checkov | IaC | `checkov -d .` | `pip install checkov` |

### LSP Servers Matrix

| Linguagem | LSP Server | Instalação |
|-----------|------------|------------|
| **Rust** | rust-analyzer | `rustup component add rust-analyzer` |
| **TypeScript/JS** | typescript-language-server | `npm install -g typescript-language-server typescript` |
| **Python** | pyright | `npm install -g pyright` |
| **Bash** | bash-language-server | `npm install -g bash-language-server` |
| **YAML** | yaml-language-server | `npm install -g yaml-language-server` |
| **JSON** | vscode-json-languageserver | `npm install -g vscode-langservers-extracted` |
| **Markdown** | marksman | Binary download |

---

## Implementation Plan

### Tasks

- [ ] **Task 1: Criar estrutura de diretórios**
  - Criar `scripts/code-quality/`

- [ ] **Task 2: Implementar `scripts/code-quality/config.sh`**
  - Definir variáveis de quais linguagens estão ativas
  - Definir paths de exclusão (node_modules, target, .git)
  - Centralizar configurações

- [ ] **Task 3: Implementar `scripts/code-quality/install-dev-tools.sh`**
  - Script idempotente completo para Debian/Ubuntu
  - Verificar se ferramenta já está instalada antes de instalar
  - Instalar: apt packages, pip packages, npm packages, cargo packages, binaries
  - Instalar LSP servers
  - Instalar Rust toolchain components (rustfmt, clippy, rust-analyzer)
  - Exibir resumo final do que foi instalado

- [ ] **Task 4: Implementar `scripts/code-quality/fmt.sh`**
  - Formatar código com todas as ferramentas disponíveis
  - Detectar automaticamente quais ferramentas estão instaladas
  - **Modificar arquivos in-place**
  - Exibir resumo de arquivos modificados

- [ ] **Task 5: Implementar `scripts/code-quality/fmt-check.sh`**
  - Verificar formatação sem alterar arquivos
  - Retornar exit code 1 se houver diferenças
  - Listar arquivos que precisam formatação
  - Usado no CI/CD

- [ ] **Task 6: Implementar `scripts/code-quality/lint.sh`**
  - Executar todos os linters disponíveis
  - Agregar resultados de cada linter
  - Retornar exit code 1 se qualquer linter falhar

- [ ] **Task 7: Implementar `scripts/code-quality/security.sh`**
  - Executar scanners de segurança
  - osv-scanner para vulnerabilidades de dependências
  - trufflehog para detecção de secrets
  - checkov para IaC (se aplicável)

- [ ] **Task 8: Implementar `scripts/code-quality/check-all.sh`**
  - Orquestrar lint + fmt-check + security
  - Exibir resumo consolidado
  - Exit code 0 apenas se tudo passar

- [ ] **Task 9: Expandir Makefile**
  - Adicionar targets: `lint`, `fmt`, `fmt-check`, `security`, `check-all`
  - Adicionar target `install-dev-tools`
  - Documentar usage como comentários no próprio Makefile

- [ ] **Task 10: Estender `.githooks/pre-commit`**
  - Adicionar chamada ao `fmt.sh` (auto-format)
  - Fazer `git add` dos arquivos formatados automaticamente
  - Manter validações existentes
  - Adicionar flag para skip toolkit (`SKIP_QUALITY_TOOLKIT=1`)

- [ ] **Task 11: Atualizar `.vscode/settings.json`**
  - Adicionar configurações de formatação on save
  - Configurar formatters por linguagem
  - Habilitar format on paste, format on type

- [ ] **Task 12: Atualizar `.vscode/extensions.json`**
  - Recomendar extensões: rust-analyzer, ESLint, Prettier, Python, ShellCheck, etc.

- [ ] **Task 13: Criar `AGENTS.md` na raiz do projeto**
  - Criar arquivo seguindo o template definido na spec
  - Incluir todas as seções: Setup, Padrões, Anti-Patterns, Segurança
  - Integrar com `project-context.md` existente
  - Referenciar comandos do toolkit

- [ ] **Task 14: Criar exemplo de GitHub Actions**
  - Criar `code-quality.yml.example`
  - Demonstrar job de lint, fmt-check e security
  - Incluir cache de ferramentas
  - Incluir matrix para múltiplas linguagens

- [ ] **Task 15: Criar documentação de exportação**
  - Documentar como copiar toolkit para novo projeto
  - Listar requisitos e adaptações necessárias
  - Incluir checklist de setup
  - Criar script `scripts/code-quality/export-toolkit.sh`

- [ ] **Task 16: Implementar `scripts/code-quality/validate-tags.sh`**
  - Verificar se `@REF` aponta para Stories válidas em `docs/sprint-artifacts/`
  - Listar todos os `@FIXME`, `@BUG`, `@TODO` não resolvidos
  - Gerar relatório de dívida técnica baseado em tags
  - Validar formato correto das tags (`@TAG: contexto - descrição`)
  - Integrar com `check-all.sh` como step opcional

- [ ] **Task 17: Criar template `scripts/code-quality/templates/AGENTS-example.md`**
  - Template genérico exportável para novos projetos
  - Incluir placeholders para customização
  - Documentar como adaptar para diferentes stacks

- [ ] **Task 18: Atualizar `export-toolkit.sh` para incluir AGENTS.md**
  - Copiar AGENTS-example.md para novo projeto
  - Renomear para AGENTS.md
  - Instruir usuário a customizar

- [ ] **Task 19: Validação e testes**
  - Executar `install-dev-tools.sh` em ambiente limpo
  - Executar `check-all.sh` no próprio projeto
  - Testar pre-commit com arquivo mal formatado
  - Verificar que ferramentas funcionam corretamente
  - Validar que AGENTS.md é parseável por agentes
  - Testar `validate-tags.sh` com tags de exemplo

- [ ] **Task 20: Commit atômico e atualização final**
  - Commitar seguindo Conventional Commits
  - Atualizar sprint-status.yaml

---

## Acceptance Criteria

### Instalação

- [ ] **AC 1**: Given ambiente Debian/Ubuntu limpo, When executar `./scripts/code-quality/install-dev-tools.sh`, Then todas as ferramentas são instaladas sem erros
- [ ] **AC 2**: Given ambiente com ferramentas já instaladas, When executar `install-dev-tools.sh` novamente, Then script é idempotente (não reinstala)
- [ ] **AC 3**: Given instalação completa, When verificar LSP servers, Then rust-analyzer, typescript-language-server, pyright, bash-language-server estão disponíveis

### Formatação

- [ ] **AC 4**: Given código mal formatado, When executar `make fmt`, Then código é formatado automaticamente
- [ ] **AC 5**: Given código mal formatado, When executar `make fmt-check`, Then script retorna exit code 1
- [ ] **AC 6**: Given tentativa de commit com código mal formatado, When git commit, Then pre-commit **auto-formata** e adiciona arquivos ao commit

### Linting

- [ ] **AC 7**: Given projeto com código Rust, When executar `make lint`, Then clippy é executado e reporta warnings/errors
- [ ] **AC 8**: Given projeto com código TypeScript, When executar `make lint`, Then ESLint é executado

### Segurança

- [ ] **AC 9**: Given projeto com dependências, When executar `make security`, Then osv-scanner e trufflehog são executados

### Qualidade Geral

- [ ] **AC 10**: Given todos os scripts implementados, When executar `make check-all`, Then lint + fmt-check + security são executados
- [ ] **AC 11**: Given ferramentas não instaladas, When executar qualquer script, Then script exibe mensagem informativa e pula ferramenta

### Editor/Agentes

- [ ] **AC 12**: Given VSCode aberto no projeto, When abrir arquivo, Then extensões recomendadas são sugeridas
- [ ] **AC 13**: Given arquivo TypeScript aberto, When salvar, Then arquivo é formatado automaticamente (format on save)
- [ ] **AC 14**: Given agente LLM iniciando trabalho no projeto, When ler `AGENTS.md`, Then agente tem instruções claras sobre ferramentas, padrões e restrições
- [ ] **AC 15**: Given projeto com `AGENTS.md`, When agente executa comandos listados, Then comandos funcionam conforme documentado

### Exportabilidade

- [ ] **AC 16**: Given novo projeto, When copiar `scripts/code-quality/` e Makefile targets, Then toolkit funciona standalone
- [ ] **AC 17**: Given toolkit exportado, When executar `install-dev-tools.sh`, Then ferramentas são instaladas no novo projeto
- [ ] **AC 18**: Given toolkit exportado, When verificar `AGENTS-example.md`, Then template está presente e customizável
- [ ] **AC 19**: Given novo projeto com template aplicado, When agente LLM lê `AGENTS.md`, Then agente entende os padrões do projeto

### Semantic Tags (Documentação RAG-Friendly)

- [ ] **AC 20**: Given código com tags semânticas (`@REF`, `@FUNC`, `@TODO`), When executar `rg "@REF"`, Then todas as referências a Stories são listadas
- [ ] **AC 21**: Given `validate-tags.sh` implementado, When executar script, Then relatório de dívida técnica é gerado (TODOs, FIXMEs, BUGs)
- [ ] **AC 22**: Given código Rust/TS/Shell, When adicionar nova função, Then desenvolvedor/agente inclui tags obrigatórias (`@FUNC`, `@REF` se aplicável)

---

## Additional Context

### Testing Strategy

1. **Teste da Instalação**:

   ```bash
   # Em container Debian limpo
   docker run -it debian:bookworm bash
   apt update && apt install -y git curl
   git clone <repo>
   cd <repo>
   ./scripts/code-quality/install-dev-tools.sh
   ```

1. **Teste do Auto-Format (Pre-Commit)**:

   ```bash
   # Criar arquivo mal formatado
   echo "const x=1" > test.ts
   git add test.ts
   git commit -m "test: formatting"
   # Verificar que arquivo foi formatado
   cat test.ts  # Deve mostrar "const x = 1;"
   ```

1. **Teste do Makefile**:

   ```bash
   make fmt          # Deve formatar
   make fmt-check    # Deve passar (após fmt)
   make lint         # Deve rodar linters
   make security     # Deve rodar scanners
   make check-all    # Deve rodar tudo
   ```

1. **Teste Manual VSCode**:
   - Abrir projeto no VSCode
   - Verificar que extensões são recomendadas
   - Abrir arquivo .ts, fazer mudança, salvar
   - Verificar que arquivo foi formatado

### Guia para Agentes LLM (Preview)

```markdown
# Guia de Ferramentas para Agentes LLM

## Antes de Commitar

SEMPRE execute antes de commitar código:
- `make fmt` - Formata todo o código automaticamente
- `make lint` - Verifica erros de lint

## Comandos Disponíveis

| Comando | Propósito |
|---------|-----------|
| `make fmt` | Formata código (modifica arquivos) |
| `make fmt-check` | Verifica formatação (não modifica) |
| `make lint` | Executa linters |
| `make security` | Scan de segurança |
| `make check-all` | Executa tudo |

## Regra de Ouro

Código deve estar SEMPRE formatado. O pre-commit fará isso automaticamente,
mas é boa prática executar `make fmt` durante o desenvolvimento.
```

### Notes

- O script `install-dev-tools.sh` requer **sudo** para instalações via apt
- Ferramentas Go (actionlint, osv-scanner) são instaladas via binary download para evitar dependência de Go
- O pre-commit agora **modifica** arquivos e faz `git add`, diferente do comportamento anterior de apenas verificar

---

## How to Export as Template

### Passos para Novo Projeto

1. **Executar script de exportação**:

   ```bash
   ./scripts/code-quality/export-toolkit.sh /path/to/new-project
   ```

   Ou manualmente:

2. **Copiar estrutura**:

   ```bash
   mkdir -p /novo-projeto/scripts/code-quality
   cp -r scripts/code-quality/* /novo-projeto/scripts/code-quality/
   ```

3. **Copiar targets do Makefile** (adicionar ao Makefile existente):

   ```makefile
   # ============================================================
   # Code Quality Toolkit
   # ============================================================
   
   .PHONY: fmt fmt-check lint security check-all install-dev-tools
   
   install-dev-tools:
    ./scripts/code-quality/install-dev-tools.sh
   
   fmt:
    ./scripts/code-quality/fmt.sh
   
   fmt-check:
    ./scripts/code-quality/fmt-check.sh
   
   lint:
    ./scripts/code-quality/lint.sh
   
   security:
    ./scripts/code-quality/security.sh
   
   check-all:
    ./scripts/code-quality/check-all.sh
   ```

4. **Configurar linguagens ativas** (editar `scripts/code-quality/config.sh`):

   ```bash
   ENABLE_RUST=true
   ENABLE_PYTHON=true
   ENABLE_JAVASCRIPT=true
   ENABLE_SHELL=true
   ```

5. **Instalar ferramentas**:

   ```bash
   make install-dev-tools
   ```

6. **Instalar hooks**:

   ```bash
   ./scripts/install-githooks.sh
   ```

7. **Verificar instalação**:

   ```bash
   make check-all  # Smoke test
   ```

---

**Recommended Next Step:** Run `*quick-dev` with this spec in a fresh context for implementation.
