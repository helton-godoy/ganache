#!/bin/bash

# ============================================================================
# sync-sprint-status.sh - Sprint Status Synchronization Tool
# ============================================================================
# Synchronizes sprint-status.yaml from story .md files (source of truth)
# with multi-layer protection against errors and LLM hallucinations.
#
# Architecture:
#   Layer 1: Evidence Validation (tasks [x], Completion Notes, File List)
#   Layer 2: Immutable Audit Logs (.sync-audit.log)
#   Layer 3: Anti-Hallucination (dry-run default, explicit --apply)
#
# Usage:
#   ./scripts/sync-sprint-status.sh              # Dry-run (default)
#   ./scripts/sync-sprint-status.sh --apply      # Apply changes
#   ./scripts/sync-sprint-status.sh --force      # Bypass evidence checks (DANGEROUS)
# ============================================================================

set -uo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SPRINT_DIR="$PROJECT_ROOT/docs/sprint-artifacts"
SPRINT_STATUS="$SPRINT_DIR/sprint-status.yaml"
AUDIT_LOG="$SPRINT_DIR/.sync-audit.log"

# Mode flags
DRY_RUN=true
FORCE_MODE=false
VERBOSE=false

# Counters
SYNC_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0
CHANGES=()

# ============================================================================
# Functions
# ============================================================================

usage() {
    echo -e "${CYAN}Sprint Status Sync Tool${NC}"
    echo ""
    echo "Synchronizes sprint-status.yaml from story .md files."
    echo ""
    echo "Usage:"
    echo "  $0              # Dry-run mode (default)"
    echo "  $0 --apply      # Apply changes to YAML"
    echo "  $0 --force      # Bypass evidence validation (DANGEROUS)"
    echo "  $0 --verbose    # Show detailed output"
    echo "  $0 --help       # Show this help"
    echo ""
    echo "Source of Truth: Story .md files"
    echo "Target: sprint-status.yaml (derived cache)"
}

log_audit() {
    local story_id="$1"
    local old_status="$2"
    local new_status="$3"
    local evidence="$4"
    
    local timestamp
    timestamp=$(date -Iseconds)
    
    echo "$timestamp | $story_id | $old_status → $new_status | $evidence" >> "$AUDIT_LOG"
}

# Extract status from story MD file
get_md_status() {
    local md_file="$1"
    
    if [ ! -f "$md_file" ]; then
        echo ""
        return
    fi
    
    # Try format 1: "Status: xxx" in body (most common)
    local status
    status=$(grep -i "^Status:" "$md_file" | head -1 | sed -E 's/^Status:[[:space:]]*//i' | tr -d '[:space:]#*"')
    
    if [ -n "$status" ]; then
        echo "$status"
        return
    fi
    
    # Try format 2: "status: xxx" in YAML frontmatter
    # Frontmatter is between first --- and second ---
    status=$(sed -n '/^---$/,/^---$/p' "$md_file" | grep -E "^status:" | head -1 | awk -F': ' '{print $2}' | tr -d '[:space:]"')
    
    echo "$status"
}

# Validate evidence for "done" status
validate_evidence() {
    local md_file="$1"
    local story_id="$2"
    local evidence_issues=()
    
    if [ ! -f "$md_file" ]; then
        echo "FILE_NOT_FOUND"
        return 1
    fi
    
    # Check 1: All tasks marked [x] (no [ ] remaining)
    local pending_tasks
    pending_tasks=$(grep -c '\- \[ \]' "$md_file" 2>/dev/null || true)
    pending_tasks=${pending_tasks:-0}
    if [ "$pending_tasks" -gt 0 ] 2>/dev/null; then
        evidence_issues+=("$pending_tasks pending tasks [ ]")
    fi
    
    # Check 2: Completion Notes section not empty
    local completion_notes
    completion_notes=$(sed -n '/### Completion Notes/,/^###/p' "$md_file" 2>/dev/null | grep -cv "^###\|^$" || true)
    completion_notes=${completion_notes:-0}
    if [ "$completion_notes" -lt 1 ] 2>/dev/null; then
        # Try alternative section name
        completion_notes=$(sed -n '/### Completion Notes List/,/^###/p' "$md_file" 2>/dev/null | grep -cv "^###\|^$" || true)
        completion_notes=${completion_notes:-0}
    fi
    if [ "$completion_notes" -lt 1 ] 2>/dev/null; then
        evidence_issues+=("Completion Notes empty")
    fi
    
    # Check 3: File List has at least 1 file
    local file_list
    file_list=$(sed -n '/### File List/,/^###/p' "$md_file" 2>/dev/null | grep -c '^\s*-' || true)
    file_list=${file_list:-0}
    if [ "$file_list" -lt 1 ] 2>/dev/null; then
        evidence_issues+=("File List empty")
    fi
    
    if [ ${#evidence_issues[@]} -gt 0 ]; then
        echo "${evidence_issues[*]}"
        return 1
    fi
    
    echo "OK"
    return 0
}

# Get current status from YAML for a story
get_yaml_status() {
    local story_id="$1"
    
    if [ ! -f "$SPRINT_STATUS" ]; then
        echo ""
        return
    fi
    
    # Try format 1: "story-id: status"
    local status
    status=$(grep -E "^  ${story_id}:" "$SPRINT_STATUS" 2>/dev/null | head -1 | awk -F': ' '{print $2}' | tr -d '" ')
    
    if [ -n "$status" ]; then
        echo "$status"
        return
    fi
    
    # Try format 2: "story-id:\n    status: xxx"
    status=$(grep -A 5 "^  ${story_id}:" "$SPRINT_STATUS" 2>/dev/null | grep "status:" | head -1 | awk -F': ' '{print $2}' | tr -d '" ')
    
    if [ -n "$status" ]; then
        echo "$status"
        return
    fi
    
    # Try format 3: "- id: story-id\n      status: xxx"
    status=$(grep -A 5 "id: \"${story_id}\"" "$SPRINT_STATUS" 2>/dev/null | grep "status:" | head -1 | awk -F': ' '{print $2}' | tr -d '" ')
    
    echo "$status"
}

# Update status in YAML
update_yaml_status() {
    local story_id="$1"
    local new_status="$2"
    
    # Backup before modifying
    cp "$SPRINT_STATUS" "${SPRINT_STATUS}.bak"
    
    # Try format 1: "story-id: status" (direct key-value)
    if grep -qE "^  ${story_id}: " "$SPRINT_STATUS"; then
        sed -i "s/^  ${story_id}: .*$/  ${story_id}: ${new_status}/" "$SPRINT_STATUS"
        return 0
    fi
    
    # Try format 2: "story-id:\n    status: xxx" (nested object)
    if grep -qE "^  ${story_id}:" "$SPRINT_STATUS"; then
        # Find the line with story_id and update the status line after it
        sed -i "/^  ${story_id}:/,/^  [^ ]/{s/status: .*/status: ${new_status}/}" "$SPRINT_STATUS"
        return 0
    fi
    
    # Try format 3: "- id: story-id" (list format)
    if grep -qE "id: \"${story_id}\"" "$SPRINT_STATUS"; then
        # More complex - need to find the id line and update the status after it
        sed -i "/id: \"${story_id}\"/,/status:/{s/status: .*/status: \"${new_status}\"/}" "$SPRINT_STATUS"
        return 0
    fi
    
    echo "Warning: Could not find story $story_id in YAML, skipping update" >&2
    return 1
}

# Process a single story file
process_story() {
    local md_file="$1"
    local story_id
    story_id=$(basename "$md_file" .md)
    
    # Get statuses
    local md_status
    md_status=$(get_md_status "$md_file")
    
    local yaml_status
    yaml_status=$(get_yaml_status "$story_id")
    
    # Skip if MD has no status
    if [ -z "$md_status" ]; then
        [ "$VERBOSE" = true ] && echo -e "  ${YELLOW}SKIP${NC} $story_id: No status in MD file"
        return
    fi
    
    # Skip if statuses match
    if [ "$md_status" = "$yaml_status" ]; then
        [ "$VERBOSE" = true ] && echo -e "  ${GREEN}OK${NC}   $story_id: $md_status"
        return
    fi
    
    # Validate evidence if target status is "done"
    if [ "$md_status" = "done" ] && [ "$FORCE_MODE" != true ]; then
        local evidence
        evidence=$(validate_evidence "$md_file" "$story_id")
        
        if [ "$evidence" != "OK" ]; then
            echo -e "  ${RED}REJECT${NC} $story_id: Cannot sync to 'done' - $evidence"
            ((ERROR_COUNT++))
            return
        fi
    fi
    
    # Record the change
    CHANGES+=("$story_id: $yaml_status → $md_status")
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${CYAN}WOULD${NC} $story_id: ${yaml_status:-<empty>} → $md_status"
        ((SYNC_COUNT++))
    else
        if update_yaml_status "$story_id" "$md_status"; then
            echo -e "  ${GREEN}SYNC${NC}  $story_id: ${yaml_status:-<empty>} → $md_status"
            log_audit "$story_id" "${yaml_status:-empty}" "$md_status" "Evidence validated"
            ((SYNC_COUNT++))
        else
            echo -e "  ${RED}FAIL${NC}  $story_id: Could not update YAML"
            ((ERROR_COUNT++))
        fi
    fi
}

# ============================================================================
# Main
# ============================================================================

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --apply)
            DRY_RUN=false
            shift
            ;;
        --force)
            FORCE_MODE=true
            echo -e "${RED}⚠️  FORCE MODE: Evidence validation DISABLED${NC}"
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Header
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Sprint Status Sync Tool${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Source: ${BLUE}docs/sprint-artifacts/*.md${NC}"
echo -e "  Target: ${BLUE}docs/sprint-artifacts/sprint-status.yaml${NC}"
echo -e "  Mode:   $([ "$DRY_RUN" = true ] && echo "${YELLOW}DRY-RUN${NC}" || echo "${GREEN}APPLY${NC}")"
echo ""

# Check prerequisites
if [ ! -f "$SPRINT_STATUS" ]; then
    echo -e "${RED}Error: sprint-status.yaml not found at $SPRINT_STATUS${NC}"
    exit 1
fi

if [ ! -d "$SPRINT_DIR" ]; then
    echo -e "${RED}Error: Sprint artifacts directory not found at $SPRINT_DIR${NC}"
    exit 1
fi

# Process all story files
echo -e "${BLUE}Processing stories...${NC}"
echo ""

for md_file in "$SPRINT_DIR"/*.md; do
    # Skip non-story files
    filename=$(basename "$md_file")
    
    # Only process story files (format: X-Y-name.md)
    if [[ ! "$filename" =~ ^[0-9]+-[0-9]+-.+\.md$ ]]; then
        continue
    fi
    
    process_story "$md_file"
done

# Summary
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Summary"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "  Changes to apply: ${CYAN}$SYNC_COUNT${NC}"
else
    echo -e "  Changes applied:  ${GREEN}$SYNC_COUNT${NC}"
fi
echo -e "  Errors/Rejected:  ${RED}$ERROR_COUNT${NC}"
echo ""

if [ "$DRY_RUN" = true ] && [ "$SYNC_COUNT" -gt 0 ]; then
    echo -e "  ${YELLOW}ℹ️  This was a dry-run. To apply changes, run:${NC}"
    echo -e "     ${BLUE}$0 --apply${NC}"
    echo ""
fi

if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "  ${RED}⚠️  Some stories were rejected due to missing evidence.${NC}"
    echo -e "     Fix the issues above or use --force to bypass (not recommended)."
    echo ""
    exit 1
fi

exit 0
