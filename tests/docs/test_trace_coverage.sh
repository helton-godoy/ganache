#!/bin/bash
# tests/docs/test_trace_coverage.sh

EXIT_CODE=0
echo "🔍 Verificando cobertura de Traceability..."

# Check if traceability.md was generated
if [ ! -f docs/traceability.md ]; then
    echo "❌ docs/traceability.md does not exist"
    exit 1
fi

# Check size
SIZE=$(wc -c < docs/traceability.md)
if [ "$SIZE" -lt 100 ]; then
    echo "❌ Traceability matrix seems too small/empty"
    exit 1
fi

echo "✅ Traceability matrix exists"
exit 0
