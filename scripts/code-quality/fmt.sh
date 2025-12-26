#!/bin/bash
# scripts/code-quality/fmt.sh
# @FUNC: Auto-format code in all supported languages
# @REF: Tech-Spec-Code-Standardization - Task 4

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

ensure_project_root

print_header "🎨 Auto-Formatando Código"

MODIFIED_COUNT=0
ERRORS=0

# ============================================================
# Rust Formatting
# ============================================================
format_rust() {
    if [[ "$ENABLE_RUST" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[Rust]${NC} cargo fmt"

    if command_exists cargo; then
        if [[ -d "core" ]]; then
            cd core
            if cargo fmt --all 2>/dev/null; then
                print_success "Rust formatado"
                ((MODIFIED_COUNT++)) || true
            else
                print_error "Erro ao formatar Rust"
                ((ERRORS++)) || true
            fi
            cd ..
        fi
    else
        print_warning "cargo não encontrado, pulando Rust"
    fi
}

# ============================================================
# Python Formatting
# ============================================================
format_python() {
    if [[ "$ENABLE_PYTHON" != "true" ]]; then return 0; fi

    # Find Python files
    local py_files
    py_files=$(find . -name "*.py" -not -path "./node_modules/*" -not -path "./.venv/*" -not -path "./__pycache__/*" 2>/dev/null || true)

    if [[ -z "$py_files" ]]; then
        print_info "Nenhum arquivo Python encontrado"
        return 0
    fi

    echo -e "\n${CYAN}[Python]${NC} black + isort"

    if command_exists black; then
        if black . --quiet 2>/dev/null; then
            print_success "black aplicado"
            ((MODIFIED_COUNT++)) || true
        else
            print_warning "black encontrou problemas"
        fi
    else
        print_warning "black não encontrado"
    fi

    if command_exists isort; then
        if isort . --quiet 2>/dev/null; then
            print_success "isort aplicado"
        else
            print_warning "isort encontrou problemas"
        fi
    else
        print_warning "isort não encontrado"
    fi
}

# ============================================================
# JavaScript/TypeScript Formatting
# ============================================================
format_javascript() {
    if [[ "$ENABLE_JAVASCRIPT" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[JavaScript/TypeScript]${NC} prettier"

    if command_exists npx && [[ -f "package.json" ]]; then
        # Use project's prettier if available, otherwise global
        if npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,scss,md}" \
            --ignore-path .gitignore \
            --log-level error 2>/dev/null; then
            print_success "prettier aplicado"
            ((MODIFIED_COUNT++)) || true
        else
            print_warning "prettier encontrou problemas ou não está instalado"
        fi
    else
        print_warning "npm/npx não encontrado ou não é projeto Node"
    fi
}

# ============================================================
# Shell Script Formatting
# ============================================================
format_shell() {
    if [[ "$ENABLE_SHELL" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[Shell]${NC} shfmt"

    if command_exists shfmt; then
        # Find shell scripts
        local scripts_found=false

        for dir in scripts .githooks; do
            if [[ -d "$dir" ]]; then
                scripts_found=true
                if shfmt -w -i 4 -ci "$dir" 2>/dev/null; then
                    print_success "shfmt aplicado em $dir/"
                    ((MODIFIED_COUNT++)) || true
                else
                    print_warning "shfmt encontrou problemas em $dir/"
                fi
            fi
        done

        if [[ "$scripts_found" == "false" ]]; then
            print_info "Nenhum diretório de scripts encontrado"
        fi
    else
        print_warning "shfmt não encontrado"
    fi
}

# ============================================================
# TOML Formatting
# ============================================================
format_toml() {
    if [[ "$ENABLE_TOML" != "true" ]]; then return 0; fi

    echo -e "\n${CYAN}[TOML]${NC} taplo"

    if command_exists taplo; then
        if taplo fmt 2>/dev/null; then
            print_success "taplo aplicado"
            ((MODIFIED_COUNT++)) || true
        else
            print_warning "taplo encontrou problemas"
        fi
    else
        print_warning "taplo não encontrado (cargo install taplo-cli)"
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    format_rust
    format_python
    format_javascript
    format_shell
    format_toml

    echo ""
    print_header "📊 Resultado"

    if [[ $ERRORS -gt 0 ]]; then
        print_error "Formatação concluída com $ERRORS erro(s)"
        exit 1
    else
        print_success "Formatação concluída! $MODIFIED_COUNT linguagem(s) processada(s)"
        exit 0
    fi
}

main "$@"
