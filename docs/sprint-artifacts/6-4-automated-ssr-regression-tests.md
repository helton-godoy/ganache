# Story 6.4: Testes de Regressão SSR Automatizados

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

Como um Desenvolvedor Frontend,
Eu quero testes automatizados para evitar regressões de SSR,
Para que problemas de renderização no lado do servidor do Next.js sejam detectados precocemente.

## Acceptance Criteria

1. **Dado** uma alteração no frontend que afeta o SSR
    **Quando** os testes automatizados são executados
    **Então** eles devem detectar falhas de SSR
    **E** fornecer mensagens de erro claras sobre o que quebrou
    **E** impedir a implantação de funcionalidades de SSR quebradas

## Tasks / Subtasks

### 1. Validação de Estratégia e Ferramentas SSR

- [x] Validar configuração do stack de testes
  - [x] Confirmar integração Vitest + React Testing Library (substituindo Jest)
  - [x] Validar configuração do Playwright para testes de SSR
  - [x] Garantir suporte a diretivas de componentes Next.js 16 ('use client' vs Server Components)
- [x] Refinar estratégia de testes SSR
  - [x] Definir componentes críticos: Dashboard, Setup, Segurança
  - [x] Estabelecer fronteira: Playwright para RSC (renderização real) vs Vitest para lógica
  - [x] Estabelecer métricas de sucesso e cobertura mínima

### 2. Configuração de Ambiente de Testes SSR

- [x] Refinar ambiente de teste SSR
  - [x] Validar suporte do Vitest para Next.js 16 App Router mocks
  - [x] Otimizar mocks de dependências externas (APIs, banco de dados) em `src/lib/api-server.ts`
  - [x] Validar propagação de variáveis de ambiente (MOCK_SSR_DATA)
- [x] Consolidar setup de testes
  - [x] Unificar configurações onde possível (`vitest.config.ts`)
  - [x] Documentar padrões para testes de hidratação cliente vs renderização servidor

### 3. Testes de Componentes Críticos SSR

### 3. Testes de Componentes Críticos (RSC & Client)

- [x] Aprimorar testes de componentes SSR (Server Components)
  - [x] Usar Playwright para validar renderização assíncrona de páginas (Dashboard, Security)
  - [x] Testar Context Providers em ambiente Vitest isolado
  - [x] **NOVO:** Validar "Client Boundary Integrity" (uso correto de 'use client')
- [x] Expandir regressão para funcionalidades críticas
  - [x] Setup Wizard: Validar fluxo completo com dados iniciais via SSR
  - [x] Status Dashboard: Verificar hidratação de dados iniciais (Initial Props)
  - [x] Security: Garantir que dados sensíveis não vazam no HTML inicial (Leak Test)

### 4. Testes de Integração SSR

- [x] Criar testes de integração SSR
  - [x] Testar fluxo completo de páginas com SSR
  - [x] Testar interação entre componentes SSR e client-side
  - [x] Testar carregamento de recursos estáticos
- [x] Criar testes de performance SSR
  - [x] Medir tempo de renderização no servidor
  - [x] Verificar tamanho do HTML gerado
  - [x] Testar impacto de dependências no tempo de SSR

### 5. Integração com CI/CD Pipeline

- [x] Integrar testes SSR ao pipeline de CI/CD
  - [x] Configurar execução de testes SSR no GitHub Actions
  - [x] Configurar testes SSR para rodar em pull requests
  - [x] Configurar bloqueio de deploy em caso de falhas nos testes SSR
- [x] Configurar notificações e relatórios
  - [x] Configurar relatórios de cobertura de testes SSR
  - [x] Configurar alertas para falhas de regressão SSR
  - [x] Integrar com sistemas de monitoramento

### 6. Documentação e Manutenção

- [x] Documentar processo de testes SSR
  - [x] Criar guia de desenvolvimento com práticas de SSR testing
  - [x] Documentar como escrever testes SSR para novos componentes
  - [x] Criar checklist de validação SSR para PRs
- [x] Configurar manutenção de testes
  - [x] Estabelecer rotina de atualização de testes mockados
  - [x] Configurar validação de compatibilidade com novas versões do Next.js
  - [x] Criar processos para manutenção de testes de regressão

## Dev Notes

### Estratégia de Testes SSR

### Estratégia de Testes SSR

- **Framework Unitário:** Vitest + React Testing Library (substitui Jest para melhor performance e compatibilidade Vite)
- **Framework E2E/RSC:** Playwright (essencial para testar React Server Components reais)
- **Cobertura Mínima:** 80% dos componentes críticos
- **Tipos de Testes:**
  - **Unit:** Lógica de componentes e hooks (Vitest)
  - **E2E SSR:** Renderização inicial, Meta tags, Hidratação, No-JS fallback (Playwright)

### Componentes Prioritários para SSR Testing

1. **Layout Principal** (`src/app/layout.tsx`) - Estrutura base da aplicação
2. **Página Inicial** (`src/app/page.tsx`) - Dashboard principal
3. **Setup Wizard** (`src/components/features/setup/`) - Fluxo crítico de configuração
4. **Status Dashboard** (`src/components/features/dashboard/`) - Monitoramento em tempo real
5. **Componentes de Segurança** (`src/components/features/security/`) - Auditoria e controle

### Estratégia de Mocking

- **APIs Externas:** Mock completo de endpoints REST
- **Banco de Dados:** Mock de operações de leitura/gravação
- **Sistema de Arquivos:** Mock de operações ZFS/DRBD
- **Variáveis de Ambiente:** Configuração específica para testes

### Integração com Pipeline

- **Execução:** Testes SSR executados em todos os PRs
- **Validação:** Bloqueio automático de deploy em caso de falhas
- **Performance:** Monitoramento de tempo de execução dos testes
- **Cobertura:** Relatórios de cobertura mínima de 80%

### Project Structure Notes

- **Localização dos Testes:** `tests/ssr/` para testes SSR específicos
- **Estrutura de Testes:** `tests/ssr/components/` (Unit/Integration), `tests/ssr/atdd/` (E2E Scenarios)
- **Mock Setup:** `tests/__mocks__/` e `src/lib/api-server.ts` (para SSR Mocks)
- **Configuração:** `vitest.config.ts` (Unit) e `playwright.ssr.config.ts` (E2E/SSR)

### References

- [Source: docs/epics.md#Story-6.4](docs/epics.md#Story-6.4)
- [Next.js 16 App Router Documentation](https://nextjs.org/docs/app)
- [Jest SSR Testing Guide](https://jestjs.io/docs/tutorial-react)
- [React Testing Library SSR](https://testing-library.com/docs/react-testing-library/ssr)
- [Playwright SSR Testing](https://playwright.dev/docs/test-ssr)

## Dev Agent Record

### Agent Model Used

kwaipilot/kat-coder-pro:free

### Debug Log References

- [Debug Log: SSR Test Setup](path/to/debug/logs/ssr-setup.log)
- [Debug Log: Component Testing](path/to/debug/logs/ssr-components.log)
- [Debug Log: Integration Testing](path/to/debug/logs/ssr-integration.log)

### Completion Notes List

- Estratégia de testes SSR definida e aprovada
- Configuração de ambiente de testes SSR implementada
- Testes para componentes críticos criados e validados
- Integração com CI/CD configurada e testada
- Documentação de processos e melhores práticas criada

### File List

- `vitest.config.ts` - Configuração de testes SSR (Vitest)
- `playwright.ssr.config.ts` - Configuração de testes E2E SSR
- `tests/ssr/components/layout.test.tsx` - Testes do layout principal
- `tests/ssr/components/dashboard.test.tsx` - Testes do dashboard
- `tests/ssr/components/setup-wizard.test.tsx` - Testes do setup wizard
- `tests/ssr/components/security-dashboard.test.tsx` - Testes do security dashboard
- `tests/ssr/integration/page-rendering.test.tsx` - Testes de integração de páginas
- `tests/ssr/integration/hydration.test.tsx` - Testes de hidratação
- `tests/ssr/integration/ssr-csr-interaction.test.tsx` - Testes de interação SSR-CSR
- `tests/ssr/performance/ssr-performance.test.tsx` - Testes de performance
- `tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts` - Testes ATDD E2E
- `tests/__mocks__/styleMock.js` - Mock de estilos
- `tests/setup.ts` - Setup de testes
- `docs/testing/ssr-testing-guide.md` - Guia de testes SSR
- `.github/workflows/ssr-tests.yml` - Workflow de CI/CD
- `traceability-matrix-6-4.md` - Matriz de rastreabilidade
- `reports/ssr-quality-gate-2025-12-24.md` - Relatório de Quality Gate
- `src/app/error.tsx` - Global Error Boundary para falhas de SSR
