#!/bin/bash
# scripts/code-quality/lint.sh
# @FUNC: Run all linters for enabled languages
# @REF: Tech-Spec-Code-Standardization - Task 6

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

ensure_project_root

print_header "🔎 Executando Linters"

ERRORS=0
WARNINGS=0
CHECKED=0

# ============================================================
# Rust Linting
# ============================================================
lint_rust() {
    if [[ "$ENABLE_RUST" != "true" ]]; then return 0; fi

    if ! command_exists cargo || [[ ! -d "core" ]]; then
        return 0
    fi

    echo -e "\n${CYAN}[Rust]${NC} cargo clippy"

    cd core
    if cargo clippy --all-targets --all-features -- -D warnings 2>&1; then
        print_success "clippy passou"
        ((CHECKED++)) || true
    else
        print_error "clippy encontrou problemas"
        ((ERRORS++)) || true
    fi
    cd ..
}

# ============================================================
# Python Linting
# ============================================================
lint_python() {
    if [[ "$ENABLE_PYTHON" != "true" ]]; then return 0; fi

    local py_files
    py_files=$(find . -name "*.py" -not -path "./node_modules/*" -not -path "./.venv/*" 2>/dev/null || true)

    if [[ -z "$py_files" ]]; then
        return 0
    fi

    echo -e "\n${CYAN}[Python]${NC} ruff + bandit"

    # Ruff (fast linter)
    if command_exists ruff; then
        if ruff check . --quiet 2>/dev/null; then
            print_success "ruff passou"
            ((CHECKED++)) || true
        else
            print_error "ruff encontrou problemas"
            ((ERRORS++)) || true
        fi
    else
        print_warning "ruff não encontrado"
    fi

    # Bandit (security linter)
    if command_exists bandit; then
        if bandit -r . -q --exclude "./.venv,./node_modules" 2>/dev/null; then
            print_success "bandit passou (segurança)"
            ((CHECKED++)) || true
        else
            print_warning "bandit encontrou problemas de segurança"
            ((WARNINGS++)) || true
        fi
    fi
}

# ============================================================
# JavaScript/TypeScript Linting
# ============================================================
lint_javascript() {
    if [[ "$ENABLE_JAVASCRIPT" != "true" ]]; then return 0; fi

    if [[ ! -f "package.json" ]]; then return 0; fi

    echo -e "\n${CYAN}[JavaScript/TypeScript]${NC} eslint"

    if command_exists npx; then
        # Use npm run lint if available
        if npm run lint 2>/dev/null; then
            print_success "eslint passou"
            ((CHECKED++)) || true
        else
            print_error "eslint encontrou problemas"
            ((ERRORS++)) || true
        fi
    fi

    # Type checking
    echo -e "\n${CYAN}[TypeScript]${NC} type-check"
    if npm run type-check 2>/dev/null; then
        print_success "TypeScript type-check passou"
        ((CHECKED++)) || true
    else
        print_error "TypeScript type-check falhou"
        ((ERRORS++)) || true
    fi
}

# ============================================================
# Shell Linting
# ============================================================
lint_shell() {
    if [[ "$ENABLE_SHELL" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[Shell]${NC} shellcheck"

    if command_exists shellcheck; then
        local has_errors=false

        # Find all .sh files
        while IFS= read -r -d '' script; do
            if ! shellcheck -x "$script" 2>/dev/null; then
                has_errors=true
            fi
        done < <(find scripts .githooks -name "*.sh" -o -type f -executable 2>/dev/null | tr '\n' '\0')

        if [[ "$has_errors" == "true" ]]; then
            print_error "shellcheck encontrou problemas"
            ((ERRORS++)) || true
        else
            print_success "shellcheck passou"
            ((CHECKED++)) || true
        fi
    else
        print_warning "shellcheck não encontrado"
    fi
}

# ============================================================
# YAML Linting
# ============================================================
lint_yaml() {
    if [[ "$ENABLE_YAML" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[YAML]${NC} yamllint"

    if command_exists yamllint; then
        if yamllint . -d relaxed --no-warnings 2>/dev/null; then
            print_success "yamllint passou"
            ((CHECKED++)) || true
        else
            print_warning "yamllint encontrou problemas (não crítico)"
            ((WARNINGS++)) || true
        fi
    fi
}

# ============================================================
# Markdown Linting
# ============================================================
lint_markdown() {
    if [[ "$ENABLE_MARKDOWN" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[Markdown]${NC} markdownlint"

    if command_exists npx; then
        if npx markdownlint-cli2 "**/*.md" --ignore node_modules 2>/dev/null; then
            print_success "markdownlint passou"
            ((CHECKED++)) || true
        else
            print_warning "markdownlint encontrou problemas (não crítico)"
            ((WARNINGS++)) || true
        fi
    fi
}

# ============================================================
# GitHub Actions Linting
# ============================================================
lint_actions() {
    if [[ ! -d ".github/workflows" ]]; then return 0; fi

    echo -e "\n${CYAN}[GitHub Actions]${NC} actionlint"

    if command_exists actionlint; then
        if actionlint 2>/dev/null; then
            print_success "actionlint passou"
            ((CHECKED++)) || true
        else
            print_warning "actionlint encontrou problemas"
            ((WARNINGS++)) || true
        fi
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    lint_rust
    lint_python
    lint_javascript
    lint_shell
    lint_yaml
    lint_markdown
    lint_actions

    echo ""
    print_header "📊 Resultado"

    echo "Verificados: $CHECKED"
    echo "Warnings: $WARNINGS"
    echo "Erros: $ERRORS"
    echo ""

    if [[ $ERRORS -gt 0 ]]; then
        print_error "Linting falhou com $ERRORS erro(s)"
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        print_warning "Linting passou com $WARNINGS warning(s)"
        exit 0
    else
        print_success "Linting passou sem problemas!"
        exit 0
    fi
}

main "$@"
