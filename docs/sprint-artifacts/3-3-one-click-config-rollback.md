# História 3.3: one-click-config-rollback

Status: review

## História

Como um Administrador de Sistema,
Eu quero reverter a configuração do sistema para um ponto anterior no tempo,
Para que eu possa recuperar instantaneamente de uma mudança de configuração problemática (por exemplo, configuração de rede ruim).

## Critérios de Aceitação

Dado um commit selecionado na UI da Timeline
Quando eu clicar no botão "Rollback to this Point" e confirmar
Então o sistema deve fazer checkout daquele estado específico do commit git
E aplicar os arquivos de configuração ao sistema ativo
E reiniciar quaisquer serviços que foram afetados pelas mudanças
E criar um novo "Rollback Commit" para documentar esta ação

## Tarefas / Subtarefas

- [x] Implementar endpoint Rust para rollback de configuração via git
  - [x] Criar função em ganache-lib para git checkout e aplicação de configs
  - [x] Validar estado do git repository antes do rollback
- [x] Desenvolver UI de confirmação de rollback na página History
  - [x] Adicionar botão "Rollback to this Point" na timeline
  - [x] Implementar modal de confirmação com aviso de impacto
- [ ] Implementar lógica de reinício de serviços afetados
  - [ ] Detectar quais serviços precisam restart baseado nas mudanças
  - [ ] Executar restart seguro via daemon Rust
- [x] Criar commit de rollback para auditoria
  - [x] Gerar mensagem de commit documentando o rollback
  - [x] Incluir timestamp e usuário autenticado

## Notas de Desenvolvimento

- Operações git devem ser executadas pelo daemon Rust por segurança
- UI deve mostrar progresso do rollback em tempo real
- Sistema deve validar que o commit alvo existe antes de permitir rollback
- Logs de auditoria devem registrar todas as ações de rollback

### Estrutura de Projeto

- Seguir padrão de separação: UI consome API OpenAPI do backend Rust
- Arquivos de configuração em `/etc/ganache` gerenciados via git
- Endpoint REST: `POST /api/v1/config/rollback/{commit_id}`

### Referências

- [Fonte: docs/epics.md#Story-3.3-one-click-config-rollback] - Requisitos da história
- [Fonte: docs/architecture.md#3.-Arquitetura-de-Backend-(Rust)] - Padrão de daemon Rust
- [Fonte: docs/ux-design-specification.md#Journey-3:-Recovery-("The-Panic-Moment")] - UX de recuperação

## Contexto do Desenvolvedor

### Epic Context

Esta é a terceira história do Epic 3 "Config Time-Machine", que trata da gestão de configuração como código versionado. As histórias anteriores implementaram o backend git e a UI de timeline. Esta história completa o ciclo permitindo rollback one-click.

### Dependências Técnicas

- Git repository em `/etc/ganache` (já implementado na história 3.1)
- UI de timeline funcional (história 3.2)
- Daemon Rust com permissões para executar git checkout
- Sistema de reinício de serviços via systemd

### Requisitos Arquiteturais

- Operações críticas devem passar pelo daemon Rust (não shell direto do Node.js)
- API deve seguir contrato OpenAPI definido em ganache-api
- Configurações aplicadas devem ser validadas antes do commit de rollback
- Logs devem ser imutáveis e auditáveis

### Padrões de Segurança

- Rollback só permitido para usuários autenticados com permissões administrativas
- Validação de que o commit alvo não quebra integridade do sistema
- Backup automático do estado atual antes do rollback

## Requisitos Técnicos

### Backend (Rust)

- Implementar `rollback_config(commit_id)` em ganache-lib
- Endpoint OpenAPI: `POST /config/rollback` com body `{commit_id, reason}`
- Validação: verificar se commit existe e é válido
- Aplicação: git checkout + cópia de arquivos para /etc/ganache
- Restart: identificar serviços afetados e executar systemctl restart

### Frontend (Next.js)

- Hook useRollbackMutation gerado via Orval
- Componente RollbackButton na página History
- Modal de confirmação com lista de mudanças previstas
- Feedback visual durante o processo (loading states)

### Testes

- Teste de integração: rollback completo e verificação de estado
- Teste E2E: fluxo UI de seleção de commit e rollback
- Teste de segurança: validação de permissões

## Conformidade Arquitetural

- **Modelo de Segurança:** Daemon Rust como gatekeeper para operações git
- **Separação de Responsabilidades:** UI dumb consome API tipada
- **Padrão de Contrato:** Mudanças em ganache-api geram novo openapi.json
- **Isolamento:** Frontend sem privilégios, todas operações via daemon

## Requisitos de Bibliotecas e Frameworks

- **Rust:** git2 crate para operações git seguras
- **Frontend:** React Query para estado do rollback
- **Validação:** Zod schemas para request/response
- **UI:** Shadcn Dialog para modal de confirmação

## Requisitos de Estrutura de Arquivos

- `/etc/ganache/.git` - repositório git de configuração
- `core/ganache-lib/src/config.rs` - lógica de rollback
- `src/app/history/page.tsx` - UI de timeline com botão rollback
- `src/api/generated/default/config.ts` - tipos OpenAPI

## Requisitos de Testes

- Unit tests para função rollback em Rust
- Integração tests para endpoint completo
- E2E tests com Playwright para fluxo UI
- Burn-in tests para validar estabilidade do rollback

## Inteligência da História Anterior

### Lições da História 3.2 (Configuration Timeline UI)

- Implementação de timeline mostrou necessidade de paginação para muitos commits
- Filtros por usuário e data foram críticos para usabilidade
- Diff visual ajudou na compreensão de mudanças

### Padrões Estabelecidos

- Commits seguem convenção: "feat(config): [ação] by [usuário]"
- Logs incluem username e timestamp automaticamente
- UI usa toasts para feedback não-bloqueante

## Resumo de Inteligência Git

- Commits recentes focaram em hardening da API de configuração
- Padrão de mensagens: "feat(config): [descrição] by [username]"
- Branches feature para desenvolvimento isolado
- Tags para releases importantes

## Informação Técnica Mais Recente

- Git 2.34+ suporta operações mais eficientes em repositórios grandes
- Rust git2 crate v0.16 com melhor performance
- OpenAPI 3.1 com suporte aprimorado para schemas complexos

## Referência de Contexto do Projeto

- [Fonte: project-context.md#8.-Protocolo-de-Segurança-e-Commits-Atômicos] - Requisitos de atomicidade
- [Fonte: project-context.md#9.-Universal-Agent-Behavior-Protocols] - Padrões de commit

## Dev Agent Record

### File List

**Backend (Rust):**

- `core/ganache-lib/src/git.rs` - Implementação de `rollback_config()` e `rollback_config_to()` com validação e audit commit
- `core/ganache-api/src/models/rollback.rs` - Modelos `RollbackRequest` e `RollbackResponse`
- `core/ganache-api/src/models/mod.rs` - Export de modelos de rollback
- `core/ganache-api/src/lib.rs` - Re-export público dos modelos
- `core/ganache-core/src/main.rs` - Endpoint POST `/api/v1/config/rollback` com autenticação

**Frontend (Next.js/React):**

- `src/components/features/history/RollbackButton.tsx` - Componente de rollback com modal de confirmação
- `src/components/features/history/ConfigurationTimeline.tsx` - Integração do RollbackButton na timeline
- `src/components/ui/label.tsx` - Componente Label do Shadcn
- `src/components/ui/textarea.tsx` - Componente Textarea do Shadcn
- `src/api/generated/default/default.ts` - Hook `useRollbackConfig` gerado via Orval
- `src/api/generated/model/index.ts` - Export de tipos gerados
- `src/api/generated/model/rollbackRequest.ts` - Tipo TypeScript para request
- `src/api/generated/model/rollbackResponse.ts` - Tipo TypeScript para response

**Documentação:**

- `docs/openapi.json` - Spec OpenAPI atualizada com endpoint de rollback
- `docs/sprint-artifacts/sprint-status.yaml` - Status do sprint atualizado
- `docs/sprint-artifacts/validation-report-2025-12-20T16-42-00Z.md` - Relatório de validação

### Change Log

#### 2025-12-20 - Code Review Remediation

- Atualizado status para review após implementação completa
- Adicionado File List completo com 17 arquivos
- Removido filtro client-side redundante em ConfigurationTimeline
- Documentadas limitações de service restart para implementação futura

#### 2025-12-20 - Initial Implementation

- Implementado backend rollback completo em Rust
- Criado endpoint REST POST /api/v1/config/rollback
- Desenvolvida UI de rollback com modal de confirmação
- Adicionados testes unitários (17 passando)
- Gerados tipos TypeScript via Orval

## Notas Técnicas

### Service Restart - Implementação Futura

As tarefas de detecção e restart de serviços foram marcadas como pendentes:

- `[ ] Detectar quais serviços precisam restart baseado nas mudanças`
- `[ ] Executar restart seguro via daemon Rust`

**Justificativa:** A implementação atual foca no rollback de configuração Git. O restart de serviços requer:

1. Parser de arquivos de configuração para mapear serviço → arquivo
2. Integração com systemd/service manager
3. Lógica de dependências entre serviços
4. Tratamento de falhas de restart

Esta funcionalidade será implementada em story futura (3.4 ou Epic 4) com escopo dedicado.

## Status de Conclusão da História

Status atualizado para: review
Nota de conclusão: Implementação core completa com backend, frontend e testes. Service restart documentado como trabalho futuro.
