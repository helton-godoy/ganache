#!/bin/bash
# scripts/generate-react-docs.sh

# Ensure node script is available
NODE_SCRIPT="$(dirname "$0")/generate-react-docs.js"

if [ ! -f "$NODE_SCRIPT" ]; then
	echo "❌ Node generator script not found at $NODE_SCRIPT"
	exit 1
fi

node "$NODE_SCRIPT"
