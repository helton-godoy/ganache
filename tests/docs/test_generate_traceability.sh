#!/bin/bash
# tests/docs/test_generate_traceability.sh

# Mock
mkdir -p core/ganache-test-trace/src
cat <<EOF > core/ganache-test-trace/src/lib.rs
/// @ref Story-9.9 - Test Traceability
pub fn test_trace() {}
EOF

# Run
if [ ! -f ./scripts/generate-traceability-matrix.sh ]; then
    echo "❌ Generator script not found"
    exit 1
fi

./scripts/generate-traceability-matrix.sh

# Check
if [ ! -f docs/traceability.md ]; then
    echo "❌ Output file docs/traceability.md not found"
    exit 1
fi

if ! grep -q "Story 9.9" docs/traceability.md; then
    echo "❌ Missing trace link for Story 9.9"
    exit 1
fi

echo "✅ Test passed"
rm -rf core/ganache-test-trace
# We don't delete traceability.md as it might contain other real data
