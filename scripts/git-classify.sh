#!/bin/bash

# ==============================================================================
# Git Change Classifier (BMAD Governance Helper)
# ==============================================================================
# Analyzes pending changes and suggests Semantic Git groupings.
# Helps Agents and Developers maintain Atomic Commits.
# ==============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Temporary arrays for grouping
declare -a FEAT_FILES
declare -a FIX_FILES
declare -a TEST_FILES
declare -a DOCS_FILES
declare -a STYLE_FILES
declare -a CHORE_FILES
declare -a BUILD_ARTIFACTS
declare -a UNKNOWN_FILES

# 1. Get Status
# Only look at Modified (M), Added (A), Renamed (R), Deleted (D), Untracked (??)
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    echo -e "${GREEN}✓ Working tree is clean. No changes to classify.${NC}"
    exit 0
fi

echo -e "${BLUE}=== Git Change Classification Report ===${NC}\n"

# 2. Iterate and Classify
while IFS= read -r line; do
    # Extract status and filename
    # Porcelain format: "XY PATH" e.g. "M  src/index.ts" or "?? newfile.txt"
    STATUS=${line:0:2}
    FILE=${line:3}
    
    # Remove quotes if present
    FILE="${FILE%\"}"
    FILE="${FILE#\"}"

    # Check if file is ignored by git (but tracked)
    # git check-ignore returns 0 if ignored, 1 if not
    if git check-ignore -q "$FILE"; then
        BUILD_ARTIFACTS+=("$FILE")
        continue
    fi
    
    # Special handling for explicitly known artifacts/logs that might not be in .gitignore yet or are confusing
    if [[ "$FILE" == *".next/"* ]] || [[ "$FILE" == *"test-output"* ]] || [[ "$FILE" == *".log" ]]; then
        BUILD_ARTIFACTS+=("$FILE")
        continue
    fi

    # CRITICAL GOVERNANCE DOCS
    if [[ "$FILE" == "project-context.md" ]] || [[ "$FILE" == *".agent/"* ]] || [[ "$FILE" == "AGENTS.md" ]] || [[ "$FILE" == "CONTRIBUTING.md" ]] || [[ "$FILE" == *"docs/governance"* ]] || [[ "$FILE" == *"sprint-artifacts"* ]]; then
        DOCS_FILES+=("$FILE")
        continue
    fi

    # TESTS (Priority match)
    if [[ "$FILE" == *"tests/"* ]] || [[ "$FILE" == *".spec.ts" ]] || [[ "$FILE" == *".test.ts" ]] || [[ "$FILE" == *"_test.rs" ]]; then
        TEST_FILES+=("$FILE")
        continue
    fi

    # DOCUMENTATION
    if [[ "$FILE" == *"docs/"* ]] || [[ "$FILE" == *".md" ]] || [[ "$FILE" == "LICENSE" ]]; then
        DOCS_FILES+=("$FILE")
        continue
    fi

    # CONFIG / SCRIPTS / CHORE
    if [[ "$FILE" == *"scripts/"* ]] || [[ "$FILE" == *".githooks/"* ]] || [[ "$FILE" == *".json" ]] || [[ "$FILE" == *".yaml" ]] || [[ "$FILE" == *".yml" ]] || [[ "$FILE" == *".toml" ]] || [[ "$FILE" == *".config."* ]] || [[ "$FILE" == ".gitignore" ]]; then
        CHORE_FILES+=("$FILE")
        continue
    fi

    # STYLES
    if [[ "$FILE" == *".css" ]] || [[ "$FILE" == *".scss" ]]; then
        STYLE_FILES+=("$FILE")
        continue
    fi

    # SOURCE CODE (FEAT/FIX)
    if [[ "$FILE" == *"src/"* ]] || [[ "$FILE" == *"core/"* ]] || [[ "$FILE" == *"ganache-lib/"* ]] || [[ "$FILE" == *"ganache-api/"* ]]; then
        FEAT_FILES+=("$FILE")
        continue
    fi

    # Fallback
    UNKNOWN_FILES+=("$FILE")

done <<< "$CHANGES"

# 3. Print Groups and Suggestions

function print_group() {
    local label=$1
    local color=$2
    local type=$3
    local files=("${!4}") # array passed by name

    if [ ${#files[@]} -gt 0 ]; then
        echo -e "${color}[${label}] ${#files[@]} file(s)${NC}"
        # Limit output for large sets
        if [ ${#files[@]} -gt 10 ]; then
             for ((i=0; i<5; i++)); do echo -e "  ${files[$i]}"; done
             echo -e "  ... and $((${#files[@]} - 5)) more"
        else
             for f in "${files[@]}"; do echo -e "  $f"; done
        fi
        
        if [ "$label" == "BUILD ARTIFACTS / IGNORED" ]; then
             echo -e "${MAGENTA}Suggestion:${NC} git rm --cached ${files[*]:0:10} ... (or add to .gitignore)"
             echo -e "${MAGENTA}Auto-Fix:${NC} git rm --cached -r .next/ test-output* 2>/dev/null"
        else
             echo -e "${CYAN}Suggestion:${NC} git add <files> && git commit -m \"${type}: description...\""
        fi
        echo ""
    fi
}

print_group "FEAT/FIX" "$GREEN" "feat" FEAT_FILES[@]
print_group "TEST" "$YELLOW" "test" TEST_FILES[@]
print_group "DOCS" "$BLUE" "docs" DOCS_FILES[@]
print_group "STYLE" "$CYAN" "style" STYLE_FILES[@]
print_group "CHORE" "$RED" "chore" CHORE_FILES[@]
print_group "BUILD ARTIFACTS / IGNORED" "$MAGENTA" "cleanup" BUILD_ARTIFACTS[@]
print_group "UNKNOWN" "$RED" "revert" UNKNOWN_FILES[@]

echo -e "--------------------------------------------------------"
echo -e "${YELLOW}Tip:${NC} Use 'git commit -m \"type(scope): message\"' for best practices."
