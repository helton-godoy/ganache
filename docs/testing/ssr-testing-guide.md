# Guia de Testes SSR (Story 6-4)

Este documento descreve como executar, manter e criar novos testes de regressão SSR para o Ganache Appliance.

## Estrutura de Testes

Os testes SSR estão localizados em `tests/ssr/` e divididos em:

- **Unit/Component (`tests/ssr/components/`)**: Testes isolados de componentes usando Vitest + Testing Library. Focam em renderização e props.
- **Integration (`tests/ssr/integration/`)**: Testes de interação entre páginas e componentes.
- **Performance (`tests/ssr/performance/`)**: Testes de benchmark de renderização.
- **E2E/ATDD (`tests/ssr/atdd/`)**: Testes End-to-End usando Playwright para validar fluxos completos e hidratação.

## Executando Testes

### Unit & Integration (Vitest)

```bash
npx vitest run tests/ssr --config vitest.config.ts
```

### E2E (Playwright)

```bash
npx playwright test --config playwright.ssr.config.ts
```

## Criando Novos Testes

### Componente SSR

1. Crie o arquivo em `tests/ssr/components/NomeComponente.test.tsx`.
2. Use `render` do `@testing-library/react`.
3. Certifique-se de mockar dependências de servidor (CSS, Imagens, Fontes) se necessário.

### Cenário E2E

1. Crie o arquivo em `tests/ssr/atdd/`.
2. Use o padrão `test.describe` com tags `@ssr`.
3. Mocke as APIs de backend (`page.route`) para testar o SSR isoladamente.

## Mocks

- **CSS**: Mocks globais configurados em `vitest.config.ts` apontando para `tests/__mocks__/styleMock.js`.
- **APIs**: Mockadas via Playwright `page.route` ou Vitest `vi.mock`.

## CI/CD

O workflow `.github/workflows/ssr-tests.yml` executa automaticamente toda a suíte em PRs. A falha bloqueia o merge.
