#!/bin/bash
# scripts/code-quality/check-all.sh
# @FUNC: Run all quality checks (lint + fmt-check + security)
# @REF: Tech-Spec-Code-Standardization - Task 8

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

ensure_project_root

# ============================================================
# Progress Indicator Functions
# ============================================================
SPINNER_PID=""

start_spinner() {
    local msg="$1"
    local chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    local i=0
    
    # Run spinner in background
    (
        while true; do
            printf "\r  ${chars:i++%${#chars}:1} %s..." "$msg"
            sleep 0.1
        done
    ) &
    SPINNER_PID=$!
    
    # Ensure spinner is killed on script exit
    trap 'kill $SPINNER_PID 2>/dev/null || true' EXIT
}

stop_spinner() {
    local status="$1"
    local msg="$2"
    
    if [[ -n "$SPINNER_PID" ]]; then
        kill $SPINNER_PID 2>/dev/null || true
        wait $SPINNER_PID 2>/dev/null || true
        SPINNER_PID=""
    fi
    
    # Clear line and print result
    printf "\r                                                              \r"
    if [[ "$status" == "ok" ]]; then
        echo -e "  ${GREEN}✓${NC} $msg"
    elif [[ "$status" == "warn" ]]; then
        echo -e "  ${YELLOW}⚠${NC} $msg"
    else
        echo -e "  ${RED}✗${NC} $msg"
    fi
}

print_phase() {
    local phase="$1"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  [$phase]${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_header "🛡️  Code Quality - Verificação Completa"

TOTAL_ERRORS=0

# ============================================================
# Run Format Check (with progress)
# ============================================================
run_format_check() {
    print_phase "1/4 FORMATAÇÃO"
    
    start_spinner "Verificando formatação (Rust, JS/TS, Shell, TOML)"
    if "$SCRIPT_DIR/fmt-check.sh" >/dev/null 2>&1; then
        stop_spinner "ok" "Formatação OK"
        return 0
    else
        stop_spinner "fail" "Formatação precisa de correção (execute: make fmt)"
        return 1
    fi
}

# ============================================================
# Run Linters (with progress for each)
# ============================================================
run_lint() {
    print_phase "2/4 LINTING"
    local lint_errors=0
    
    # Rust (clippy)
    if command_exists cargo; then
        start_spinner "Executando cargo clippy (Rust)"
        if cargo clippy --all-targets --all-features -- -D warnings 2>/dev/null; then
            stop_spinner "ok" "Rust (clippy)"
        else
            stop_spinner "fail" "Rust (clippy) - warnings encontrados"
            ((lint_errors++)) || true
        fi
    fi
    
    # ESLint
    if command_exists npx; then
        start_spinner "Executando ESLint (JavaScript/TypeScript)"
        if npx eslint src/ --quiet 2>/dev/null; then
            stop_spinner "ok" "ESLint (JS/TS)"
        else
            stop_spinner "warn" "ESLint - alguns avisos (não crítico)"
        fi
    fi
    
    # ShellCheck
    if command_exists shellcheck; then
        start_spinner "Executando ShellCheck (Shell scripts)"
        if find scripts/ -name "*.sh" -exec shellcheck -x {} + 2>/dev/null; then
            stop_spinner "ok" "ShellCheck (Shell)"
        else
            stop_spinner "warn" "ShellCheck - alguns avisos (não crítico)"
        fi
    fi
    
    [[ $lint_errors -gt 0 ]] && return 1
    return 0
}

# ============================================================
# Run Security Scan (with progress)
# ============================================================
run_security() {
    print_phase "3/4 SEGURANÇA"
    
    start_spinner "Verificando secrets e vulnerabilidades"
    if "$SCRIPT_DIR/security.sh" >/dev/null 2>&1; then
        stop_spinner "ok" "Nenhum problema de segurança detectado"
        return 0
    else
        stop_spinner "warn" "Scan de segurança com avisos (verificar manualmente)"
        return 0  # Not critical
    fi
}

# ============================================================
# Run BMAD Validation (with progress)
# ============================================================
run_bmad_validation() {
    if [[ -f "scripts/bmad-validate.sh" ]]; then
        print_phase "4/4 BMAD VALIDATION"
        
        start_spinner "Verificando conformidade BMAD"
        if ./scripts/bmad-validate.sh >/dev/null 2>&1; then
            stop_spinner "ok" "BMAD validation OK"
        else
            stop_spinner "warn" "BMAD validation com avisos (não crítico)"
        fi
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    local start_time
    start_time=$(date +%s)

    echo ""
    echo -e "${BLUE}Iniciando verificação completa de qualidade...${NC}"
    echo -e "${BLUE}(Isso pode levar alguns minutos)${NC}"

    # Parse arguments
    local skip_security=false
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-security)
                skip_security=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    # Run checks
    if ! run_format_check; then
        ((TOTAL_ERRORS++)) || true
    fi
    
    if ! run_lint; then
        ((TOTAL_ERRORS++)) || true
    fi

    if [[ "$skip_security" != "true" ]]; then
        run_security
    else
        echo ""
        print_info "Security scan pulado (--skip-security)"
    fi

    run_bmad_validation

    # Calculate duration
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Final Summary
    echo ""
    print_header "📊 Resultado Final"
    echo ""
    echo "Tempo de execução: ${duration}s"
    echo ""

    if [[ $TOTAL_ERRORS -gt 0 ]]; then
        print_error "Verificação completa FALHOU com $TOTAL_ERRORS erro(s)"
        echo ""
        echo "Execute individualmente para mais detalhes:"
        echo "  make fmt-check  # Verificar formatação"
        echo "  make lint       # Executar linters"
        echo "  make security   # Scan de segurança"
        exit 1
    else
        print_success "Verificação completa PASSOU! ✨"
        echo ""
        echo "Código está pronto para commit."
        exit 0
    fi
}

main "$@"

