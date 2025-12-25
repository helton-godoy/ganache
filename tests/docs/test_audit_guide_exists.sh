#!/bin/bash
# Test to verify the existence and basic structure of the Audit Troubleshooting Guide

GUIDE_FILE="docs/audit-troubleshooting-guide.md"

if [ ! -f "$GUIDE_FILE" ]; then
    echo "FAIL: File $GUIDE_FILE does not exist."
    exit 1
fi

# Check for required sections with proper Markdown heading format (## Section)
REQUIRED_SECTIONS=("Introdução" "Diagnóstico" "Soluções" "FAQ" "Referências")

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -qE "^##\s+.*$section" "$GUIDE_FILE"; then
        echo "FAIL: Missing proper Markdown section '## $section' in $GUIDE_FILE"
        exit 1
    fi
done

# Validate presence of critical diagnostic commands
CRITICAL_COMMANDS=("systemctl status ganache-core" "journalctl" "curl.*api/v1/security/events")

for cmd in "${CRITICAL_COMMANDS[@]}"; do
    if ! grep -qE "$cmd" "$GUIDE_FILE"; then
        echo "FAIL: Missing critical command '$cmd' in $GUIDE_FILE"
        exit 1
    fi
done

# Validate code blocks are properly formatted (opening and closing backticks)
OPENING_BLOCKS=$(grep -c '^```' "$GUIDE_FILE")
CLOSING_BLOCKS=$(grep -c '^```' "$GUIDE_FILE")

if [ "$OPENING_BLOCKS" -eq 0 ]; then
    echo "FAIL: No code blocks found in $GUIDE_FILE"
    exit 1
fi

# Check if code blocks are balanced (each ``` opens and closes)
if [ $((OPENING_BLOCKS % 2)) -ne 0 ]; then
    echo "FAIL: Unbalanced code blocks (found $OPENING_BLOCKS markers, should be even) in $GUIDE_FILE"
    exit 1
fi

# Validate "Como Validar Este Guia" section exists
if ! grep -qE "^##\s+Como Validar Este Guia" "$GUIDE_FILE"; then
    echo "FAIL: Missing validation section 'Como Validar Este Guia' in $GUIDE_FILE"
    exit 1
fi

echo "PASS: Audit Troubleshooting Guide exists, has required sections, commands, and proper structure."
exit 0
