# ATDD Checklist: Epic 5 - Compliance Shield

**Date:** 2025-12-23
**Author:** Murat (Master Test Architect)
**Status:** RED Phase (Tests Failing)

---

## Story 5.1: Deep SSH Audit Logging

**Primary Test Level:** E2E / API Integration

### Acceptance Criteria Breakdown

1. [ ] Capturar comandos, argumentos, timestamp e UID real em sessões SSH.
2. [ ] Capturar comandos dentro de scripts e sub-shells.
3. [ ] Armazenar logs de forma imutável e à prova de adulteração.

### Failing Tests Created

- [ ] `tests/e2e/ssh-audit.spec.ts`: Valida a detecção de comandos aninhados e sudo via API de eventos.
- [ ] `core/ganache-lib/src/system/security_event_service.rs` (Unit/Integration): Valida o parser de logs hex-TTY.

---

## Story 5.4: Real-time Security Monitoring Dashboard

**Primary Test Level:** E2E (Playwright)

### Acceptance Criteria Breakdown

1. [ ] Visualização em tempo real de eventos (SSH, FS, Config).
2. [ ] Métricas atualizadas (eventos/min, usuários ativos).
3. [ ] Alertas visuais para eventos críticos.
4. [ ] Atualização automática via WebSocket (< 5s).

### Failing Tests Created

- [ ] `tests/e2e/security-dashboard-atdd.spec.ts`: Valida streaming RT e triggers de alertas visuais.

---

## Implementation Checklist for DEV Team

### [Story 5.1] Deep SSH Audit

- [ ] Garantir que `pam_tty_audit` está capturando o input em buffer hex.
- [ ] Implementar decodificação robusta para comandos multiline e sub-shells.
- [ ] Vincular eventos ao `parent_session_id` para rastreabilidade.

### [Story 5.4] Security Dashboard

- [ ] Integrar WebSocket real com o `SecurityEventStream` no Rust core.
- [ ] Otimizar o render do React para lidar com 100+ eventos/segundo sem lag.
- [ ] Adicionar `data-testid` para novos widgets: `event-timeline`, `critical-alert-toast`.

---

## Red-Green-Refactor Workflow

1. **RED:** Execute `npm run test:e2e tests/e2e/ssh-audit.spec.ts`.
2. **GREEN:** Implemente o parser no backend e o listener de logs.
3. **REFACTOR:** Limpe o buffer de logs e otimize a query de eventos.

**Execution Command:**

```bash
npx playwright test tests/e2e/ssh-audit.spec.ts tests/e2e/security-dashboard-atdd.spec.ts
```
