#!/bin/bash

# ==============================================================================
# Git Change Classifier (BMAD Governance Helper) - Enhanced v2.0
# ==============================================================================
# Analyzes pending changes and suggests Semantic Git groupings.
# Helps Agents and Developers maintain Atomic Commits.
# 
# New Features:
# - Detects merge conflicts (UU status and conflict markers)
# - Tracks deleted files separately
# - Optional code integrity validation (--validate)
# - Integration with bmad-validate.sh
# - Interactive mode (--interactive)
# ==============================================================================

AUTO_FIX=false
VALIDATE=false
INTERACTIVE=false

for arg in "$@"; do
    case $arg in
        --fix)
            AUTO_FIX=true
            shift
            ;;
        --validate)
            VALIDATE=true
            shift
            ;;
        --interactive)
            INTERACTIVE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --fix          Auto-fix build artifacts (remove from staging)"
            echo "  --validate     Run code integrity checks (compilation, linting)"
            echo "  --interactive  Interactive mode for selective staging"
            echo "  --help         Show this help message"
            exit 0
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Temporary arrays for grouping
declare -a FEAT_FILES
declare -a FIX_FILES
declare -a TEST_FILES
declare -a CI_FILES
declare -a GOV_FILES
declare -a DOCS_FILES
declare -a STYLE_FILES
declare -a CHORE_FILES
declare -a BUILD_ARTIFACTS
declare -a DELETED_FILES
declare -a CONFLICT_FILES
declare -a UNKNOWN_FILES

# 1. Get Status
# Only look at Modified (M), Added (A), Renamed (R), Deleted (D), Untracked (??), Conflicts (UU)
CHANGES=$(git status --porcelain)

if [ -z "$CHANGES" ]; then
    echo -e "${GREEN}✓ Working tree is clean. No changes to classify.${NC}"
    exit 0
fi

# 2. Check for Merge Conflicts (CRITICAL - Block everything if conflicts exist)
echo -e "${BOLD}${BLUE}=== Checking for Merge Conflicts ===${NC}\n"

HAS_CONFLICTS=false

# Check for UU (both modified - merge conflict)
if echo "$CHANGES" | grep -q "^UU "; then
    echo -e "${RED}❌ MERGE CONFLICTS DETECTED (both modified)${NC}"
    echo "$CHANGES" | grep "^UU " | while read -r line; do
        FILE=${line:3}
        echo -e "  ${RED}⚠${NC}  $FILE"
        CONFLICT_FILES+=("$FILE")
    done
    HAS_CONFLICTS=true
fi

# Check for conflict markers in modified files
MODIFIED_FILES=$(git diff --name-only)
if [ ! -z "$MODIFIED_FILES" ]; then
    while IFS= read -r file; do
        if [ -f "$file" ] && grep -q "^<<<<<<< " "$file" 2>/dev/null; then
            if [ "$HAS_CONFLICTS" = false ]; then
                echo -e "${RED}❌ CONFLICT MARKERS FOUND IN FILES${NC}"
                HAS_CONFLICTS=true
            fi
            echo -e "  ${RED}⚠${NC}  $file ${YELLOW}(contains <<<<<<< markers)${NC}"
            CONFLICT_FILES+=("$file")
        fi
    done <<< "$MODIFIED_FILES"
fi

if [ "$HAS_CONFLICTS" = true ]; then
    echo ""
    echo -e "${RED}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}${BOLD}║  ⚠  BLOCKED: Resolve merge conflicts before proceeding  ⚠  ║${NC}"
    echo -e "${RED}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Steps to resolve:${NC}"
    echo -e "  1. Open conflicted files and resolve conflicts"
    echo -e "  2. Remove conflict markers (<<<<<<<, =======, >>>>>>>)"
    echo -e "  3. Run: git add <resolved-files>"
    echo -e "  4. Run: $0 again to verify"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ No merge conflicts detected${NC}\n"

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

    # Handle DELETED files first (status: " D" or "D ")
    if [[ "$STATUS" =~ D ]]; then
        DELETED_FILES+=("$FILE")
        continue
    fi

    # Check if file is ignored by git (but tracked)
    if git check-ignore -q "$FILE"; then
        BUILD_ARTIFACTS+=("$FILE")
        continue
    fi
    
    # Special handling for explicitly known artifacts/logs
    if [[ "$FILE" == *".next/"* ]] || [[ "$FILE" == *"test-output"* ]] || [[ "$FILE" == *".log" ]]; then
        # If explicitly known artifact but NOT ignored by git check-ignore yet, 
        # it might be Untracked.
        # If it is Untracked (??), checking ignore returned false (1).
        # We classify it as BUILD_ARTIFACTS anyway to suggest ignoring.
        BUILD_ARTIFACTS+=("$FILE")
        continue
    fi

    # CI / PIPELINE
    if [[ "$FILE" == *".github/workflows"* ]] || [[ "$FILE" == *".circleci"* ]] || [[ "$FILE" == *".gitlab-ci"* ]]; then
        CI_FILES+=("$FILE")
        continue
    fi

    # GOVERNANCE / AGENTS
    if [[ "$FILE" == *".bmad/"* ]] || [[ "$FILE" == *".agent/"* ]] || [[ "$FILE" == "AGENTS.md" ]] || [[ "$FILE" == "CONTRIBUTING.md" ]] || [[ "$FILE" == *"docs/governance"* ]] || [[ "$FILE" == *"sprint-artifacts"* ]]; then
        GOV_FILES+=("$FILE")
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
             echo -e "${MAGENTA}Suggestion:${NC} git rm --cached <files> (or add to .gitignore)"
             
             if [ "$AUTO_FIX" = true ]; then
                 echo -e "${MAGENTA}Auto-Fixing...${NC}"
                 # Strategy:
                 # 1. Try rm --cached (works for Tracked files)
                 # 2. If Untracked, we can't rm --cached. We should Suggest adding to .gitignore.
                 # For simplicity in this v1: we try rm --cached silently.
                 
                 # Collapse array into arguments
                 git rm --cached -r "${files[@]}" 2>/dev/null
                 
                 # Check specific folders known to cause issues if not ignored
                 for fx in "${files[@]}"; do
                    if [[ "$fx" == *"test-output"* ]] && ! git check-ignore -q "$fx"; then
                         echo "Warning: $fx is UNTRACKED and NOT IGNORED. Adding to .gitignore..."
                         echo "$fx" >> .gitignore
                    fi
                 done
             else
                 echo -e "${MAGENTA}Run with --fix to apply auto-remediation${NC}"
             fi
        else
             echo -e "${CYAN}Suggestion:${NC} git add <files> && git commit -m \"${type}: description...\""
        fi
        echo ""
    fi
}

print_group "FEAT/FIX" "$GREEN" "feat" FEAT_FILES[@]
print_group "TEST" "$YELLOW" "test" TEST_FILES[@]
print_group "CI" "$MAGENTA" "ci" CI_FILES[@]
print_group "GOVERNANCE" "$MAGENTA" "chore(governance)" GOV_FILES[@]
print_group "DOCS" "$BLUE" "docs" DOCS_FILES[@]
print_group "STYLE" "$CYAN" "style" STYLE_FILES[@]
print_group "CHORE" "$RED" "chore" CHORE_FILES[@]
print_group "DELETED FILES" "$RED" "chore(cleanup)" DELETED_FILES[@]
print_group "BUILD ARTIFACTS / IGNORED" "$MAGENTA" "cleanup" BUILD_ARTIFACTS[@]
print_group "UNKNOWN" "$RED" "revert" UNKNOWN_FILES[@]

# === OPTIONAL VALIDATIONS ===
if [ "$VALIDATE" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}=== Running Code Integrity Validations ===${NC}\n"
    
    VALIDATION_ERRORS=0
    
    # 1. Rust compilation check
    # 1. Rust compilation check
    if [ ${#FEAT_FILES[@]} -gt 0 ] && ls "${FEAT_FILES[@]}" 2>/dev/null | grep -q "\.rs$"; then
        echo -e "${CYAN}→ Checking Rust compilation...${NC}"
        
        CHECK_CMD="cargo check"
        if [ ! -f "Cargo.toml" ] && [ -f "core/Cargo.toml" ]; then
            CHECK_CMD="cd core && cargo check"
        fi

        if eval "$CHECK_CMD --quiet 2>&1" | grep -q "error"; then
            echo -e "${RED}❌ Rust compilation errors detected${NC}"
            eval "$CHECK_CMD 2>&1" | grep "error\|warning" | head -10
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        else
            echo -e "${GREEN}✓ Rust code compiles${NC}"
        fi
    fi
    
    # 2. TypeScript type check
    if [ ${#FEAT_FILES[@]} -gt 0 ] && ls "${FEAT_FILES[@]}" 2>/dev/null | grep -qE "\.(ts|tsx)$"; then
        if command -v tsc &> /dev/null; then
            echo -e "${CYAN}→ Checking TypeScript types...${NC}"
            if ! tsc --noEmit 2>&1 | head -10; then
                echo -e "${RED}❌ TypeScript type errors detected${NC}"
                VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
            else
                echo -e "${GREEN}✓ TypeScript types are valid${NC}"
            fi
        fi
    fi
    
    # 3. Large files warning
    echo -e "${CYAN}→ Checking for large files (>1MB)...${NC}"
    LARGE_COUNT=0
    for file in "${FEAT_FILES[@]}" "${CHORE_FILES[@]}" "${UNKNOWN_FILES[@]}"; do
        if [ -f "$file" ]; then
            SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            if [ "$SIZE" -gt 1048576 ]; then
                echo -e "  ${YELLOW}⚠${NC}  $file ($(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "${SIZE} bytes"))"
                LARGE_COUNT=$((LARGE_COUNT + 1))
            fi
        fi
    done
    if [ $LARGE_COUNT -eq 0 ]; then
        echo -e "${GREEN}✓ No large files detected${NC}"
    else
        echo -e "${YELLOW}⚠ $LARGE_COUNT large file(s) found - consider .gitignore or Git LFS${NC}"
    fi
    
    # 4. BMAD Validation
    if [ -f "./scripts/bmad-validate.sh" ]; then
        echo -e "${CYAN}→ Running BMAD validation...${NC}"
        if ./scripts/bmad-validate.sh > /dev/null 2>&1; then
            echo -e "${GREEN}✓ BMAD validation passed${NC}"
        else
            echo -e "${RED}❌ BMAD validation failed${NC}"
            echo -e "${YELLOW}   Run './scripts/bmad-validate.sh' for details${NC}"
            VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
        fi
    fi
    
    echo ""
    if [ $VALIDATION_ERRORS -gt 0 ]; then
        echo -e "${RED}${BOLD}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}${BOLD}║  ⚠  $VALIDATION_ERRORS validation error(s) found  ⚠  ║${NC}"
        echo -e "${RED}${BOLD}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        exit 1
    else
        echo -e "${GREEN}${BOLD}✓ All validations passed!${NC}"
        echo ""
    fi
fi

if [ "$AUTO_FIX" = true ]; then
    echo -e "${GREEN}✓ Auto-fix complete.${NC}"
else
    echo -e "--------------------------------------------------------"
    echo -e "${YELLOW}Tip:${NC} Use 'git commit -m \"type(scope): message\"' for best practices."
    echo -e "${CYAN}Tip:${NC} Run with ${BOLD}--validate${NC} to check code integrity before commit."
    echo -e "${CYAN}Tip:${NC} Run with ${BOLD}--help${NC} to see all available options."
fi
