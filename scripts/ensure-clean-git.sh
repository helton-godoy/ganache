#!/bin/bash

# ==============================================================================
# BMAD Git Gatekeeper
# ==============================================================================
# Ensures that no pending changes exist in the git working directory.
# This script MUST be run before marking any task as "done".
# ==============================================================================

# 1. Check for staged/unstaged changes
if [ -n "$(git status --porcelain)" ]; then
	echo -e "\033[0;31m[ERROR] Git directory is not clean. You have pending changes.\033[0m"
	echo -e "You MUST commit your changes before proceeding."
	git status --short
	exit 1
fi

# 2. Check for untracked files (that are not ignored)
# Note: git status --porcelain already covers untracked files with '??'
# but we explicitly check ls-files for robustness if needed.

echo -e "\033[0;32m[SUCCESS] Git directory is clean.\033[0m"
exit 0
