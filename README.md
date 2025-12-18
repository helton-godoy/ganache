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
- **Status da Sprint:** [Sprint Status](./docs/sprint-artifacts/sprint-status.yaml)
- **Orquestração:** [Workflow Status](./docs/sprint-artifacts/bmm-workflow-status.yaml)

---
*Maintained by the Ganache Team*
