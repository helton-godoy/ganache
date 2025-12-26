#!/bin/bash
# scripts/generate-rust-docs.sh

# Ensure python script is executable/available
PYTHON_SCRIPT="$(dirname "$0")/generate-rust-docs.py"

if [ ! -f "$PYTHON_SCRIPT" ]; then
	echo "❌ Python generator script not found at $PYTHON_SCRIPT"
	exit 1
fi

python3 "$PYTHON_SCRIPT"
