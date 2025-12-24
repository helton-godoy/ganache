# Guia de Desenvolvimento - GANACHE

## Pré-requisitos

### Sistema Operacional
- Linux (recomendado: Debian/Ubuntu)
- macOS (desenvolvimento)
- Windows (via WSL2)

### Frontend
- Node.js 18+ (recomendado: 20.x)
- npm ou yarn ou pnpm
- Git

### Backend
- Rust 1.70+ (recomendado: stable)
- Cargo
- Debian packages para desenvolvimento (build-essential, etc.)

### Infraestrutura
- Docker (para desenvolvimento local)
- ZFS tools (se desenvolvendo storage features)

## Configuração do Ambiente

### 1. Clonagem e Setup Inicial
```bash
git clone <repository-url>
cd ganache
```

### 2. Frontend Setup
```bash
# Instalar dependências
npm install

# Verificar tipos
npm run type-check

# Executar linter
npm run lint
```

### 3. Backend Setup
```bash
# Navegar para workspace Rust
cd core

# Construir projeto
cargo build

# Executar testes
cargo test

# Voltar para root
cd ..
```

### 4. Ambiente de Desenvolvimento
```bash
# Iniciar frontend (porta 3000)
npm run dev

# Em outro terminal, iniciar backend (porta 8080)
cd core && cargo run
```

## Comandos de Desenvolvimento

### Frontend (Next.js)
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Servir build local
npm run start

# Verificação de tipos
npm run type-check

# Linting
npm run lint
```

### Backend (Rust)
```bash
cd core

# Desenvolvimento com watch
cargo watch -x run

# Build otimizado
cargo build --release

# Testes
cargo test

# Documentação
cargo doc --open
```

### Testes
```bash
# Testes E2E completos
npm run test:e2e

# Testes E2E prioritários (P0)
npm run test:e2e:p0

# Testes API
npm run test:api

# Testes específicos
npm run test:break-glass

# Modo interativo
npm run test:ui
```

## Estrutura de Desenvolvimento

### Branches
- `main`: Código de produção
- `develop`: Desenvolvimento ativo
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes

### Commits
Seguir Conventional Commits:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `refactor:` - Refatoração
- `test:` - Testes

### Pull Requests
- Descrição clara da mudança
- Referência à história/epic
- Testes incluídos
- Revisão obrigatória

## Debugging

### Frontend
- React DevTools para componentes
- Next.js dev server com hot reload
- Console do browser para logs

### Backend
- `cargo build` com `--verbose` para detalhes
- Logs em `/var/log/ganache/` em produção
- `RUST_BACKTRACE=1` para stack traces

## Deploy e Release

### Desenvolvimento Local
- Frontend: `npm run dev`
- Backend: `cargo run`
- Database: Docker containers

### Produção
- Build automatizado via CI/CD
- Docker images para frontend e backend
- Deploy no Kubernetes cluster

## Troubleshooting

### Problemas Comuns

**Erro de build Rust:**
```bash
# Limpar cache
cargo clean
cargo build
```

**Dependências Node.js:**
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install
```

**Portas ocupadas:**
- Frontend: 3000
- Backend: 8080
- Verificar processos: `lsof -i :3000`

### Suporte
- Documentação: `docs/index.md`
- Issues no GitHub
- Equipe via Slack/Microsoft Teams