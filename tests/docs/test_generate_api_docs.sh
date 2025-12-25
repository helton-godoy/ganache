#!/bin/bash
# tests/docs/test_generate_api_docs.sh

# Mock an openapi.json if strictly needed, but we found one at docs/openapi.json
# We will use that one.

# Run the generator
if [ ! -f ./scripts/generate-api-docs.sh ]; then
    echo "❌ Generator script not found"
    exit 1
fi

./scripts/generate-api-docs.sh

# Check for output (assuming it generates at least one file or index)
if [ ! -d docs/api/openapi ]; then
    echo "❌ Output directory docs/api/openapi not found"
    exit 1
fi

if [ -z "$(ls -A docs/api/openapi)" ]; then
    echo "❌ Output directory empty"
    exit 1
fi

echo "✅ Test passed"
