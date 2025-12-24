# Matriz de Rastreabilidade de Requisitos - Story 6-4

**Story**: [6.4 - Automated SSR Regression Tests](docs/sprint-artifacts/6-4-automated-ssr-regression-tests.md)  
**Data**: 2025-12-24

## 1. Mapeamento Acceptance Criteria (AC) → Test Scenarios

| ID AC | Descrição AC | Cenário de Teste | Arquivo de Teste | Cobertura | Status |
|---|---|---|---|---|---|
| AC 1.1 | Detectar falhas de SSR | Verificar renderização do Layout Principal | `tests/ssr/components/layout.test.tsx` | Unit | ✅ PASS |
| AC 1.1 | Detectar falhas de SSR | Verificar renderização da Home Page | `tests/ssr/components/dashboard.test.tsx` | Unit | ✅ PASS |
| AC 1.1 | Detectar falhas de SSR | Verificar renderização do Setup Wizard | `tests/ssr/components/setup-wizard.test.tsx` | Unit | ✅ PASS |
| AC 1.1 | Detectar falhas de SSR | Verificar Detecção de Falhas (E2E) | `tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts` | E2E | ✅ PASS (Phase 2) |
| AC 1.2 | Mensagens de erro claras | Validar mensagens de erro em falha | `tests/ssr/atdd/ssr-error-messages.atdd.spec.ts` | E2E | ✅ PASS (Phase 2) |
| AC 1.3 | Impedir deploy quebrado | Bloqueio no CI (Fase 6) | `.github/workflows/ssr-tests.yml` | CI | ⏳ PENDING |

## 2. Mapeamento Story Tasks → Implementação

| ID Task | Descrição Task | Implementação / Artefato | Status |
|---|---|---|---|
| Task 1 | Estratégia e Ferramentas | Vitest + React Testing Library (subst. Jest) | ✅ DONE |
| Task 2 | Configurar Ambiente SSR | `vitest.config.ts`, `tests/setup.ts` | ✅ DONE |
| Task 3 | Testes Componentes Críticos | `tests/ssr/components/*.test.tsx` | ✅ DONE |
| Task 4 | Testes de Integração SSR | `tests/ssr/integration/*.test.tsx` | ✅ DONE |
| Task 4 | Testes de Performance SSR | `tests/ssr/performance/ssr-performance.test.tsx` | ✅ DONE |
| Task 5 | Integração CI/CD | `.github/workflows/ssr-tests.yml` | ⏳ PENDING (Fase 6) |
| Task 6 | Documentação | `docs/testing/ssr-testing-guide.md` | ⏳ PENDING (Fase 7) |

## 3. Cobertura de Componentes Críticos

| Componente | Caminho | Teste Unitário | Teste Integração | Cobertura Est. |
|---|---|---|---|---|
| Root Layout | `src/app/layout.tsx` | ✅ Sim | ✅ Sim (Page Rendering) | High |
| Home Dashboard | `src/app/page.tsx` | ✅ Sim | ✅ Sim | High |
| Setup Wizard | `src/components/features/setup/` | ✅ Sim | ✅ Sim | Medium |
| Security Dash | `src/components/features/security/` | ✅ Sim | - | Medium |

## 4. Gaps Identificados

1. **Performance Real**: Testes atuais usam simulação (`performance.now`) em ambiente JSDOM. Testes de carga real (k6 ou similar) seriam ideais para validação de produção.
2. **Hydration**: Validação de hidratação em JSDOM é limitada (verifica apenas execução sem erro). Testes E2E (Playwright) cobrem melhor a hidratação visual.

## 5. Conclusão

A cobertura atual atende aos critérios de aceitação para validação funcional e de regressão lógica. A integração com CI garantirá a prevenção de deploys quebrados.
