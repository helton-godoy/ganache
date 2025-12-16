# Test Automation Handoff

**Date**: 2025-12-16
**Agent**: TEA (Murat)
**Recipient**: Dev Agent (Amelia)

## Summary

Execution of the `*automate` workflow for the `Setup Wizard` feature is complete. The infrastructure is ready, but the E2E test is currently broken due to a mock data issue.

## Status

### Infrastructure ✅

- **Fixtures**: `authenticatedUser` added to `tests/support/fixtures/index.ts`.
- **Factories**: `UserFactory` updated and verified in `tests/support/fixtures/factories/user-factory.ts`.

### Tests ⚠️

- **New Test**: `tests/e2e/setup-wizard.spec.ts` (Marked as `FIXME`)
- **Issue**: The mock for `api.trpc.disk.list` in `wizard-fixture.ts` does not correctly simulate the server response structure for `superjson`. The UI renders the table empty because `useQuery` returns undefined/empty data despite the mock.

## Action Items for Dev Agent

1. **Investigate TRPC Mocking**:
   - Compare `src/server/api/routers/disk.ts` (if exists) output with `wizard-fixture.ts`.
   - Ensure `superjson` serialization in the mock matches what `trpc/client` expects.
   - Run `npx playwright test tests/e2e/setup-wizard.spec.ts --project=chromium --debug` to inspect the network response.

2. **Fix Test**:
   - Update `wizard-fixture.ts` with the correct JSON structure.
   - Remove `.fixme()` from `tests/e2e/setup-wizard.spec.ts`.
   - Verify pass.

## Command to Resume

Run the following to activate the Developer Agent:
`*dev`
