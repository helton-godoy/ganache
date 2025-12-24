#!/bin/bash

# tests/scripts/test_suggestion_engine.sh
# Test suite for suggestion engine

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SUGGESTION_ENGINE="$PROJECT_ROOT/scripts/suggest-fixes.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

function test_case() {
    local name="$1"
    local expected_exit="$2"
    shift 2
    local cmd=("$@")
    
    echo -e "${YELLOW}TEST: $name${NC}"
    
    set +e
    output=$("${cmd[@]}" 2>&1)
    actual_exit=$?
    set -e
    
    if [ "$actual_exit" -eq "$expected_exit" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL (expected exit $expected_exit, got $actual_exit)${NC}"
        echo "Output: $output"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Setup: Create temporary test files
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Test 1: Suggest fix for missing error handling
cat > "$TEMP_DIR/no_error_handling.rs" << 'EOF'
fn read_file(path: &str) -> String {
    std::fs::read_to_string(path).unwrap()
}
EOF

test_case "Detect missing error handling in Rust" 0 \
    "$SUGGESTION_ENGINE" --check-error-handling "$TEMP_DIR/no_error_handling.rs"

# Test 2: Suggest fix for TODO/FIXME
cat > "$TEMP_DIR/with_todo.ts" << 'EOF'
// TODO: implement validation
export function validateUser(user: User) {
    return true;
}
EOF

test_case "Detect TODO and suggest fix" 0 \
    "$SUGGESTION_ENGINE" --check-todos "$TEMP_DIR/with_todo.ts"

# Test 3: Suggest fix for missing tests
cat > "$TEMP_DIR/untested_function.rs" << 'EOF'
pub fn calculate_quota(size: u64) -> u64 {
    size * 90 / 100
}
EOF

test_case "Detect missing tests" 0 \
    "$SUGGESTION_ENGINE" --check-test-coverage "$TEMP_DIR/untested_function.rs"

# Test 4: Suggest fix for security issues (hardcoded secrets)
cat > "$TEMP_DIR/hardcoded_secret.ts" << 'EOF'
const API_KEY = "sk-1234567890abcdef";
export function callAPI() {
    fetch("https://api.example.com", {
        headers: { "Authorization": `Bearer ${API_KEY}` }
    });
}
EOF

test_case "Detect hardcoded secrets" 0 \
    "$SUGGESTION_ENGINE" --check-security "$TEMP_DIR/hardcoded_secret.ts"

# Test 5: No issues - should pass
cat > "$TEMP_DIR/clean_code.rs" << 'EOF'
/// Calculate 90% quota for a given size
pub fn calculate_quota(size: u64) -> Result<u64, String> {
    if size == 0 {
        return Err("Size cannot be zero".to_string());
    }
    Ok(size * 90 / 100)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_calculate_quota() {
        assert_eq!(calculate_quota(100).unwrap(), 90);
    }
}
EOF

test_case "Clean code with no issues" 0 \
    "$SUGGESTION_ENGINE" --check-all "$TEMP_DIR/clean_code.rs"

# Summary
echo "========================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo "========================================"

if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
fi

exit 0
