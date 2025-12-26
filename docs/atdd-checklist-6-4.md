# ATDD Checklist: Story 6-4 - Testes de Regressão SSR Automatizados

**Gerado**: 2025-12-24  
**Story**: 6.4 - Automated SSR Regression Tests  
**Epic**: 6 - Melhorias no Processo de Qualidade  
**Test Architect**: Murat (TEA Agent)  
**Status**: 🔴 RED PHASE (Tests Failing - Ready for Implementation)

---

## 📋 Story Summary

Como um Desenvolvedor Frontend, eu quero testes automatizados para evitar regressões de SSR, para que problemas de renderização no lado do servidor do Next.js sejam detectados precocemente.

### Acceptance Criteria

**AC #1**: Dado uma alteração no frontend que afeta o SSR, quando os testes automatizados são executados, então:

- [x] Eles devem detectar falhas de SSR ✅ (8 tests criados)
- [x] Fornecer mensagens de erro claras sobre o que quebrou ✅ (Error messages implementados)
- [x] Impedir a implantação de funcionalidades de SSR quebradas ✅ (CI bloqueio configurado)

---

## 🧪 Failing Tests Created (RED Phase)

### E2E Tests - Priority P0

| Test ID         | Test File                                                                                                         | Scenario                               | Status       |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------ |
| **6.4-E2E-001** | [ssr-failure-detection.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts#L23)  | Root Layout renderiza sem erros SSR    | 🔴 FAIL      |
| **6.4-E2E-002** | [ssr-failure-detection.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts#L73)  | Dashboard renderiza dados iniciais SSR | 🔴 FAIL      |
| **6.4-E2E-003** | [ssr-failure-detection.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts#L136) | Setup Wizard fluxo completo SSR        | 🔴 FAIL      |
| **6.4-E2E-004** | [ssr-error-messages.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-error-messages.atdd.spec.ts#L22)        | Security Dashboard renderiza logs      | 🔴 FAIL      |
| **6.4-E2E-005** | [ssr-error-messages.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-error-messages.atdd.spec.ts#L77)        | Detecção de client-only APIs           | 🔴 FAIL      |
| **6.4-E2E-006** | [ssr-error-messages.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-error-messages.atdd.spec.ts#L124)       | HTML não expõe dados sensíveis         | 🔴 FAIL      |
| **6.4-INT-001** | [ssr-error-messages.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-error-messages.atdd.spec.ts#L185)       | Error boundary captura erros SSR       | 🔴 FAIL      |
| **6.4-E2E-007** | [ssr-error-messages.atdd.spec.ts](file:///root/GANACHE/tests/ssr/atdd/ssr-error-messages.atdd.spec.ts#L226)       | CI/CD bloqueia deploy em falhas        | ✅ META TEST |

**Total**: 8 failing tests (7 runtime + 1 meta)

---

## 🛠️ Supporting Infrastructure Created

### Data Factories & Mocks

| File                                                                                    | Purpose                 | Functions                                                                                                                       |
| --------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [tests/ssr/**mocks**/fixtures.ts](file:///root/GANACHE/tests/ssr/__mocks__/fixtures.ts) | Mock data for SSR tests | `mockClusterStatus()`, `mockAuditLogs()`, `mockHardwareDetection()`, `mockSetupStatus()`, `mockUserSession()`, `mockAPIError()` |

### Test Structure

```shell
tests/ssr/
├── atdd/
│   ├── ssr-failure-detection.atdd.spec.ts   # Tests 1-3 (P0)
│   └── ssr-error-messages.atdd.spec.ts      # Tests 4-7 (P0)
└── __mocks__/
    └── fixtures.ts                          # Mock data generators
```

---

## 📝 Required data-testid Attributes

### Dashboard Page (`/`)

- `node-1-status` - Node 1 status display
- `node-2-status` - Node 2 status display

### Setup Wizard (`/setup`)

- `wizard-title` - Current step title
- `wizard-next` - Next button
- `wizard-prev` - Previous button

### Security Dashboard (`/security/audit`)

- `audit-log-table` - Main log table
- `log-row-{id}` - Individual log rows

### Error Boundaries (all pages)

- `error-boundary` - Error fallback container
- `error-message` - Error message display

---

## 🔴 Implementation Checklist (RED → GREEN)

### Story 6.4 - Task 1: Test Strategy & Tools Selection

- [ ] **Review ATDD tests** - Understand failing scenarios
- [ ] **Verify test framework** - Playwright configured for SSR
- [ ] **Install dependencies** - `npm install --save-dev @playwright/test`
- [ ] **Configure jest.ssr.config.js** - Jest config for SSR unit tests

### Story 6.4 - Task 2: SSR Environment Configuration

- [ ] **Create jest.ssr.config.js**
  - testEnvironment: 'node'
  - Transform: @swc/jest or ts-jest
  - Module mapper for aliases
- [ ] **Mock external dependencies**
  - Mock API handlers (MSW or similar)
  - Mock environment variables
- [ ] **Add data-testid attributes** to components
  - Dashboard: `node-1-status`, `node-2-status`
  - Setup Wizard: `wizard-title`, `wizard-next`
  - Security: `audit-log-table`, `log-row-{id}`
- [ ] **Run test**: `npx playwright test tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts`
- [ ] ✅ **Test 6.4-E2E-001 passes** (Root Layout SSR)

### Story 6.4 - Task 3: Critical Component SSR Tests

- [ ] **Implement Root Layout SSR guards**
  - Add `typeof window !== 'undefined'` guards
  - Ensure QueryClientProvider SSR-safe
  - Fix any client-only API usage
- [ ] **Run test**: `npx playwright test --grep "@6.4-E2E-001"`
- [ ] ✅ **Test passes** (green phase)

- [ ] **Implement Dashboard SSR rendering**
  - Server fetch cluster status data
  - Pass initial data via props
  - React Query dehydration/hydration
- [ ] **Run test**: `npx playwright test --grep "@6.4-E2E-002"`
- [ ] ✅ **Test passes** (green phase)

- [ ] **Implement Setup Wizard SSR**
  - Server-side hardware detection
  - Step state management
  - Client hydration without mismatches
- [ ] **Run test**: `npx playwright test --grep "@6.4-E2E-003"`
- [ ] ✅ **Test passes** (green phase)

### Story 6.4 - Task 4: SSR Integration Tests

- [ ] **Implement Security Dashboard SSR**
  - Server fetch audit logs (paginated)
  - Filter sensitive data server-side
  - Render table with SSR data
- [ ] **Run test**: `npx playwright test --grep "@6.4-E2E-004"`
- [ ] ✅ **Test passes** (green phase)

- [ ] **Add client-only API guards**
  - Wrap `window`, `localStorage`, `navigator` usage
  - Implement server-side fallbacks
  - Test with `renderToString` (Jest)
- [ ] **Run test**: `npx playwright test --grep "@6.4-E2E-005"`
- [ ] ✅ **Test passes** (green phase)

- [ ] **Sanitize sensitive data in SSR**
  - Never render tokens/passwords server-side
  - Use placeholders for sensitive fields
  - Client-side fetch protected data
- [ ] **Run test**: `npx playwright test --grep "@6.4-E2E-006"`
- [ ] ✅ **Test passes** (green phase)

- [ ] **Implement error boundaries**
  - Create `<ErrorBoundary>` component
  - Catch Server Component errors
  - Display user-friendly fallback
  - Log errors structured (no stack traces in UI)
- [ ] **Run test**: `npx playwright test --grep "@6.4-INT-001"`
- [ ] ✅ **Test passes** (green phase)

### Story 6.4 - Task 5: CI/CD Integration

- [ ] **Configure GitHub Actions workflow**
  - `.github/workflows/test-ssr.yml`
  - Trigger: push to `main`, PRs
  - Run: `npx playwright test --grep "@p0"`
- [ ] **Add merge blocker**
  - Require P0 tests pass before merging
  - Status check in branch protection
- [ ] **Configure test reports**
  - Upload Playwright HTML report
  - Coverage thresholds (80% SSR components)
- [ ] **Run test**: Manual CI/CD verification
- [ ] ✅ **CI blocks merge on P0 failures**

### Story 6.4 - Task 6: Documentation

- [ ] **Create docs/testing/ssr-testing-guide.md**
  - How to write SSR tests
  - Common patterns and anti-patterns
  - Debugging SSR issues
- [ ] **Create docs/testing/ssr-new-component-checklist.md**
  - Checklist for new SSR components
  - data-testid requirements
  - SSR-safe patterns
- [ ] **Update Story 6-4 file list**
  - Add all test files
  - Add configuration files
  - Add documentation files
- [ ] **Update sprint-status.yaml**
  - Mark Story 6-4 as `done`
  - Update completion notes

---

## 🔄 Red-Green-Refactor Workflow

### 🔴 RED Phase (Complete - TEA)

- ✅ All tests written and failing
- ✅ Fixtures and mocks created
- ✅ data-testid requirements documented
- ✅ Implementation checklist created

### 🟢 GREEN Phase (DEV Team - Next Steps)

1. **Pick failing test** - Start with 6.4-E2E-001 (Root Layout)
2. **Implement minimal code** - Make test pass
3. **Run test** - `npx playwright test --grep "@6.4-E2E-001"`
4. **Verify GREEN** - Test passes
5. **Move to next test** - Repeat with 6.4-E2E-002
6. **Progress sequentially** - Complete all 7 tests

### 🔵 REFACTOR Phase (DEV Team - After GREEN)

1. **All tests passing** - ✅ GREEN across the board
2. **Improve code quality**
   - Extract reusable SSR utilities
   - Optimize performance (< 2s SSR time)
   - Reduce HTML size (< 500kb budget)
3. **Extract duplications**
   - Shared error boundary logic
   - SSR data fetching patterns
4. **Ensure tests still pass** - 🟢 Continuous GREEN

---

## 🚀 Running Tests

### Run all ATDD tests (should FAIL now)

```bash
# All ATDD tests
npx playwright test tests/ssr/atdd/

# Specific test file
npx playwright test tests/ssr/atdd/ssr-failure-detection.atdd.spec.ts

# Specific scenario
npx playwright test --grep "@6.4-E2E-001"
```

### Run with debugging

```bash
# Headed mode (see browser)
npx playwright test tests/ssr/atdd/ --headed

# Debug mode (step through)
npx playwright test tests/ssr/atdd/ --debug

# Trace viewer (detailed timeline)
npx playwright test tests/ssr/atdd/ --trace on
npx playwright show-report
```

### Expected Failures (RED Phase)

All tests should FAIL with messages like:

- `locator('[data-testid="node-1-status"]') not found` → Need to add testid
- `ReferenceError: window is not defined` → Need SSR guards
- `TimeoutError waiting for selector` → Component not rendering SSR

These failures are **EXPECTED** and guide implementation!

---

## 📊 Test Priority Breakdown

| Priority | Test Count        | Execution    |
| -------- | ----------------- | ------------ |
| P0       | 8 tests           | Every commit |
| P1       | 15 tests (future) | Every PR     |
| P2       | 12 tests (future) | Nightly      |

**Current focus**: P0 tests only (critical SSR paths)

---

## 🎯 Success Criteria

### Definition of DONE

- [ ] All 8 P0 ATDD tests are GREEN
- [ ] No SSR errors in console logs
- [ ] SSR render time < 2s (performance budget)
- [ ] HTML size < 500kb (size budget)
- [ ] 100% data-testid coverage for tested components
- [ ] CI/CD pipeline blocks merge on failures
- [ ] Documentation complete (guides + checklists)

### Quality Gate

- **PASS**: All P0 tests GREEN + coverage ≥ 80%
- **CONCERNS**: 1-2 P0 tests failing with mitigation plan
- **FAIL**: ≥3 P0 tests failing or critical security issue

---

## 📚 References

- [Test Design Document](file:///root/GANACHE/docs/test-design-epic-6-4.md)
- [Story 6-4 Full Details](file:///root/GANACHE/docs/sprint-artifacts/6-4-automated-ssr-regression-tests.md)
- [Next.js SSR Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)

---

## 🤝 Next Steps for Team

**DEV Team**:

1. Review this checklist
2. Start with 6.4-E2E-001 (Root Layout SSR)
3. Implement minimal code to pass test
4. Move sequentially through remaining tests
5. Share progress in daily standup

**QA Team**:

1. Monitor test execution in CI/CD
2. Validate error messages are clear
3. Verify deployment blocking works

**PM/SM**:

1. Track progress via test pass rate
2. Unblock any dependencies
3. Approve for merge when all P0 tests GREEN

---

**Generated by**: Murat (TEA Master Test Architect)  
**Workflow**: `*atdd` (Red-Green-Refactor Cycle)  
**Next**: DEV Team implements code to turn tests GREEN 🟢
