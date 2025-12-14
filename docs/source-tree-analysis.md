# Source Tree Analysis - Ganache

**Raiz do Projeto:** `/home/helton/git/GANACHE`

## 🌳 Estrutura de Diretórios

```
GANACHE/
├── Makefile                 # Automação de tarefas (Build, Install, Clean)
├── scripts/                 # Scripts auxiliares de setup
│   └── setup_ganache_enhanced.sh # Script de configuração do ambiente
├── docs/                    # Documentação do projeto (BMAD)
└── ganache/                 # Código Fonte Principal (Monorepo-style)
    ├── Cargo.toml           # Manifesto Workspace Rust
    ├── api-spec.yaml        # Especificação OpenAPI (Backend <-> Frontend Contract)
    │
    ├── src/                 # Backend Rust Source
    │   └── ganache-api/     # API Service
    │       ├── src/
    │       │   ├── main.rs      # Entry Point da Aplicação
    │       │   ├── routes.rs    # Definição de Rotas (SMB, ZFS, System)
    │       │   └── handlers.rs  # Lógica dos Endpoints
    │
    └── ui/                  # Frontend React Source
        ├── package.json     # Manifesto Node.js
        ├── vite.config.ts   # Configuração de Build
        ├── index.html       # Entry Point HTML
        └── src/
            ├── main.tsx     # Application Entry Point (React DOM)
            ├── App.tsx      # Root Component
            ├── api/         # Camada de Cliente API (Generated)
            ├── components/  # Componentes de UI (Dashboard, Managers)
            ├── stores/      # Gerenciamento de Estado (Zustand)
            └── theme.ts     # Configuração Material UI (inferred)
```

## 📍 Pontos Críticos

### Backend (`ganache/src/ganache-api`)

- **Core Logic:** O serviço principal roda em Rust usando Actix-Web.
- **Entry Point:** `main.rs` inicializa o servidor HTTP e configura rotas.
- **API Contract:** O arquivo `api-spec.yaml` na raiz de `ganache/` define o contrato que o backend implementa e o frontend consome.

### Frontend (`ganache/ui`)

- **Single Page Application:** Construído com Vite + React.
- **State Management:** Zustand gerencia estados complexos (`stores/`).
- **API Integration:** O código em `api/` é fortemente tipado com base no `schema.d.ts` (gerado do OpenAPI), garantindo segurança de tipos entre Back e Front.

### Automação

- **Makefile:** Orquestra o build de ambos (backend e frontend) e tarefas de instalação.
- **Scripts:** `setup_ganache_enhanced.sh` prepara o ambiente de desenvolvimento/produção.
