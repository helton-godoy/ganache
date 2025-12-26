#!/bin/bash

# Test harness for scripts/analyze-review-readiness.sh

SCRIPT_TO_TEST="$(pwd)/scripts/analyze-review-readiness.sh"

# Setup temporary test environment
TEST_DIR="test_workspace_$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Mock git
git init
git config user.email "test@example.com"
git config user.name "Test User"

# Valid Setup
mkdir -p src
echo "function foo() {}" >src/clean.ts
git add src/clean.ts
git commit -m "feat: clean code"

# Create a file with TODO (Should Fail)
echo "function todo() { // TODO: fix this }" >src/todo.ts

# Create a Story File (Mock)
mkdir -p docs/sprint-artifacts
echo "# Story 6.1" >docs/sprint-artifacts/6-1-story.md
echo "### File List" >>docs/sprint-artifacts/6-1-story.md

# Run the script (Expect Failure due to TODO)
echo "Test 1: Check for TODOs (Expect Fail)"
if "$SCRIPT_TO_TEST" --check-todos src/todo.ts; then
	echo "FAIL: Script should have failed due to TODO"
	exit 1
else
	echo "PASS: Script correctly detected TODO"
fi

# Run the script (Expect Failure due to File List mismatch)
# src/clean.ts is NOT in File List
echo "Test 2: Check File List consistency (Expect Fail)"
# Assume we pass the story file mock
if "$SCRIPT_TO_TEST" --check-file-list docs/sprint-artifacts/6-1-story.md src/clean.ts; then
	echo "FAIL: Script should have failed due to missing file in File List"
	exit 1
else
	echo "PASS: Script correctly detected missing file"
fi

# Cleanup
cd ..
rm -rf "$TEST_DIR"
echo "All Mock Tests Passed"
