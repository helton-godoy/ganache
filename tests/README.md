# Test Documentation

## Setup

1. Copy `.env.example` to `.env`
2. Run `npm install`

## Running Tests

- `npm run test:e2e` - Run all E2E tests
- `npx playwright test --ui` - Run with UI Mode
- `npx playwright test --headed` - Run in headed mode

## Architecture

- **Fixtures**: Located in `tests/support/fixtures`. Use `test` from here, not `@playwright/test`.
- **Factories**: Located in `tests/support/fixtures/factories`. Use for generating test data.
- **Selectors**: Prefer `data-testid` attributes.

## directory Structure

- `tests/e2e/`: End-to-end tests
- `tests/support/`: Helpers and fixtures
