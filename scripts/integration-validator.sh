#!/bin/bash
# scripts/integration-validator.sh
# Validates compliance with Story Integration Guidelines

set -e

echo "Starting Integration Validator..."

# 1. Check Framework Document Exists
FRAMEWORK_DOC="docs/integration-guidelines-framework.md"
if [ ! -f "$FRAMEWORK_DOC" ]; then
    echo "❌ Guidelines Framework missing!"
    exit 1
fi
echo "✅ Guidelines Framework found."

# 2. Validate Framework Content Quality
echo "Validating framework content..."

# Check for required sections
REQUIRED_SECTIONS=("Análise de Sobreposição" "Padrões de Serviços Compartilhados" "Como Usar Estas Diretrizes" "Processo de Coordenação" "Resolução de Conflitos")

for section in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "$section" "$FRAMEWORK_DOC"; then
        echo "  ✅ Section '$section' found"
    else
        echo "  ❌ Section '$section' missing!"
        exit 1
    fi
done

# 3. Validate Concrete Examples Exist (not just abstract principles)
echo "Checking for concrete examples..."
if grep -q "SecurityEventService" "$FRAMEWORK_DOC" && grep -q "Validation Scripts Library" "$FRAMEWORK_DOC"; then
    echo "  ✅ Concrete service examples found"
else
    echo "  ❌ Missing concrete examples of shared services!"
    exit 1
fi

# 4. Check for Overlap Analysis of ALL Epic 6 Stories
echo "Validating story overlap analysis..."
EPIC6_STORIES=("6.1" "6.2" "6.3" "6.4" "6.5" "6.6")
MISSING_STORIES=()

for story in "${EPIC6_STORIES[@]}"; do
    if ! grep -q "$story" "$FRAMEWORK_DOC"; then
        MISSING_STORIES+=("$story")
    fi
done

if [ ${#MISSING_STORIES[@]} -eq 0 ]; then
    echo "  ✅ All Epic 6 stories analyzed"
else
    echo "  ❌ Missing analysis for: ${MISSING_STORIES[*]}"
    exit 1
fi

# 5. Validate Dependency Template Exists
TEMPLATE_DEP="docs/dependency-mapping-template.md"
if [ ! -f "$TEMPLATE_DEP" ]; then
    echo "❌ Dependency mapping template missing!"
    exit 1
fi
echo "✅ Dependency template found."

# 6. Check Integration with BMAD Validate
if ! grep -q "integration-validator" scripts/bmad-validate.sh; then
    echo "⚠️  Warning: integration-validator not called by bmad-validate.sh"
fi

echo ""
echo "Integration Validation Complete. All compliance checks passed."
exit 0
