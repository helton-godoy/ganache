#!/bin/bash
# tests/docs/test_generate_rust_docs.sh

# Mock a rust file for testing
mkdir -p core/ganache-test/src
cat <<EOF >core/ganache-test/src/lib.rs
// file: lib.rs

/// # Purpose
/// Test function for documentation generation.
///
/// # Arguments
/// * \`input\` - A string input
///
/// # Returns
/// * \`bool\` - True or False
///
/// # Panic
/// Never
pub fn test_func(input: &str) -> bool {
    true
}
EOF

# Run the generator
if [ ! -f ./scripts/generate-rust-docs.sh ]; then
	echo "❌ Generator script not found"
	exit 1
fi

./scripts/generate-rust-docs.sh

# Check for output
if [ ! -f docs/api/rust/ganache-test.md ]; then
	echo "❌ Output file docs/api/rust/ganache-test.md not found"
	exit 1
fi

# Check content
if ! grep -q "# Purpose" docs/api/rust/ganache-test.md; then
	echo "❌ Output missing '# Purpose'"
	exit 1
fi

if ! grep -q "test_func" docs/api/rust/ganache-test.md; then
	echo "❌ Output missing function name 'test_func'"
	exit 1
fi

echo "✅ Test passed"
rm -rf core/ganache-test
rm docs/api/rust/ganache-test.md
