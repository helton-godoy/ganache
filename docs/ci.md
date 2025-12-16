# CI/CD Pipeline Configuration

## Overview

We have established a production-ready CI/CD pipeline using GitHub Actions to ensure code quality and test reliability for the Ganache project.

## Pipeline Stages

The pipeline is defined in `.github/workflows/test.yml` and consists of three main stages:

1. **Lint & Static Analysis**: Runs `eslint` and checks for code style issues.
2. **E2E Tests (Sharded)**: Runs Playwright tests split across 4 parallel shards to ensure fast feedback.
3. **Burn-in Loop**: Runs critical tests (e.g., `wizard.spec.ts`) 10 times to detect flakiness before merging.

## Local Development

You can simulate the CI environment locally using the provided helper scripts:

### Run Full CI Simulation

```bash
./scripts/ci-local.sh
```

### Run Burn-in Loop

To check if a specific test is flaky:

```bash
# Run 10 iterations of wizard.spec.ts
./scripts/burn-in.sh 10 tests/e2e/wizard.spec.ts
```

## Secrets Checklist

Ensure the following secrets are configured in your GitHub Repository settings if needed (currently none required for basic tests):

- [ ] `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` (If using Playwright Service)
- [ ] `DATABASE_URL` (If running against real DB in future)

## Architecture Decisions

- **Caching**: `npm` cache is enabled to speed up installs.
- **Fail-Fast**: Disabled for sharded jobs to ensure we see all failures.
- **Artifacts**: Playwright reports are uploaded only on failure.
