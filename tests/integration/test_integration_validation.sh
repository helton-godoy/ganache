#!/bin/bash
# tests/integration/test_integration_validation.sh
# Validates the existence and CONTENT QUALITY of integration guideline artifacts

set -e

echo "Testing Integration Guidelines Framework..."

# 1. Check for core documentation
DOC_FRAMEWORK="docs/integration-guidelines-framework.md"
if [ ! -f "$DOC_FRAMEWORK" ]; then
    echo "FAIL: Integration Guidelines Framework document not found at $DOC_FRAMEWORK"
    exit 1
fi
echo "PASS: Framework document exists."

# 2. Execute functional validation (this script covers all content checks)
# We trust integration-validator.sh to check internal content compliance
echo "Executing Integration Validator to verify compliance..."

SCRIPT_VALIDATOR="scripts/integration-validator.sh"
if [ ! -x "$SCRIPT_VALIDATOR" ]; then
    echo "FAIL: Integration Validator script missing or not executable"
    exit 1
fi

if ! "$SCRIPT_VALIDATOR" > /dev/null 2>&1; then
    echo "FAIL: Integration Validator script failed its own internal checks"
    # Run again to show output for debugging
    "$SCRIPT_VALIDATOR"
    exit 1
fi
echo "PASS: Validator execution successful."

# 5. Check for dependency template
TEMPLATE_DEP="docs/dependency-mapping-template.md"
if [ ! -f "$TEMPLATE_DEP" ]; then
    echo "FAIL: Dependency mapping template not found at $TEMPLATE_DEP"
    exit 1
fi
echo "PASS: Dependency template exists."

# 6. Validate template structure
if ! grep -q "Dependências de Código" "$TEMPLATE_DEP"; then
    echo "FAIL: Template missing required sections"
    exit 1
fi
echo "PASS: Template has proper structure."

echo ""
echo "All Integration Validation tests passed."
exit 0
