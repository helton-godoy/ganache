#!/bin/bash

# scripts/suggest-fixes.sh
# Suggestion Engine for Common Code Issues
# Part of Story 6.1: Optimize Adversarial Review Process

# Exit codes:
# 0: Suggestions provided (or no issues found)
# 1: Error in execution

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

CHECK_ERROR_HANDLING=false
CHECK_TODOS=false
CHECK_TEST_COVERAGE=false
CHECK_SECURITY=false
CHECK_ALL=false
FILE_ARG=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --check-error-handling)
            CHECK_ERROR_HANDLING=true
            FILE_ARG="$2"
            shift 2
            ;;
        --check-todos)
            CHECK_TODOS=true
            FILE_ARG="$2"
            shift 2
            ;;
        --check-test-coverage)
            CHECK_TEST_COVERAGE=true
            FILE_ARG="$2"
            shift 2
            ;;
        --check-security)
            CHECK_SECURITY=true
            FILE_ARG="$2"
            shift 2
            ;;
        --check-all)
            CHECK_ALL=true
            FILE_ARG="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS] <file>"
            echo ""
            echo "Options:"
            echo "  --check-error-handling <file>   Check for missing error handling"
            echo "  --check-todos <file>            Check for TODO/FIXME and suggest fixes"
            echo "  --check-test-coverage <file>    Check if functions have tests"
            echo "  --check-security <file>         Check for security issues"
            echo "  --check-all <file>              Run all checks"
            echo "  --help                          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Run with --help for usage information"
            exit 1
            ;;
    esac
done

# Validate file exists
if [ ! -f "$FILE_ARG" ]; then
    echo -e "${RED}Error: File $FILE_ARG not found${NC}"
    exit 1
fi

SUGGESTIONS_FOUND=false

# Function: Check for missing error handling (Rust)
function check_error_handling() {
    local file="$1"
    
    if [[ "$file" != *.rs ]]; then
        return 0
    fi
    
    echo -e "${BLUE}=== Checking Error Handling ===${NC}"
    
    # Look for .unwrap() calls
    if grep -n "\.unwrap()" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Found .unwrap() calls (potential panic risk)${NC}"
        grep -n "\.unwrap()" "$file" | while read -r line; do
            echo -e "  Line: $line"
        done
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Replace .unwrap() with proper error handling:"
        echo -e "   ${GREEN}// Instead of:${NC}"
        echo -e "   let data = read_file(path).unwrap();"
        echo ""
        echo -e "   ${GREEN}// Use:${NC}"
        echo -e "   let data = read_file(path).map_err(|e| format!(\"Failed to read: {}\", e))?;"
        echo ""
        SUGGESTIONS_FOUND=true
    fi
    
    # Look for .expect() calls
    if grep -n "\.expect(" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Found .expect() calls${NC}"
        grep -n "\.expect(" "$file" | head -3
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Consider using Result<T, E> for better error propagation"
        echo ""
        SUGGESTIONS_FOUND=true
    fi
    
    if [ "$SUGGESTIONS_FOUND" = false ]; then
        echo -e "${GREEN}✓ No error handling issues found${NC}"
    fi
}

# Function: Check for TODOs/FIXMEs
function check_todos() {
    local file="$1"
    
    echo -e "${BLUE}=== Checking for TODOs/FIXMEs ===${NC}"
    
    if grep -nEi "TODO|FIXME" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Found TODO/FIXME comments${NC}"
        grep -nEi "TODO|FIXME" "$file" | while read -r line; do
            echo -e "  $line"
        done
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Before code review:"
        echo -e "   1. Implement the TODO or convert to a tracked issue"
        echo -e "   2. If it's a known limitation, document it in Dev Notes"
        echo -e "   3. Remove the TODO comment to pass adversarial review"
        echo ""
        SUGGESTIONS_FOUND=true
    else
        echo -e "${GREEN}✓ No TODOs found${NC}"
    fi
}

# Function: Check test coverage
function check_test_coverage() {
    local file="$1"
    local basename=$(basename "$file")
    local dirname=$(dirname "$file")
    
    echo -e "${BLUE}=== Checking Test Coverage ===${NC}"
    
    # For Rust files
    if [[ "$file" == *.rs ]]; then
        # Check if file has #[cfg(test)] module
        if grep -q "#\[cfg(test)\]" "$file"; then
            echo -e "${GREEN}✓ Test module found in file${NC}"
            return 0
        fi
        
        # Check for corresponding test file
        local test_file="${dirname}/../tests/${basename}"
        if [ -f "$test_file" ]; then
            echo -e "${GREEN}✓ Corresponding test file exists: $test_file${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⚠ No tests found for this file${NC}"
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Add tests using one of these approaches:"
        echo -e "   ${GREEN}1. Inline tests (recommended for unit tests):${NC}"
        echo -e "   #[cfg(test)]"
        echo -e "   mod tests {"
        echo -e "       use super::*;"
        echo -e "       "
        echo -e "       #[test]"
        echo -e "       fn test_function_name() {"
        echo -e "           assert_eq!(function_name(input), expected);"
        echo -e "       }"
        echo -e "   }"
        echo ""
        echo -e "   ${GREEN}2. Separate test file:${NC} tests/${basename}"
        echo ""
        SUGGESTIONS_FOUND=true
    fi
    
    # For TypeScript files
    if [[ "$file" == *.ts ]] || [[ "$file" == *.tsx ]]; then
        local test_file="${file%.ts*}.spec.ts"
        if [ -f "$test_file" ]; then
            echo -e "${GREEN}✓ Test file exists: $test_file${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⚠ No test file found${NC}"
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Create test file: ${basename%.ts*}.spec.ts"
        echo -e "   ${GREEN}Example:${NC}"
        echo -e "   import { describe, it, expect } from 'vitest';"
        echo -e "   import { functionName } from './${basename%.ts*}';"
        echo -e "   "
        echo -e "   describe('functionName', () => {"
        echo -e "       it('should handle valid input', () => {"
        echo -e "           expect(functionName(input)).toBe(expected);"
        echo -e "       });"
        echo -e "   });"
        echo ""
        SUGGESTIONS_FOUND=true
    fi
}

# Function: Check security issues
function check_security() {
    local file="$1"
    
    echo -e "${BLUE}=== Checking Security Issues ===${NC}"
    
    # Check for hardcoded secrets/API keys
    if grep -nE "(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*[\"']" "$file" > /dev/null 2>&1; then
        echo -e "${RED}⚠ Potential hardcoded secrets detected${NC}"
        grep -nE "(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*[\"']" "$file" | head -3
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Use environment variables:"
        echo -e "   ${GREEN}// Instead of:${NC}"
        echo -e "   const API_KEY = \"sk-1234567890\";"
        echo ""
        echo -e "   ${GREEN}// Use:${NC}"
        echo -e "   const API_KEY = process.env.API_KEY || throw new Error('API_KEY not set');"
        echo ""
        SUGGESTIONS_FOUND=true
    fi
    
    # Check for SQL injection risks (basic check)
    if grep -nE "query.*\+.*|execute.*\+.*" "$file" > /dev/null 2>&1; then
        echo -e "${RED}⚠ Potential SQL injection risk (string concatenation in queries)${NC}"
        echo ""
        echo -e "${CYAN}💡 Suggestion:${NC} Use parameterized queries"
        echo ""
        SUGGESTIONS_FOUND=true
    fi
    
    if [ "$SUGGESTIONS_FOUND" = false ]; then
        echo -e "${GREEN}✓ No obvious security issues found${NC}"
    fi
}

# Execute checks
if [ "$CHECK_ERROR_HANDLING" = true ] || [ "$CHECK_ALL" = true ]; then
    check_error_handling "$FILE_ARG"
fi

if [ "$CHECK_TODOS" = true ] || [ "$CHECK_ALL" = true ]; then
    check_todos "$FILE_ARG"
fi

if [ "$CHECK_TEST_COVERAGE" = true ] || [ "$CHECK_ALL" = true ]; then
    check_test_coverage "$FILE_ARG"
fi

if [ "$CHECK_SECURITY" = true ] || [ "$CHECK_ALL" = true ]; then
    check_security "$FILE_ARG"
fi

echo ""
if [ "$SUGGESTIONS_FOUND" = true ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Suggestions provided. Address these before code review.${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All checks passed! Code looks good for review.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

exit 0
