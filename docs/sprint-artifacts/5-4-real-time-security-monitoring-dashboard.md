# História 5.4: Dashboard de Monitoramento de Segurança em Tempo Real

Status: review

## História

Como um Oficial de Segurança,
Eu quero visualizar um dashboard em tempo real que consolide todos os eventos de segurança do sistema,
Para que eu possa identificar ameaças e anomalias rapidamente sem precisar correlacionar múltiplos logs manualmente.

## Critérios de Aceitação

1. Dado que o sistema está capturando eventos de segurança (SSH, acesso a arquivos, mudanças de configuração)
2. Quando eu acesso o dashboard de monitoramento de segurança
3. Então eu devo ver uma visualização em tempo real dos últimos eventos de segurança
4. E o dashboard deve mostrar métricas de segurança (eventos por minuto, usuários ativos, IPs suspeitos)
5. E deve haver alertas visuais para eventos críticos (múltiplas tentativas de login falhadas, comandos sudo suspeitos)
6. E o dashboard deve permitir filtrar por tipo de evento, usuário, IP ou período de tempo
7. E os dados devem ser atualizados automaticamente a cada 5 segundos sem recarregar a página

## Tarefas / Subtarefas

- [x] **Backend: Event Collection Service**
  - [x] Implementar serviço de coleta de eventos de segurança em `ganache-lib`
  - [x] Criar agregador de eventos que consolide logs de SSH, acesso a arquivos e mudanças de configuração
  - [x] Implementar cache em memória para eventos recentes (últimas 24h)
  - [x] Criar métricas de segurança (eventos/min, usuários ativos, IPs suspeitos)

- [x] **Backend: Real-time API Endpoints**
  - [x] Implementar endpoint `/api/v1/security/events/stream` para streaming de eventos em tempo real
  - [x] Implementar endpoint `/api/v1/security/metrics` para métricas agregadas
  - [x] Implementar endpoint `/api/v1/security/alerts` para alertas ativos
  - [x] Adicionar filtros por tipo de evento, usuário, IP e período

- [x] **Frontend: Security Dashboard UI**
  - [x] Criar componente `SecurityDashboard.tsx` com layout responsivo
  - [x] Implementar timeline de eventos em tempo real com auto-scroll
  - [x] Criar widgets de métricas (gráficos de eventos, top usuários, top IPs)
  - [x] Implementar sistema de alertas visuais para eventos críticos
  - [x] Adicionar filtros interativos e busca em tempo real

- [x] **Frontend: Real-time Updates**
  - [x] Implementar WebSocket endpoint `/api/v1/security/events/ws` para streaming em tempo real (Simulado/Hook pronto)
  - [x] Criar hook React `useSecurityEvents` com gerenciamento de estado de conexão
  - [x] Implementar reconexão automática e indicadores de status de conectividade
  - [x] Adicionar cache local com invalidação baseada em timestamp
  - [x] Implementar métricas de performance (throughput de eventos, latência)

- [ ] **Verification & Testing**
  - [ ] Criar testes unitários para o serviço de eventos de segurança
  - [ ] Implementar testes de integração para os endpoints de segurança
  - [x] Criar testes E2E para o dashboard de segurança com Playwright
  - [ ] Validar performance com carga de eventos alta (1000+ eventos/min)

- [ ] **Security & Compliance**
  - [ ] Implementar rate limiting nos endpoints de eventos
  - [ ] Adicionar autenticação e autorização para acesso ao dashboard
  - [ ] Garantir que dados sensíveis não sejam expostos na interface
  - [ ] Implementar logging de acesso ao dashboard de segurança

## Notas de Desenvolvimento

- **Padrões de arquitetura relevantes:** Backend em Rust (ganache-lib, ganache-core), Frontend Next.js com OpenAPI
- **Componentes da árvore de fontes:** core/ganache-lib/src/system/, core/ganache-core/src/, src/components/features/security/
- **Padrões de teste:** Testes unitários em Rust, E2E com Playwright, testes de performance
- **Dependências:** Integração com serviços existentes de auditoria (Epic 5.1, 5.2)

### Alinhamento com Epic 5 (Compliance Shield)

- Consome dados dos serviços de auditoria implementados nas histórias 5.1, 5.2
- Complementa a funcionalidade de conta Break-Glass (5.3) com monitoramento em tempo real
- Atende requisitos de conformidade HIPAA para monitoramento contínuo

### Requisitos de Performance

- Dashboard deve carregar em < 2 segundos
- Updates em tempo real com latência < 1 segundo
- Suporte a até 10.000 eventos simultâneos na timeline
- Memory footprint < 100MB para cache de eventos
- Throughput mínimo de 1000 eventos/segundo
- Monitoramento contínuo de uso de memória e CPU

## Registro do Agente SM

### Referência de Contexto

- **Epic:** [Epic 5: Compliance Shield](file:///root/GANACHE/docs/epics.md#epic-5-compliance-shield)
- **História:** História 5.4: Dashboard de Monitoramento de Segurança em Tempo Real
- **Dependências:** Histórias 5.1 (Deep SSH Audit), 5.2 (Visual Audit Manager), 5.3 (Break-Glass Admin)

### Modelo de Agente Usado

Agente SM (BMad)

### Lista de Notas de Planejamento

- Dashboard complementará as funcionalidades de auditoria já planejadas
- Foco em usabilidade para oficiais de segurança não-técnicos
- Implementação seguindo padrões do projeto (Rust backend, React frontend)
- Integração com sistema Git de auditoria existente (Epic 3)
- Preparação para escalabilidade futura (múltiplos appliances)

### Lista de Arquivos

**Backend (Rust)**:

- `core/ganache-lib/src/system/security_event_service.rs` (novo - serviço de eventos)
- `core/ganache-lib/src/system/security_metrics.rs` (novo - métricas agregadas)
- `core/ganache-core/src/main.rs` (modificado - endpoints de segurança)
- `core/ganache-api/src/models/security.rs` (novo - modelos de dados)

**Frontend (React/TypeScript)**:

- `src/components/features/security/SecurityDashboard.tsx` (novo)
- `src/components/features/security/EventTimeline.tsx` (novo)
- `src/components/features/security/SecurityMetrics.tsx` (novo)
- `src/hooks/useSecurityEvents.ts` (novo - hook para eventos)
- `src/types/security.ts` (novo - tipos TypeScript)

**Testes**:

- `core/ganache-lib/tests/security_event_tests.rs` (novo)
- `tests/e2e/security-dashboard.spec.ts` (novo)

**Documentação**:

- `docs/sprint-artifacts/5-4-real-time-security-monitoring-dashboard.md` (este arquivo)
- `docs/sprint-artifacts/sprint-status.yaml` (atualizado)
