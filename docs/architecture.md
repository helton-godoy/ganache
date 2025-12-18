# Arquitetura do Sistema - Ganache Appliance

## 1. Visão Geral e Filosofia

O **Ganache** é um Storage Appliance de alta disponibilidade que implementa uma "Arquitetura Pragmática" para rodar ZFS sobre dispositivos de Hardware RAID sem suporte a Passthrough/HBA.

- **Modelo:** Monorepo Appliance.
- **Backend:** Daemon em Rust para operações privilegiadas.
- **Frontend:** Single Page Application (SPA) em Next.js.
- **Comunicação:** API REST baseada em OpenAPI (migrando de tRPC legacy).

## 2. Estrutura do Projeto (Source Tree)

```text
/root/GANACHE/
├── docs/                   # Documentação SSoT (BMAD 6)
├── src/                    # [Frontend] Next.js App Router (React 19)
│   ├── api/                # Clientes API e SDK OpenAPI (Orval)
│   ├── app/                # Rotas e Layouts
│   ├── components/         # Componentes UI (Shadcn + Radix)
│   └── trpc/               # [LEGACY] Camada tRPC em desativação
├── core/                   # [Backend] Rust Workspace
│   ├── ganache-core/       # Daemon Principal (Axum + Tokio)
│   ├── ganache-api/        # Contratos OpenAPI e Tipos Serde
│   └── ganache-lib/        # Lógica de Sistema (ZFS, DRBD, Networking)
└── .bmad/                  # Configurações de Governança BMAD
```

## 3. Arquitetura de Backend (Rust)

O backend é dividido em três crates principais para garantir separação de responsabilidades e reuso de tipos:

### 3.1 ganache-lib

- **Papel:** Abstração de baixo nível (System Wrapper).
- **Responsabilidades:** Execução de comandos shell (`zpool`, `zfs`, `drbdadm`), parsing de outputs e interação com o sistema operacional Debian.
- **Padrão:** Wrappers seguros que garantem que comandos malformados não sejam executados.

### 3.2 ganache-api

- **Papel:** Definição do Contrato (Interface).
- **Responsabilidades:** Contém as estruturas de dados (`structs`) decoradas com `Serialize`/`Deserialize` e a especificação OpenAPI.
- **Output:** Gera o arquivo `openapi.json` consumido pelo frontend.

### 3.3 ganache-core

- **Papel:** Servidor e Orquestração (Runtime).
- **Responsabilidades:** Implementa o servidor HTTP Axum, gerencia autenticação, logging e roteia requisições para os serviços da `ganache-lib`.

## 4. Arquitetura de Frontend (Next.js)

O frontend é uma interface moderna focada em monitoramento em tempo real e wizards de configuração.

- **Framework:** Next.js 16 (App Router).
- **Estilização:** Tailwind CSS + Radix UI + Framer Motion para micro-animações.
- **Estado e Dados:**
  - **Server State:** TanStack React Query para cache e sincronização com a API Rust.
  - **Client State:** Zustand para estados de UI (modais, filtros).
- **Formulários:** React Hook Form + Zod para validação.

## 5. Estratégia de Integração (Fluxo de Dados)

O sistema utiliza um modelo de **Contrato Prime** baseado em OpenAPI:

1. **Alteração no Backend:** Modifica-se a `ganache-api`.
2. **Geração de Spec:** O binário Rust gera um novo `openapi.json`.
3. **Geração de SDK:** O comando `npm run generate-api` (Orval) cria hooks TypeScript tipados em `src/api/generated/`.
4. **Consumo:** Os componentes React utilizam os hooks gerados (ex: `useCreatePoolMutation`).

## 6. Modelo de Segurança

- **Isolamento:** O frontend corre sem privilégios. Todas as operações críticas são validadas pelo Daemon Rust.
- **Sanitização:** Entradas do usuário são validadas via Zod no frontend e Tipos Serde no backend antes de atingirem o shell.
- **Princípio:** O Daemon Rust atua como um "Gatekeeper" confiável para o sistema operacional.

## 7. Qualidade e Automação (CI/CD)

O projeto utiliza uma estratégia de testes em camadas para garantir a estabilidade da "Critical Path" (Ex: Setup Wizard).

### 8.1 Pipeline de CI

Localizado em `.github/workflows/test.yml`, composto por:

- **Linting:** ESLint para Next.js e Cargo Check para Rust.
- **E2E Tests:** Playwright sharded (4 shards) para performance.
- **Burn-in Loop:** Execução repetida (10x) de testes críticos para detectar flakiness.

### 8.2 Testes E2E (Playwright)

- **Localização:** `/tests/e2e`.
- **Fixtures:** Uso de `authenticatedUser` para simular estados de login.
- **Mocks:** tRPC/OpenAPI mocks em `tests/support/fixtures`.

### 8.3 Scripts de Suporte

- `./scripts/ci-local.sh`: Simula o ambiente de CI localmente.
- `./scripts/burn-in.sh [N] [TEST_FILE]`: Executa um teste N vezes para validar estabilidade.

---
*Documento consolidado em conformidade com o BMAD 6.*
