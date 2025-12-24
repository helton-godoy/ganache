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

# 2. Validate framework content (not just existence!)
echo "Validating framework content quality..."

# Check for required sections
if ! grep -q "Como Usar Estas Diretrizes" "$DOC_FRAMEWORK"; then
    echo "FAIL: Framework missing 'How to Use' guide section"
    exit 1
fi
echo "PASS: Framework has usage guide."

if ! grep -q "Processo de Coordenação" "$DOC_FRAMEWORK"; then
    echo "FAIL: Framework missing coordination process section"
    exit 1
fi
echo "PASS: Framework has coordination process."

# Check for concrete examples (not just abstract principles)
if ! grep -q "Exemplo.*:.*SecurityEventService" "$DOC_FRAMEWORK"; then
    echo "FAIL: Framework lacks concrete service examples"
    exit 1
fi
echo "PASS: Framework has concrete examples."

# 3. Check for required scripts
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

# 4. Test validator execution (functional test)
if ! "$SCRIPT_VALIDATOR" > /dev/null 2>&1; then
    echo "FAIL: Validator script execution failed"
    exit 1
fi
echo "PASS: Validator passes compliance checks."

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
