# Menu de Navegação - Projeto Ganache

## 📋 Menu Principal

### 🏠 [Visão Geral do Projeto](README.md)
- Introdução e objetivos do projeto
- Arquitetura geral do sistema
- Guia de instalação rápida

### 📚 Documentação Principal

#### 📖 Documentação Técnica
- [📐 Arquitetura](docs/architecture.md) - Arquitetura do sistema e componentes
- [📋 Especificação Técnica](docs/ux-design-specification.md) - Especificações de UX e design
- [🔧 Guia de Desenvolvimento](docs/development/development-guide.md) - Diretrizes para desenvolvedores

#### 📊 Requisitos e Planejamento
- [📈 PRD - Product Requirements](docs/analysis/prd.md) - Requisitos detalhados do produto
- [🎯 Epics](docs/epics.md) - Visão geral de todas as epics
- [📝 Status dos Sprints](docs/sprint-artifacts/sprint-status.yaml) - Status atual dos sprints

### 🚀 Epics e Histórias de Usuário

#### Epic 1: Sistema de Armazenamento [🔧 Setup & Configuração]
- [🖥️ História 1.1: Detecção de Hardware RAID](docs/sprint-artifacts/1-1-detect-raid-hardware-recommend-mode.md)
- [🧙‍♂️ História 1.2: Wizard de Configuração de Modo de Compatibilidade](docs/sprint-artifacts/1-2-compatibility-mode-setup-wizard.md)
- [⚡ História 1.3: Auto-tuning de Recursos do Sistema](docs/sprint-artifacts/1-3-system-resource-auto-tuning.md)
- [🔄 História 1.4: Rollback de Ambiente de Boot](docs/sprint-artifacts/1-4-boot-environment-rollback.md)

#### Epic 2: Cluster de Armazenamento [🔗 Failover & HA]
- [🌐 História 2.1: Inicialização de Cluster Twin-Node](docs/sprint-artifacts/2-1-twin-node-cluster-initialization.md)
- [💾 História 2.2: Criação de Pool ZFS em DRBD](docs/sprint-artifacts/2-2-zfs-pool-creation-on-drbd.md)
- [🚫 História 2.3: Aplicação de Hard Quota 90%](docs/sprint-artifacts/2-3-90-hard-quota-enforcement.md)
- [📁 História 2.4: Gerenciamento de Datasets](docs/sprint-artifacts/2-4-dataset-management.md)
- [⚠️ História 2.5: Lógica de Pânico/Failover Automatizado](docs/sprint-artifacts/2-5-automated-failover-panic-logic.md)

#### Epic 3: Controle de Configuração [🔧 Git & Versionamento]
- [🗂️ História 3.1: Engine de Configuração Git-Backed](docs/sprint-artifacts/3-1-git-backed-configuration-engine.md)
- [📈 História 3.2: UI de Timeline de Configuração](docs/sprint-artifacts/3-2-configuration-timeline-ui.md)
- [⏪ História 3.3: Rollback de Configuração com Um Clique](docs/sprint-artifacts/3-3-one-click-config-rollback.md)

#### Epic 4: Integração AD/ACL [👥 Directory & Permissions]
- [🔗 História 4.1: Middleware de Junção AD](docs/sprint-artifacts/4-1-active-directory-domain-join-rust-middleware.md)
- [🗺️ História 4.2: Implementação Core do ACL Mapper](docs/sprint-artifacts/4-2-acl-mapper-rust-core-implementation.md)
- [📂 História 4.3: Gerenciamento ACL para Shares](docs/sprint-artifacts/4-3-acl-management-for-shares.md)

#### Epic 5: Compliance Shield [🛡️ Security & Monitoring]
- [🔍 História 5.1: Deep SSH Audit](docs/sprint-artifacts/5-1-deep-ssh-audit.md)
- [👁️ História 5.2: Visual Audit Manager](docs/sprint-artifacts/5-2-visual-audit-manager.md)
- [🚨 História 5.3: Break-Glass Admin](docs/sprint-artifacts/5-3-break-glass-admin.md)
- [📊 **História 5.4: Dashboard de Monitoramento de Segurança em Tempo Real**](docs/sprint-artifacts/5-4-real-time-security-monitoring-dashboard.md) *(Ativo)*

### 🔍 Visualização e Prototipagem

#### 📱 Wireframes
- [🏠 Wireframe: Fluxo de Setup](docs/wireframes/01-setup-flow.html)
- [📊 Wireframe: Dashboard de Monitoramento](docs/wireframes/02-dashboard-monitoring.html)
- [📱 Wireframe: Recuperação Mobile](docs/wireframes/03-mobile-recovery.html)
- [📋 Índice de Wireframes](docs/wireframes/index.html)

#### 🎨 Direções de Design
- [🎯 Direções de UX Design](docs/ux-design-directions.html)

### 🧪 Validação e Conformidade

#### ✅ Relatórios de Validação
- [📋 Relatório de Conformidade BMAD](docs/validation/bmad-compliance-report.md)
- [✅ Checklist de Validação BMAD](docs/validation/bmad-validation-checklist.md)
- [📊 Mapeamento de Requisitos BMAD](docs/validation/bmad-requirements-mapping.md)
- [🎯 KPIs Definidos](docs/validation/kpis-definidos.md)

#### 📈 Relatórios de Sprints
- [📅 Validação Sprint 3.2](docs/sprint-artifacts/validation-report-3-2-configuration-timeline-ui.md)
- [🛡️ Validação Sprint 4.3](docs/sprint-artifacts/validation-report-4-3-acl-management-for-shares.md)
- [📊 Validação Sprint 5.4](docs/sprint-artifacts/validation-report-5-4-real-time-security-monitoring-dashboard.md)
- [📋 Relatório Geral 2025-12-20](docs/sprint-artifacts/validation-report-2025-12-20.md)

#### 🔄 Retrospectivas
- [📈 Retrospectiva Epic 1](docs/sprint-artifacts/epic-1-retro-2025-12-20.md)
- [🔧 Retrospectiva Epic 2](docs/sprint-artifacts/epic-2-retro-2025-12-20.md)
- [⚙️ Retrospectiva Epic 3](docs/sprint-artifacts/epic-3-retro-2025-12-20.md)
- [🛡️ Retrospectiva Epic 4](docs/sprint-artifacts/epic-4-retrospective-2025-12-21.md)

### 🔧 Desenvolvimento

#### 📋 Guias de Desenvolvimento
- [🛠️ Guia de Desenvolvimento](docs/development/development-guide.md)
- [📚 Metodologia de Documentação](docs/development/documentation-methodology.md)
- [🚀 Guia de Setup](docs/development/setup-instructions.md)
- [✅ Status da Implementação](docs/development/implementation-status.md)
- [🔄 Guia de Workflow Greenfield](docs/development/workflow-greenfield-guide.md)

#### 📊 Relatórios de Desenvolvimento
- [📈 Relatório de Sync](docs/development/sync-report.md)
- [🎯 Avaliação de Desenvolvimento](docs/development/development-evaluation.md)

### 🛡️ Governança e Conformidade

#### 📋 Políticas de Governança
- [📋 Guia de Validação de Workflow](docs/governance/workflow-validation-guide.md)
- [🔍 Validação de Walkthrough](docs/validation/walkthrough-2-4-review-fixes.md)

### 📁 Estrutura do Código

#### 🦀 Backend (Rust)
- [`core/ganache-lib/`](core/ganache-lib/) - Biblioteca principal
- [`core/ganache-api/`](core/ganache-api/) - API REST
- [`core/ganache-core/`](core/ganache-core/) - Serviços principais

#### ⚛️ Frontend (Next.js/TypeScript)
- [`src/api/`](src/api/) - APIs geradas e modelos
- [`src/components/`](src/components/) - Componentes React
- [`src/hooks/`](src/hooks/) - Hooks customizados

### 🔍 Pesquisa e Busca
- Use a funcionalidade de busca do VS Code (Ctrl+Shift+F) para encontrar conteúdo específico
- Consulte o [`project-context.md`](project-context.md) para contexto geral do projeto

### 📞 Suporte e Contato
- Consulte o [`CONTRIBUTING.md`](CONTRIBUTING.md) para diretrizes de contribuição
- Verifique o [`AGENTS.md`](AGENTS.md) para informações sobre agentes

---

## 🎯 Navegação Rápida - História Atual (5.4)

### Dashboard de Monitoramento de Segurança
**Status:** in-progress

#### 📋 Resumo
Dashboard em tempo real para consolidação de eventos de segurança do sistema, permitindo identificação rápida de ameaças e anomalias.

#### 🔗 Links Relacionados
- [Epic 5 - Compliance Shield](docs/epics.md#epic-5-compliance-shield)
- [Status dos Sprints](docs/sprint-artifacts/sprint-status.yaml)
- [Validação Sprint 5.4](docs/sprint-artifacts/validation-report-5-4-real-time-security-monitoring-dashboard.md)

#### 📊 Progresso Atual
- ✅ Backend: Event Collection Service (Concluído)
- ⏳ Backend: Real-time API Endpoints (Em andamento)
- ✅ Frontend: Security Dashboard UI (Concluído)
- ✅ Frontend: Real-time Updates (Concluído)
- ⏳ Verification & Testing (Pendente)
- ⏳ Security & Compliance (Pendente)

#### 📂 Arquivos Principais
- **Backend:** `core/ganache-lib/src/system/security_event_service.rs`
- **Frontend:** `src/components/features/security/SecurityDashboard.tsx`
- **Testes:** `tests/e2e/security-dashboard.spec.ts`

---

*Última atualização: 2025-12-21T15:08:33.239Z*