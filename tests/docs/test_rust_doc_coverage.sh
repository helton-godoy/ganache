#!/bin/bash
# tests/docs/test_rust_doc_coverage.sh
# Verifies that public Rust items have documentation

EXIT_CODE=0
echo "🔍 Verificando cobertura de documentação Rust..."

# Find all rust files in core/
FILES=$(find core -name "*.rs" -not -path "*/target/*" -not -path "*/tests/*")

for file in $FILES; do
	# Simple check: Does pub fn/struct/enum have /// above it?
	# This is a heuristic.

	# We look for lines starting with 'pub ' and check if previous line had ///
	# Using awk for state

	MISSING=$(awk '
    /^\s*\/\/\// { doc=1; next }
    /^\s*#\[/ { next } # ignore attributes
    /^\s*pub (fn|struct|enum|trait|const|type)/ {
        if (doc != 1) {
            print FILENAME ":" FNR ": " $0
        }
        doc=0
    }
    !/^\s*\/\/\// && !/^\s*#\[/ { doc=0 }
    ' "$file")

	if [ ! -z "$MISSING" ]; then
		echo "⚠️  Missing docs in $file:"
		echo "$MISSING" | head -n 5
		# STRICT MODE: Fail on missing docs to enforce documentation standards
		# Set EXIT_CODE=0 temporarily during legacy codebase transition if needed
		EXIT_CODE=1
	fi
done

if [ $EXIT_CODE -eq 0 ]; then
	echo "✅ Rust documentation coverage OK"
else
	echo "❌ Rust documentation gaps found"
fi

exit $EXIT_CODE
