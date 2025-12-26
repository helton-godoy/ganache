#!/bin/bash
# scripts/test-changed.sh
# Run only tests for changed files

set -e

BASE_BRANCH=${BASE_BRANCH:-main}

echo "🔍 Changed File Test Selector"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Base branch: $BASE_BRANCH"
echo ""

# Get changed files
CHANGED_FILES=$(git diff --name-only $BASE_BRANCH...HEAD 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
    echo "✅ No files changed. Running smoke tests."
    npm run test:e2e:p0
    exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES" | sed 's/^/  - /'
echo ""

# Detect if critical files changed
if echo "$CHANGED_FILES" | grep -qE '(package\.json|package-lock\.json|playwright\.config|tsconfig\.json|\.github/workflows)'; then
    echo "⚠️  Critical configuration files changed."
    echo "🚨 Running FULL test suite"
    echo ""
    npm run test:e2e
    exit $?
fi

# Collect test files
CHANGED_TEST_FILES=$(echo "$CHANGED_FILES" | grep -E '\.spec\.ts$' || echo "")

if [ -n "$CHANGED_TEST_FILES" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 Running changed test files"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$CHANGED_TEST_FILES" | sed 's/^/  - /'
    echo ""

    # Convert to space-separated list
    TEST_FILES=$(echo "$CHANGED_TEST_FILES" | tr '\n' ' ')
    npm run test:e2e -- $TEST_FILES
    exit $?
fi

# No test files changed, run smoke tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 No test files changed. Running P0 smoke tests."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run test:e2e:p0
