#!/bin/bash
# tests/integration/test_integration_validation.sh
# Validates the existence and basic functionality of integration guideline artifacts

set -e

echo "Testing Integration Guidelines Framework..."

# 1. Check for core documentation
DOC_FRAMEWORK="docs/integration-guidelines-framework.md"
if [ ! -f "$DOC_FRAMEWORK" ]; then
    echo "FAIL: Integration Guidelines Framework document not found at $DOC_FRAMEWORK"
    exit 1
fi

echo "PASS: Framework document exists."

# 2. Check for required scripts
SCRIPT_VALIDATOR="scripts/integration-validator.sh"
if [ ! -f "$SCRIPT_VALIDATOR" ]; then
    echo "FAIL: Integration Validator script not found at $SCRIPT_VALIDATOR"
    exit 1
fi

if [ ! -x "$SCRIPT_VALIDATOR" ]; then
    echo "FAIL: Integration Validator script is not executable"
    exit 1
fi

echo "PASS: Validator script exists and is executable."

# 3. Check for dependency template
TEMPLATE_DEP="docs/dependency-mapping-template.md"
if [ ! -f "$TEMPLATE_DEP" ]; then
    echo "FAIL: Dependency mapping template not found at $TEMPLATE_DEP"
    exit 1
fi

echo "PASS: Dependency template exists."

echo "All Integration Validation tests passed."
exit 0
