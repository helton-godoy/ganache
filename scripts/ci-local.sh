#!/bin/bash
set -e

echo "Simulating CI Environment Locally..."

echo "1. Linting..."
npm run lint

echo "2. Running E2E Tests..."
npx playwright test

echo "3. Running Burn-in (1 iteration for local check)..."
./scripts/burn-in.sh 1 tests/e2e/wizard.spec.ts

echo "CI Simulation Complete. All checks passed."
