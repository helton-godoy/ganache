# ⚡ Atalhos Rápidos - Ganache

## 🎮 Navegação no Sistema

### Menu Principal

- **📋 [MENU Principal](MENU.md)** - Navegação geral
- **📖 [Menu Completo](menu-navegacao.md)** - Documentação detalhada

### História Atual (5.4)

- **📊 [Dashboard de Segurança](docs/sprint-artifacts/5-4-real-time-security-monitoring-dashboard.md)** - História ativa

## 🔗 Links Diretos Essenciais

### 📚 Documentação Principal

```
📖 README.md                          - Introdução
📋 project-context.md                 - Regras e contexto
🏗️ docs/architecture.md              - Arquitetura
📊 docs/analysis/prd.md               - Requisitos
```

### 🎯 Sprint Atual

```
🔄 docs/sprint-artifacts/sprint-status.yaml      - Status dos sprints
✅ docs/sprint-artifacts/validation-report-5-4-real-time-security-monitoring-dashboard.md - Validação
```

### 🛠️ Desenvolvimento

```
🛠️ docs/development/development-guide.md         - Guia do dev
📚 docs/development/documentation-methodology.md - Metodologia
🚀 docs/development/setup-instructions.md        - Setup
```

### 🎨 Design

```
📐 docs/ux-design-specification.md              - Especificações UX
📱 docs/wireframes/index.html                   - Wireframes
```

## 🔍 Busca por Tema

### Security & Compliance (Epic 5)

```
docs/sprint-artifacts/5-*-*                    - Todas as histórias Epic 5
core/ganache-lib/src/system/security_*         - Serviços de segurança
src/components/features/security/              - Componentes frontend
```

### Storage & Clustering (Epic 2)

```
docs/sprint-artifacts/2-*-*                    - Histórias de cluster
core/ganache-lib/src/system/zfs.rs             - Serviços ZFS
core/ganache-lib/src/system/cluster.rs         - Cluster management
```

### Git Configuration (Epic 3)

```
docs/sprint-artifacts/3-*-*                    - Histórias de config
core/ganache-lib/src/git.rs                    - Serviços Git
src/hooks/                                     - Hooks Git
```

### Active Directory (Epic 4)

```
docs/sprint-artifacts/4-*-*                    - Histórias AD
core/ganache-lib/src/system/ad_service.rs      - Serviços AD
core/ganache-lib/src/system/acl_service.rs     - Serviços ACL
```

## 🎮 Comandos de Desenvolvimento

### Build & Deploy

```bash
make build          # Compilar projeto
make test           # Executar testes
make dev            # Modo desenvolvimento
make lint           # Verificar código
```

### Git Workflow

```bash
git status          # Status do repositório
git log --oneline   # Histórico de commits
git branch          # Listar branches
git checkout -b feature/nova-funcionalidade  # Nova branch
```

### Rust Specific

```bash
cargo build         # Build Rust
cargo test          # Testes Rust
cargo clippy        # Lint Rust
cargo fmt           # Format Rust
```

### Node/Next.js

```bash
npm run dev         # Dev server
npm run build       # Build production
npm run test        # Testes
npm run lint        # Lint
```

## 🔧 Arquivos de Configuração

### Configuração Principal

```
.env.example        - Variáveis de ambiente
package.json        - Dependências Node
next.config.ts      - Configuração Next.js
tailwind.config.ts  - Configuração Tailwind
```

### Rust Configuration

```
core/Cargo.toml     - Dependências Rust
core/ganache-core/Cargo.toml  - Core dependencies
core/ganache-lib/Cargo.toml   - Library dependencies
```

### Linting & Formatting

```
.eslint.config.mjs  - ESLint configuration
postcss.config.mjs  - PostCSS configuration
tsconfig.json       - TypeScript configuration
```

## 📊 Status e Monitoring

### Sprint Status

- **Epic 5** (Compliance Shield): 60% completo
- **História 5.4** (Dashboard): in-progress
- **Backend**: 70% completo
- **Frontend**: 90% completo

### Performance Targets

- Dashboard load: < 2s
- Real-time updates: < 1s latency
- Event throughput: 1000 events/sec
- Memory footprint: < 100MB

## 🆘 Troubleshooting

### Problemas Comuns

1. **Build fails**: Verificar `cargo build` e `npm install`
2. **Tests fail**: Executar `make test` para diagnóstico
3. **Git issues**: Usar `git status` e `git log`

### Logs

```
server.log          - Log do servidor
core/ganache.log    - Log do core Rust
```

### Debug

- VS Code: F5 para debug
- Rust: `cargo run` para executar
- Next.js: `npm run dev` para desenvolvimento

---

## 🎯 Workflow do Tech Writer

### Criação de Documentação

1. **Plano**: Usar estrutura em `docs/sprint-artifacts/`
2. **Validação**: Seguir checklist em `docs/validation/`
3. **Review**: Seguir processo em `docs/governance/`

### Comandos Úteis

```bash
# Verificar conformidade BMAD
./scripts/bmad-validate.sh

# Sincronizar documentação
./scripts/bmad-sync.sh

# Verificar commits
./scripts/commit-with-verification.sh
```

---

*Atalhos atualizados: 2025-12-21T15:09:22.070Z*
