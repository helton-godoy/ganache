#!/bin/bash
# tests/docs/test_generate_react_docs.sh

# Mock
mkdir -p src/components/test
cat <<EOF > src/components/test/TestComponent.tsx
import React from 'react';

/**
 * @description Test Component for documentation generation.
 * 
 * @param label - The label text
 * @returns JSX Element
 * 
 * @ref Story-4.1 - Test
 */
export function TestComponent({ label }: { label: string }) {
    return <div>{label}</div>;
}
EOF

# Run
if [ ! -f ./scripts/generate-react-docs.sh ]; then
    echo "❌ Generator script not found"
    exit 1
fi

./scripts/generate-react-docs.sh

# Check
if [ ! -f docs/components/TestComponent.md ]; then
    echo "❌ Output file docs/components/TestComponent.md not found"
    exit 1
fi

if ! grep -q "Test Component for documentation generation" docs/components/TestComponent.md; then
    echo "❌ Missing description content"
    exit 1
fi

echo "✅ Test passed"
rm -rf src/components/test
rm docs/components/TestComponent.md
