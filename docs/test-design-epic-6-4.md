# Test Design: Story 6-4 - Testes de Regressão SSR Automatizados

**Gerado**: 2025-12-24  
**Epic**: Epic 6 - Melhorias no Processo de Qualidade  
**Story**: 6.4 - Testes de Regressão SSR Automatizados  
**Test Architect**: Murat (TEA Agent)  

---

## 📋 Resumo Executivo

Este documento fornece o design completo de testes para prevenir regressões de SSR (Server-Side Rendering) no Ganache Appliance, que utiliza **Next.js 16 App Router**. A estratégia foca em detectar falhas de renderização server-side precocemente, antes que impactem produção, através de uma combinação de testes **Unit**, **Integration**, **E2E** e **Performance**.

**Contexto Crítico**: O Ganache é um Storage Appliance de Alta Disponibilidade com frontend em Next.js 16. O SSR é fundamental para:

- **Segurança**: Componentes de auditoria e controle de acesso devem renderizar server-side
- **Performance**: Dashboard de status e monitoramento precisam de dados iniciais rápidos
- **SEO**: Páginas de setup wizard e documentação precisam ser indexáveis

**Falhas de SSR podem causar**:

- TECH: Aplicação quebrada (tela branca, erro 500)
- SEC: Bypass de validações server-side
- PERF: Degradação de tempo de carregamento inicial
- BUS: Impacto na experiência do usuário em funções críticas

---

## 🎯 Acceptance Criteria Review

**AC #1**: *Dado* uma alteração no frontend que afeta o SSR  
*Quando* os testes automatizados são executados  
*Então* eles devem detectar falhas de SSR  
*E* fornecer mensagens de erro claras sobre o que quebrou  
*E* impedir a implantação de funcionalidades de SSR quebradas

**Validação**:

- ✅ Detectar falhas = Testes executam em CI/CD e retornam falha em erro SSR
- ✅ Mensagens claras = Logs estruturados identificam componente e causa raiz
- ✅ Impedir deploy = Bloqueio automático de merge se testes P0/P1 falharem

---

## 🚨 Análise de Risco SSR (Probability × Impact)

### Riscos Identificados

| Risk ID | Categoria | Descrição | Probabilidade | Impacto | Score | Mitigation |
|---------|-----------|-----------|---------------|---------|-------|------------|
| **R-SSR-001** | TECH | **Componente usa client-only API no servidor** (window, localStorage, navigator) | 3 (Likely) | 3 (Critical) | **9** | Testes E2E + guards de runtime |
| **R-SSR-002** | TECH | **Falha de hidratação** (mismatch server vs client) | 2 (Possible) | 3 (Critical) | **6** | Testes de hidratação + snapshots |
| **R-SSR-003** | PERF | **Timeout de renderização SSR** (\>30s) | 2 (Possible) | 2 (Degraded) | **4** | Testes de performance + métricas |
| **R-SSR-004** | DATA | **Dados sensíveis vazam no HTML inicial** | 1 (Unlikely) | 3 (Critical) | **3** | Testes de security + content validation |
| **R-SSR-005** | TECH | **Erro em Server Component não capturado** | 2 (Possible) | 3 (Critical) | **6** | Testes de error boundary + logs |
| **R-SSR-006** | PERF | **Tamanho excessivo do HTML inicial** (\>500kb) | 2 (Possible) | 2 (Degraded) | **4** | Testes de performance + budget |
| **R-SSR-007** | BUS | **Setup Wizard quebrado impede onboarding** | 3 (Likely) | 3 (Critical) | **9** | Testes E2E críticos + smoke tests |
| **R-SSR-008** | SEC | **Security Dashboard falha ao renderizar logs** | 2 (Possible) | 3 (Critical) | **6** | Testes de integração + mocks |

### Riscos Críticos (Score = 9) - BLOQUEADORES

**R-SSR-001**: Componente usa client-only API no servidor  

- **Exemplo**: `window.matchMedia()` em componente SSR
- **Impacto**: Erro 500, aplicação quebrada
- **Mitigation**: Wrapper com `typeof window !== 'undefined'` + testes E2E

**R-SSR-007**: Setup Wizard quebrado impede onboarding  

- **Exemplo**: Falha ao buscar dados iniciais no servidor
- **Impacto**: Usuário não consegue configurar o appliance
- **Mitigation**: Testes E2E do fluxo completo + fallbacks

### Riscos Altos (Score 6-8) - REQUEREM MITIGATION

**R-SSR-002**: Falha de hidratação (mismatch)  

- **Mitigation**: Snapshot tests + React Strict Mode

**R-SSR-005**: Erro em Server Component não capturado  

- **Mitigation**: Error boundaries + structured logging

**R-SSR-008**: Security Dashboard falha ao renderizar logs  

- **Mitigation**: Integration tests com mocks + fallback UI

---

## 🧪 Estratégia de Cobertura de Testes

### Test Pyramid - SSR Focused

```
          /\
         /E2\      P0: 8 scenarios  (Critical user journeys)
        /2E2E\     
       /------\    
      / API &  \   P1: 15 scenarios (Core SSR functionality)
     /Integration\ 
    /------------\ 
   /    Unit      \ P1/P2: 25 scenarios (Component logic)
  /----------------\
```

**Distribuição Recomendada**:

- **Unit Tests**: 40% (Lógica de componentes isolados)
- **Integration Tests**: 35% (Renderização + data fetching)
- **E2E Tests**: 20% (Fluxos críticos completos)
- **Performance Tests**: 5% (Métricas e budgets)

---

## 📊 Matriz de Cobertura de Testes

### Componentes Críticos SSR (Priorização)

| Componente | Localização | Risco | Nível de Teste | Prioridade |
|------------|-------------|-------|----------------|------------|
| **Root Layout** | `src/app/layout.tsx` | R-SSR-001 | Unit + E2E | P0 |
| **Dashboard Page** | `src/app/page.tsx` | R-SSR-007 | Integration + E2E | P0 |
| **Setup Wizard** | `src/components/features/setup/` | R-SSR-007 | E2E | P0 |
| **Security Dashboard** | `src/components/features/security/` | R-SSR-008 | Integration + E2E | P0 |
| **Status Monitoring** | `src/components/features/dashboard/` | R-SSR-005 | Integration | P1 |
| **QueryClientProvider** | `src/app/providers.tsx` | R-SSR-001 | Unit | P1 |
| **Font Loading** | `src/app/layout.tsx` | R-SSR-002 | Unit | P2 |

---

## 🎯 Test Scenarios Detalhados

### P0 - Critical (Must Test) - 8 scenarios

#### **Scenario 1**: Root Layout renderiza sem erros SSR  

**Test ID**: `6.4-E2E-001`  
**Risk**: R-SSR-001  
**Level**: E2E  
**Description**:  

- **Given**: Next.js app iniciando server-side
- **When**: Root layout é renderizado
- **Then**: HTML inicial contém elementos estruturais (`<html>`, `<body>`, QueryClientProvider)
- **And**: Nenhum erro de "window is not defined"
- **And**: Fonts são carregadas via next/font

**Test Data**: Mock de configuração inicial  
**Tools**: Playwright + HAR capture  
**Owner**: QA

---

#### **Scenario 2**: Dashboard page renderiza dados iniciais via SSR  

**Test ID**: `6.4-E2E-002`  
**Risk**: R-SSR-007  
**Level**: E2E  
**Description**:  

- **Given**: Usuário navegando para `/`
- **When**: Página é renderizada server-side
- **Then**: HTML inicial contém dados de status do cluster (Node 1, Node 2)
- **And**: React Query hydration ocorre sem mismatch
- **And**: Tempo de SSR < 2s

**Test Data**: Mock de API `/api/status`  
**Tools**: Playwright + network interception  
**Owner**: QA

---

#### **Scenario 3**: Setup Wizard - Fluxo completo SSR  

**Test ID**: `6.4-E2E-003`  
**Risk**: R-SSR-007  
**Level**: E2E  
**Description**:  

- **Given**: Appliance em modo "First Boot"
- **When**: Usuário acessa `/setup`
- **Then**: SSR renderiza wizard step 1 (Hardware Detection)
- **And**: Navegação entre steps funciona (client-side transitions)
- **And**: Dados persistem no servidor (Git Config Backend)

**Test Data**: Mock de hardware detection API  
**Tools**: Playwright + multi-step flow  
**Owner**: QA

---

#### **Scenario 4**: Security Dashboard renderiza logs de auditoria  

**Test ID**: `6.4-E2E-004`  
**Risk**: R-SSR-008  
**Level**: E2E  
**Description**:  

- **Given**: Logs de auditoria existem no sistema
- **When**: Usuário acessa `/security/audit`
- **Then**: SSR renderiza tabela de logs (primeiras 50 entradas)
- **And**: Dados sensíveis NÃO aparecem no HTML inicial (apenas IDs)
- **And**: Filtros funcionam client-side

**Test Data**: Mock de `/api/audit/logs`  
**Tools**: Playwright + content validation  
**Owner**: QA

---

#### **Scenario 5**: QueryClientProvider não causa erro SSR  

**Test ID**: `6.4-UNIT-001`  
**Risk**: R-SSR-001  
**Level**: Unit  
**Description**:  

- **Given**: QueryClientProvider configurado em `providers.tsx`
- **When**: Componente é renderizado server-side (renderToString)
- **Then**: Nenhum erro de "window is not defined"
- **And**: `defaultOptions` estão configurados corretamente
- **And**: SSR context é criado sem vazamento de memória

**Test Data**: None (pure component)  
**Tools**: Jest + React renderToString  
**Owner**: Dev

---

#### **Scenario 6**: Detecção de window/localStorage em SSR  

**Test ID**: `6.4-E2E-005`  
**Risk**: R-SSR-001  
**Level**: E2E  
**Description**:  

- **Given**: Componente tenta acessar `window.localStorage`
- **When**: SSR executa
- **Then**: Guard `typeof window !== 'undefined'` previne erro
- **And**: Fallback value é usado no servidor
- **And**: Hydration sincroniza valor correto no client

**Test Data**: Component with localStorage  
**Tools**: Playwright + console error monitoring  
**Owner**: Dev

---

#### **Scenario 7**: Erro em Server Component é capturado  

**Test ID**: `6.4-INT-001`  
**Risk**: R-SSR-005  
**Level**: Integration  
**Description**:  

- **Given**: Server Component lança erro (API timeout)
- **When**: SSR tenta renderizar
- **Then**: Error boundary captura erro
- **And**: Fallback UI é renderizado
- **And**: Erro é logado estruturadamente (com stack trace)

**Test Data**: Mock API com erro 500  
**Tools**: Playwright + error boundary fixture  
**Owner**: Dev

---

#### **Scenario 8**: HTML inicial não contém dados sensíveis  

**Test ID**: `6.4-E2E-006`  
**Risk**: R-SSR-004  
**Level**: E2E  
**Description**:  

- **Given**: Usuário acessa página com dados sensíveis
- **When**: SSR renderiza HTML inicial
- **Then**: Senhas, tokens, chaves NÃO aparecem no HTML
- **And**: Apenas placeholders/IDs são renderizados
- **And**: Dados reais são fetchados client-side (autenticado)

**Test Data**: Mock de usuário autenticado  
**Tools**: Playwright + HTML content scan  
**Owner**: Security QA

---

### P1 - High (Should Test) - 15 scenarios

#### **Scenario 9**: Falha de hidratação detectada  

**Test ID**: `6.4-INT-002`  
**Risk**: R-SSR-002  
**Level**: Integration  
**Description**:  

- **Given**: Server renderiza timestamp dinâmico
- **When**: Client hydrates
- **Then**: Warning de mismatch é emitido
- **And**: Cliente re-renderiza com valor correto
- **And**: Teste falha se mismatch ocorrer

**Test Data**: Component with dynamic data  
**Tools**: Jest + React hydration test  
**Owner**: Dev

---

#### **Scenario 10**: SSR rendering time < 2s  

**Test ID**: `6.4-PERF-001`  
**Risk**: R-SSR-003  
**Level**: Performance  
**Description**:  

- **Given**: Dashboard page com dados de produção
- **When**: SSR executa
- **Then**: Tempo total de renderização < 2s
- **And**: Métricas são coletadas (TTFB, FCP)
- **And**: Alerta se exceder budget

**Test Data**: Mock de produção (10 nodes, 50 datasets)  
**Tools**: Playwright + performance metrics  
**Owner**: QA

---

#### **Scenario 11**: HTML size budget (< 500kb)  

**Test ID**: `6.4-PERF-002`  
**Risk**: R-SSR-006  
**Level**: Performance  
**Description**:  

- **Given**: Página complexa (Dashboard)
- **When**: SSR gera HTML inicial
- **Then**: Tamanho do HTML < 500kb
- **And**: Inline styles minimizados
- **And**: Teste falha se exceder budget

**Test Data**: Página com N componentes  
**Tools**: Playwright + response size check  
**Owner**: QA

---

#### **Scenario 12-20**: *(Continuação de cenários P1)*  

- Cluster topology renderiza sem erros
- Font loading não bloqueia SSR
- Status cards renderizam dados mockados
- Error boundary funciona em nested components
- API mocking funciona em environment de teste
- React Query SSR dehydration/hydration
- Navegação entre páginas preserva SSR
- Metadata SEO é injetado corretamente

---

### P2 - Medium (Nice to Test) - 12 scenarios

- Admin settings renderizam SSR
- Help documentation é indexável (SEO)
- Theme toggle não causa mismatch
- Audit logs pagination SSR
- Configuration timeline SSR
- etc.

---

## ⏱️ Execution Order & Time Budget

### Smoke Tests (< 2 min)

1. **6.4-E2E-001**: Root Layout renderiza (30s)
2. **6.4-E2E-002**: Dashboard renderiza dados (30s)
3. **6.4-UNIT-001**: QueryClientProvider SSR (5s)

**Total**: <90s

### P0 Tests (< 10 min)

- Todos os 8 scenarios P0
- Sequential execution (dependências de setup)

### P1 Tests (< 20 min)

- 15 scenarios P1
- Parallel execution (4 workers)

### P2 Tests (< 30 min)

- 12 scenarios P2
- Parallel + nightly

---

## 📁 Test File Structure

```
tests/ssr/
├── atdd/
│   ├── ssr-failure-detection.atdd.spec.ts  # Red-phase tests
│   ├── ssr-error-messages.atdd.spec.ts
│   └── ssr-deploy-blocker.atdd.spec.ts
├── components/
│   ├── layout.test.tsx                     # Unit: P0
│   ├── dashboard.test.tsx                  # Unit: P1
│   ├── setup-wizard.test.tsx               # Unit: P0
│   └── security-dashboard.test.tsx         # Unit: P0
├── integration/
│   ├── page-rendering.test.tsx             # Integration: P1
│   ├── hydration.test.tsx                  # Integration: P1
│   ├── error-boundary.test.tsx             # Integration: P0
│   └── query-client-ssr.test.tsx           # Integration: P1
├── e2e/
│   ├── critical-flows.spec.ts              # E2E: P0 (scenarios 1-4, 6-8)
│   ├── setup-wizard-ssr.spec.ts            # E2E: P0 (scenario 3)
│   └── security-audit-ssr.spec.ts          # E2E: P0 (scenario 4)
├── performance/
│   ├── ssr-timing.test.ts                  # Perf: P1 (scenario 10)
│   ├── html-size.test.ts                   # Perf: P1 (scenario 11)
│   └── hydration-performance.test.ts       # Perf: P2
├── __mocks__/
│   ├── api-handlers.ts                     # Shared mocks
│   ├── fixtures.ts                         # Test data factories
│   └── ssr-utils.ts                        # SSR test helpers
└── jest.ssr.config.js                      # SSR-specific Jest config
```

---

## 🛠️ Test Data Requirements

### Factories/Fixtures

```typescript
// tests/__mocks__/fixtures.ts
export const mockClusterStatus = () => ({
  nodes: [
    { id: 1, name: 'ganache-01', status: 'primary', uptime: '15d' },
    { id: 2, name: 'ganache-02', status: 'secondary', uptime: '15d' }
  ],
  drbd: { status: 'UpToDate', sync: 100 },
  zfs: { pools: [{ name: 'tank', status: 'ONLINE', usage: 45 }] }
});

export const mockAuditLogs = (count = 50) => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    user: `user${i % 5}@example.com`,
    action: ['CREATE', 'UPDATE', 'DELETE'][i % 3],
    resource: 'dataset',
    details: { name: `dataset-${i}` }
  }));
```

### External Services (Mocks)

- **APIs**: Mock completo de endpoints REST via `msw` (Mock Service Worker)
- **Banco de Dados**: Não necessário (testes SSR focam em renderização, não persistência)
- **Sistema de Arquivos**: Mock de operações ZFS/DRBD via fixture data
- **Variáveis de Ambiente**: `.env.test` com configurações para SSR

---

## ⚙️ Tooling & Configuration

### Jest SSR Config (`jest.ssr.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node', // SSR executa em Node
  testMatch: ['**/tests/ssr/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        transform: { react: { runtime: 'automatic' } }
      }
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/ssr/setup.ts'],
  collectCoverageFrom: [
    'src/app/**/*.{ts,tsx}',
    'src/components/features/**/*.{ts,tsx}',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**'
  ],
  coverageThresholds: {
    'src/app/': { statements: 80, branches: 75, functions: 80, lines: 80 },
    'src/components/features/': { statements: 80, branches: 70, functions: 75, lines: 80 }
  }
};
```

### Playwright SSR Config (`.playwright/ssr.config.ts`)

```typescript
export default {
  testDir: './tests/ssr/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'ssr-chrome', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
};
```

---

## 🚦 Quality Gate Criteria

### Gate PASS Criteria

- ✅ **P0 pass rate**: 100% (8/8 scenarios passing)
- ✅ **P1 pass rate**: ≥95% (14+/15 scenarios passing)
- ✅ **Coverage**: ≥80% para componentes SSR críticos
- ✅ **Performance budgets**: SSR < 2s, HTML < 500kb
- ✅ **Zero critical risks**: Nenhum score=9 em status OPEN

### Gate CONCERNS Criteria

- ⚠️ **P0 pass rate**: 87-99% (7/8 passing, 1 com mitigation plan)
- ⚠️ **P1 pass rate**: 85-94% (13-14/15 passing)
- ⚠️ **High risks**: Score 6-8 com mitigation planejada e owner atribuído

### Gate FAIL Criteria

- ❌ **P0 pass rate**: <87% (≤6/8 passing)
- ❌ **Critical risks**: Qualquer score=9 em status OPEN
- ❌ **Coverage gaps**: AC sem nenhum teste mapeado

### Gate WAIVED Criteria

- 🔓 **Waiver aprovado**: PM/CTO aprovou explicitamente
- 🔓 **Justificativa**: Documentada com data de expiração
- 🔓 **Mitigation plan**: Plano de correção em sprint futura

---

## 📈 Estimativas de Esforço

### Desenvolvimento de Testes

| Fase | Scenarios | Tempo Estimado | Owner |
|------|-----------|----------------|-------|
| **ATDD (Red phase)** | 3 specs failing | 4h | Dev + QA |
| **Unit Tests** | 10 scenarios | 12h | Dev |
| **Integration Tests** | 8 scenarios | 10h | Dev |
| **E2E Tests** | 8 scenarios | 16h | QA |
| **Performance Tests** | 3 scenarios | 6h | QA |
| **Mocks & Fixtures** | - | 4h | Dev |
| **Configuration** | - | 2h | Dev |
| **Documentation** | - | 2h | Tech Writer |
| **TOTAL** | 35 scenarios | **56h** (~7 days) |

### Execução de Testes (CI/CD)

| Suite | Tempo Estimado | Frequência |
|-------|----------------|------------|
| Smoke (P0 subset) | 2 min | Every commit |
| P0 Full | 10 min | Every PR |
| P0 + P1 | 20 min | Pre-merge |
| Full Regression (P0-P2) | 35 min | Nightly |

---

## 🔗 Dependencies & Integration

### Story Dependencies

- **Blocks**: Story 6-6 (Geração Automatizada de Documentação) - precisa de testes SSR estáveis
- **Blocked by**: Nenhuma

### Shared Components

- `tests/ssr/` - Diretório de testes SSR compartilhado
- `jest.ssr.config.js` - Configuração Jest reutilizável
- `tests/__mocks__/` - Mocks compartilhados entre stories

### CI/CD Integration

- **GitHub Actions**: Workflow `.github/workflows/test-ssr.yml`
- **Trigger**: Push para `main`, PRs para `main`, nightly schedule
- **Bloqueio**: Merge bloqueado se P0 ou P1 falharem

---

## 📚 References

- [Next.js 16 App Router SSR Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Jest SSR Testing Guide](https://jestjs.io/docs/tutorial-react)
- [Playwright SSR Testing](https://playwright.dev/docs/test-components)
- [React Query SSR Guide](https://tanstack.com/query/latest/docs/react/guides/ssr)
- Knowledge Base: `risk-governance.md`, `test-levels-framework.md`, `test-priorities-matrix.md`

---

## ✅ Validation Checklist

- [x] **Risk assessment complete**: 8 riscos identificados e scored
- [x] **All risks scored**: Probability × Impact para cada risco
- [x] **High-priority risks flagged**: R-SSR-001 (score 9) e R-SSR-007 (score 9)
- [x] **Coverage matrix**: Todos os componentes críticos mapeados para níveis de teste
- [x] **Priority levels assigned**: P0 (8), P1 (15), P2 (12) scenarios
- [x] **Execution order defined**: Smoke → P0 → P1 → P2
- [x] **Resource estimates**: 56h (~7 dias) de desenvolvimento
- [x] **Quality gate criteria**: PASS/CONCERNS/FAIL/WAIVED com thresholds claros
- [x] **Output file created**: `test-design-epic-6-4.md`

---

**Next Steps**:

1. ✅ Review test design com time (aprovado via `notify_user`)
2. 🔜 Executar `*atdd` workflow para gerar testes E2E failing (Red phase)
3. 🔜 Executar `*automate` workflow para criar suite completa
4. 🔜 Executar `*trace` workflow para validar cobertura
5. 🔜 Executar `*ci` workflow para integração GitHub Actions

---

**Gerado por**: Murat (TEA Master Test Architect)  
**Workflow**: `*test-design` (Epic-Level Mode)  
**Data**: 2025-12-24
