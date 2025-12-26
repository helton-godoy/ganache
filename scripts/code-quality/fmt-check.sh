#!/bin/bash
# scripts/code-quality/fmt-check.sh
# @FUNC: Check code formatting without modifying files (for CI)
# @REF: Tech-Spec-Code-Standardization - Task 5

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

ensure_project_root

print_header "🔍 Verificando Formatação (sem modificar)"

ERRORS=0
CHECKED=0

# ============================================================
# Rust Check
# ============================================================
check_rust() {
    if [[ "$ENABLE_RUST" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[Rust]${NC} cargo fmt --check"

    if command_exists cargo && [[ -d "core" ]]; then
        cd core
        if cargo fmt --all -- --check 2>/dev/null; then
            print_success "Rust está formatado corretamente"
            ((CHECKED++)) || true
        else
            print_error "Rust precisa de formatação (execute: make fmt)"
            ((ERRORS++)) || true
        fi
        cd ..
    fi
}

# ============================================================
# Python Check
# ============================================================
check_python() {
    if [[ "$ENABLE_PYTHON" != "true" ]]; then return 0; fi

    local py_files
    py_files=$(find . -name "*.py" -not -path "./node_modules/*" -not -path "./.venv/*" 2>/dev/null || true)

    if [[ -z "$py_files" ]]; then
        return 0
    fi

    echo -e "\n${CYAN}[Python]${NC} black --check"

    if command_exists black; then
        if black . --check --quiet 2>/dev/null; then
            print_success "Python está formatado corretamente"
            ((CHECKED++)) || true
        else
            print_error "Python precisa de formatação (execute: make fmt)"
            ((ERRORS++)) || true
        fi
    fi
}

# ============================================================
# JavaScript/TypeScript Check
# ============================================================
check_javascript() {
    if [[ "$ENABLE_JAVASCRIPT" != "true" ]]; then return 0; fi

    if [[ ! -f "package.json" ]]; then return 0; fi

    echo -e "\n${CYAN}[JavaScript/TypeScript]${NC} prettier --check"

    if command_exists npx; then
        if npx prettier --check "**/*.{js,jsx,ts,tsx,json,css,scss}" \
            --ignore-path .gitignore \
            --log-level error 2>/dev/null; then
            print_success "JS/TS está formatado corretamente"
            ((CHECKED++)) || true
        else
            print_error "JS/TS precisa de formatação (execute: make fmt)"
            ((ERRORS++)) || true
        fi
    fi
}

# ============================================================
# Shell Check
# ============================================================
check_shell() {
    if [[ "$ENABLE_SHELL" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[Shell]${NC} shfmt -d (diff mode)"

    if command_exists shfmt; then
        local has_diff=false

        for dir in scripts .githooks; do
            if [[ -d "$dir" ]]; then
                if ! shfmt -d -i 4 -ci "$dir" 2>/dev/null; then
                    has_diff=true
                fi
            fi
        done

        if [[ "$has_diff" == "true" ]]; then
            print_error "Shell scripts precisam de formatação (execute: make fmt)"
            ((ERRORS++)) || true
        else
            print_success "Shell scripts estão formatados corretamente"
            ((CHECKED++)) || true
        fi
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    check_rust
    check_python
    check_javascript
    check_shell

    echo ""
    print_header "📊 Resultado"

    if [[ $ERRORS -gt 0 ]]; then
        print_error "Verificação falhou! $ERRORS linguagem(s) precisam de formatação"
        echo ""
        echo "Execute 'make fmt' para corrigir automaticamente."
        exit 1
    else
        print_success "Verificação passou! $CHECKED linguagem(s) verificada(s)"
        exit 0
    fi
}

main "$@"
