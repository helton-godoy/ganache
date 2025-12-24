# Test Documentation

## Setup

1. Copy `.env.example` to `.env`
2. Run `npm install`

## Running Tests

- `npm run test:e2e` - Run all E2E tests
- `npm run test:e2e:p0` - Run P0 critical tests only
- `npm run test:e2e:p1` - Run P0 + P1 tests (pre-merge)
- `npm run test:api` - Run API contract tests
- `npm run test:break-glass` - Run Break-Glass specific tests
- `npx playwright test --ui` - Run with UI Mode
- `npx playwright test --headed` - Run in headed mode

## Priority Tags

Tests are tagged with priorities for selective execution:

- **[P0]**: Critical paths - run on every commit (pre-commit hooks)
- **[P1]**: High priority - run on PR to main (CI/CD)
- **[P2]**: Medium priority - run nightly builds
- **[P3]**: Low priority - run on-demand

### Running by Priority

```bash
# P0 only (critical paths - fastest)
npm run test:e2e:p0

# P0 + P1 (pre-merge validation)
npm run test:e2e:p1

# P0 + P1 + P2 (comprehensive)
npm run test:e2e:p2

# All tests (including P3)
npm run test:e2e

# Filter by tag manually
npx playwright test --grep "\[P0\]"
npx playwright test --grep "\[P1\]|\[P0\]"
```

## Architecture

### Fixtures

Located in `tests/support/fixtures/`. **Always import test from fixtures, not from @playwright/test.**

#### Available Fixtures

- **`authenticatedPage`** (auth.fixture.ts): Pre-authenticated browser context
  - Auto-login as admin user
  - Auto-logout on test completion
  - Use for any test requiring authentication

- **`breakGlassActivated`** (break-glass.fixture.ts): Break-Glass account activated
  - Extends authenticatedPage
  - Activates emergency_admin via API
  - Auto-deactivation on cleanup
  - Use for Break-Glass emergency scenarios

#### Fixture Usage

```typescript
import { test, expect } from '../support/fixtures/break-glass.fixture';

test('[P0] should test break-glass scenario', async ({ breakGlassActivated }) => {
  // Use pre-activated break-glass context
  await breakGlassActivated.goto('/security');
  // emergency_admin is already activated
});
```

### Factories

Located in `tests/support/factories/`. Use for generating test data with deterministic randomness.

#### Available Factories

- **user.factory.ts**: User data generation
  - `createUser()` - Generate random user
  - `createAdmin()` - Generate admin user
  - `createEmergencyAdmin()` - Generate emergency_admin user
  - `generateValidPassword()` - NIST-compliant password (12+ chars, mixed case, numbers, symbols)
  - `generateInvalidPassword(reason)` - Invalid password for negative testing

- **security-event.factory.ts**: Security event generation
  - `createSecurityEvent()` - Generic security event
  - `createBreakGlassActivationEvent()` - Break-Glass activation event
  - `createBreakGlassAccessEvent()` - Break-Glass access event
  - `createBreakGlassDeactivationEvent()` - Break-Glass deactivation event
  - `createSshCommandEvent()` - SSH command event
  - `createConfigChangeEvent()` - Config change event

#### Factory Usage

```typescript
import { createAdmin, generateValidPassword } from '../support/factories/user.factory';
import { createBreakGlassActivationEvent } from '../support/factories/security-event.factory';

const admin = createAdmin({ username: 'specific-admin' });
const password = generateValidPassword();
const event = createBreakGlassActivationEvent({ user: admin.username });
```

### Selectors

- **Prefer**: `data-testid` attributes for stability
- **Fallback**: ARIA roles, text content
- **Avoid**: CSS classes, nth selectors (brittle)

## Directory Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── break-glass-*.spec.ts  # Break-Glass tests (Story 5.3)
│   ├── ssh-audit.spec.ts      # SSH audit tests (Story 5.1)
│   └── ...
├── api/                    # API contract tests
│   └── break-glass.api.spec.ts
├── component/              # Component tests (future)
├── unit/                   # Unit tests
└── support/
    ├── fixtures/           # Test fixtures (setup/teardown)
    │   ├── auth.fixture.ts
    │   └── break-glass.fixture.ts
    └── factories/          # Data factories (test data generation)
        ├── user.factory.ts
        └── security-event.factory.ts
```

## Best Practices

### Test Structure

Use Given-When-Then format for clarity:

```typescript
test('[P0] should activate break-glass account', async ({ authenticatedPage }) => {
  // GIVEN: Admin is authenticated
  await authenticatedPage.goto('/security/break-glass');

  // WHEN: Admin triggers activation
  await authenticatedPage.click('[data-testid="activate-button"]');

  // THEN: Account is activated
  await expect(authenticatedPage.locator('[data-testid="status"]')).toContainText('Active');
});
```

### Test Naming

- Start with priority tag: `[P0]`, `[P1]`, etc.
- Use descriptive names: "should [action] [expected result]"
- Keep test names under 100 chars

### Cleanup

- Use fixtures for automatic cleanup (preferred)
- Avoid manual cleanup in test body
- Fixtures guarantee cleanup even if test fails

### Data

- Use factories for all test data (no hardcoded values)
- Override defaults when needed
- Faker ensures unique values per test run
