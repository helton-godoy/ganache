# Análise da Árvore de Fontes - GANACHE

## Visão Geral da Estrutura

O projeto GANACHE segue uma arquitetura de monorepo com separação clara entre frontend (TypeScript/Next.js) e backend (Rust), otimizada para desenvolvimento colaborativo e manutenção.

## Frontend (src/)

```
src/
├── api/                    # Clientes API e SDK OpenAPI gerados
│   └── generated/         # Hooks TypeScript tipados (Orval)
├── app/                   # Rotas Next.js App Router
│   ├── audit/            # Página de auditoria
│   ├── cluster/          # Página de cluster
│   ├── history/          # Página de histórico
│   ├── recovery/         # Página de recuperação
│   ├── security/         # Página de segurança
│   ├── setup/            # Páginas de configuração
│   └── test-acl/         # Página de teste ACL
├── components/           # Componentes React
│   ├── features/         # Componentes de negócio (Smart)
│   │   ├── acl/         # Editor de ACL
│   │   ├── dashboard/   # Dashboard de status
│   │   ├── history/     # Timeline de configuração
│   │   ├── panic/       # Console de recuperação
│   │   ├── security/    # Dashboard de segurança
│   │   ├── setup/       # Wizard de setup
│   │   └── storage/     # Gerenciamento de storage
│   └── ui/              # Componentes base (Dumb)
├── hooks/               # Hooks React customizados
├── lib/                 # Utilitários e bibliotecas
├── services/            # Serviços de negócio
└── types/               # Definições TypeScript
```

**Pontos Críticos:**
- `app/`: Estrutura App Router do Next.js 16
- `components/features/`: Componentes específicos do domínio
- `api/generated/`: SDK gerado automaticamente da API Rust

## Backend (core/)

```
core/
├── ganache-core/         # Daemon Principal (Axum + Tokio)
│   ├── src/
│   │   ├── main.rs      # Ponto de entrada principal
│   │   ├── websocket.rs # Handlers WebSocket
│   │   └── ...          # Outros módulos
├── ganache-api/         # Contratos OpenAPI e Tipos Serde
│   ├── src/
│   │   ├── models/      # Estruturas de dados
│   │   └── lib.rs       # Definições da API
└── ganache-lib/         # Lógica de Sistema (ZFS, DRBD, Networking)
    ├── src/
    │   ├── system/      # Módulos do sistema
    │   └── lib.rs       # Interface principal
```

**Pontos Críticos:**
- `ganache-core/`: Servidor HTTP e lógica de aplicação
- `ganache-api/`: Contratos de API (fonte da verdade)
- `ganache-lib/`: Abstrações de baixo nível do sistema

## Integração entre Partes

- **Comunicação:** Frontend consome API REST do backend via hooks gerados
- **Tipos:** Sincronizados através de OpenAPI/Swagger
- **Estado:** Gerenciado no frontend com React Query
- **Tempo Real:** WebSocket para eventos de segurança

## Padrões Arquiteturais

- **Frontend:** Componentes funcionais, hooks para estado, separação smart/dumb
- **Backend:** Clean Architecture com separação de responsabilidades
- **Integração:** Contrato-first com OpenAPI como fonte da verdade