#!/bin/bash
# Test to verify the existence and basic structure of the Audit Troubleshooting Guide

GUIDE_FILE="docs/audit-troubleshooting-guide.md"

if [ ! -f "$GUIDE_FILE" ]; then
    echo "FAIL: File $GUIDE_FILE does not exist."
    exit 1
fi

# Check for required sections
REQUIRED_SECTIONS=("Introdução" "Diagnóstico" "Soluções" "FAQ" "Referências")

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$GUIDE_FILE"; then
        echo "FAIL: Missing section '$section' in $GUIDE_FILE"
        exit 1
    fi
done

echo "PASS: Audit Troubleshooting Guide exists and has required sections."
exit 0
