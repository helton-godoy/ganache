#!/bin/bash
set -e

ITERATIONS=${1:-10}
TEST_TARGET=${2:-"tests/e2e/wizard.spec.ts"}

echo "Running Burn-in: $ITERATIONS iterations of $TEST_TARGET"

for i in $(seq 1 $ITERATIONS); do
	echo "Iteration $i/$ITERATIONS"
	npx playwright test "$TEST_TARGET" --reporter=line
done
