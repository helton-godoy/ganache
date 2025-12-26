#!/bin/bash
# scripts/code-quality/config.sh
# @FUNC: Central configuration for Code Quality Toolkit
# @REF: Tech-Spec-Code-Standardization - Task 2

# ============================================================
# Language Toggles - Set to true/false to enable/disable
# ============================================================
ENABLE_RUST=true
ENABLE_PYTHON=true
ENABLE_JAVASCRIPT=true
ENABLE_SHELL=true
ENABLE_YAML=true
ENABLE_MARKDOWN=true
ENABLE_TOML=true

# ============================================================
# Path Exclusions - Directories to skip during lint/format
# ============================================================
EXCLUDE_DIRS=(
    "node_modules"
    "target"
    ".git"
    ".next"
    "dist"
    "build"
    ".trunk"
    ".venv"
    "__pycache__"
    ".pytest_cache"
    "coverage"
    "playwright-report"
)

# Convert to grep/find exclude patterns
get_exclude_pattern() {
    local pattern=""
    for dir in "${EXCLUDE_DIRS[@]}"; do
        pattern+=" --exclude-dir=$dir"
    done
    echo "$pattern"
}

# Convert to ripgrep glob patterns
get_rg_excludes() {
    local pattern=""
    for dir in "${EXCLUDE_DIRS[@]}"; do
        pattern+=" -g '!$dir/**'"
    done
    echo "$pattern"
}

# ============================================================
# Colors for Output
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ============================================================
# Helper Functions
# ============================================================

# Check if a command exists
command_exists() {
    command -v "$1" &>/dev/null
}

# Print success message
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Print error message
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Print warning message
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print info message
print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Print section header
print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check if running in project root
ensure_project_root() {
    if [[ ! -f "package.json" ]] && [[ ! -f "Cargo.toml" ]] && [[ ! -f "Makefile" ]]; then
        print_error "Este script deve ser executado na raiz do projeto!"
        exit 1
    fi
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
