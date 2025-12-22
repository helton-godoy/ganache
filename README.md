# Ganache Enterprise NAS

O **Ganache** é uma solução moderna de gerenciamento de sistemas (NAS - Network Attached Storage) focada em simplicidade, segurança e alta disponibilidade, construída sobre o ecossistema Debian e ZFS.

## 🚀 Propósito

Prover uma interface web intuitiva e poderosa para administração de appliances de storage, eliminando a complexidade da linha de comando e garantindo resiliência de dados através da arquitetura ZFS over DRBD.

## 🛠️ Stack Tecnológico

![Tech Stack](https://skillicons.dev/icons?i=nextjs,ts,react,tailwind,rust,linux&perline=6)

- **Frontend:** Next.js 16 (React 19, Shadcn UI, Tailwind CSS)
- **Backend:** Rust (Axum, Tokio, ZFS/DRBD Wrappers)
- **API:** OpenAPI / REST (Migrando de tRPC legacy)
- **Sistema Alvo:** Debian 13 (Trixie)

## 📁 Estrutura do Projeto

O projeto utiliza um layout de **Monorepo Appliance**:

- `/src`: Frontend Next.js e lógica de API Client.
- `/core`: Backend Rust (Workspace com `ganache-core`, `ganache-api`, `ganache-lib`).
- `/docs`: Documentação Centralizada (SSoT conforme BMAD 6).

## 🧑‍💻 Guia de Desenvolvimento

### Requisitos

- Node.js 20+
- Rust (Cargo)
- ZFS & DRBD instalados (para execução real)

### Rodando o Ambiente

1. **Frontend:**

   ```bash
   npm install
   npm run dev
   ```

2. **Backend:**

   ```bash
   cd core/ganache-core
   cargo run
   ```

### 🔐 Autenticação Git

Para contribuir, configure seu token de acesso:

```bash
git config --global credential.helper store
# Ao realizar o primeiro push, use seu Username e o Token como senha.
```

## 📖 Documentação & Governança

Este projeto segue rigorosamente o princípio **Single Source of Truth (SSoT)** através do fluxo **BMAD 6**.

### 🛠️ Automação (BMAD Scripts)

As ferramentas abaixo garantem que a documentação e o código estejam sempre sincronizados:

- `./scripts/bmad-validate.sh`: Auditoria completa de conformidade e status (MANDATÓRIO antes de entregas).
- `./scripts/bmad-sync.sh`: Verifica drift entre código Rust/API e a arquitetura documentada.
- `./scripts/bmad-generate.sh`: Inicializa ou regenera os eixos centrais de documentação.

### 📚 Eixos Centrais

- **Visão:** [PRD (Requirements)](./docs/analysis/prd.md)
- **Arquitetura:** [Architecture SSoT](./docs/architecture.md)
- **Backlog:** [Epics & Stories](./docs/epics.md)
- **Diagramas:** [Diagramas Mermaid](./docs/diagrams/)
- **Status da Sprint:** [Sprint Status](./docs/sprint-artifacts/sprint-status.yaml)
- **Orquestração:** [Workflow Status](./docs/bmm-workflow-status.yaml)

## 🔧 Git Workflow & Githooks Inteligentes

O projeto GANACHE utiliza um sistema de **githooks inteligentes** para garantir qualidade de código e conformidade com padrões antes de cada commit e push.

### 🚦 Instalação dos Githooks

#### Obrigatório após o clone do repositório

```bash
./scripts/install-githooks.sh
```

Este comando instala automaticamente os seguintes hooks:

- **pre-commit**: Valida conflitos, segredos, formatação, linting, tipos e testes unitários
- **prepare-commit-msg**: Cria template de mensagem com auto-detecção de escopo
- **commit-msg**: Valida formato Conventional Commits
- **post-commit**: Notificações e verificações de sincronização
- **pre-push**: Validação BMAD completa, testes de integração (opcional) e builds

### 📝 Ferramenta de Classificação de Mudanças

Para visualizar e classificar mudanças antes de commitar:

```bash
# Classificar mudanças pendentes
./scripts/git-classify.sh

# Com validações de integridade (compilação, tipos, BMAD)
./scripts/git-classify.sh --validate

# Auto-remover build artifacts do stage
./scripts/git-classify.sh --fix

# Ver todas as opções
./scripts/git-classify.sh --help
```

### 🎯 Conventional Commits

Todas as mensagens de commit devem seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```text
tipo(escopo): descrição curta

Tipos válidos:
- feat:     Nova funcionalidade
- fix:      Correção de bug
- docs:     Mudanças em documentação
- style:    Formatação (não afeta código)
- refactor: Refatoração (sem adicionar features ou corrigir bugs)
- perf:     Melhoria de performance
- test:     Adição ou correção de testes
- chore:    Mudanças em build, configs, dependências
- ci:       Mudanças em CI/CD

Exemplos:
- feat(backend): adicionar suporte a pools ZFS
- fix(frontend): corrigir erro de autenticação no login
- docs: atualizar README com instruções de githooks
```

### 🔓 Bypass de Hooks (Apenas Emergências)

Em situações críticas, os hooks podem ser pulados, sendo obrigatório a justificativa no PR:

```bash
git commit --no-verify -m "fix: correção emergencial"
git push --no-verify
```

**⚠️ Use com moderação!** Hooks existem para proteger a qualidade do código.

### 🔄 Desinstalar Githooks

Se precisar desativar temporariamente:

```bash
./scripts/uninstall-githooks.sh
```

---
*Maintained by the Ganache Team*
