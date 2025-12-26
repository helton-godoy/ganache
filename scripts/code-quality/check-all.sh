#!/bin/bash
# scripts/code-quality/check-all.sh
# @FUNC: Run all quality checks (lint + fmt-check + security)
# @REF: Tech-Spec-Code-Standardization - Task 8

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

ensure_project_root

print_header "🛡️  Code Quality - Verificação Completa"

TOTAL_ERRORS=0

# ============================================================
# Run Format Check
# ============================================================
run_format_check() {
    echo ""
    if "$SCRIPT_DIR/fmt-check.sh"; then
        print_success "Format check passou"
    else
        print_error "Format check falhou"
        ((TOTAL_ERRORS++)) || true
    fi
}

# ============================================================
# Run Linters
# ============================================================
run_lint() {
    echo ""
    if "$SCRIPT_DIR/lint.sh"; then
        print_success "Linting passou"
    else
        print_error "Linting falhou"
        ((TOTAL_ERRORS++)) || true
    fi
}

# ============================================================
# Run Security Scan
# ============================================================
run_security() {
    echo ""
    if "$SCRIPT_DIR/security.sh"; then
        print_success "Security scan passou"
    else
        print_error "Security scan falhou"
        ((TOTAL_ERRORS++)) || true
    fi
}

# ============================================================
# Run BMAD Validation (if exists)
# ============================================================
run_bmad_validation() {
    if [[ -f "scripts/bmad-validate.sh" ]]; then
        echo ""
        print_header "📋 BMAD Validation"
        if ./scripts/bmad-validate.sh; then
            print_success "BMAD validation passou"
        else
            print_warning "BMAD validation falhou (não crítico)"
        fi
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    local start_time
    start_time=$(date +%s)
    
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
    run_format_check
    run_lint
    
    if [[ "$skip_security" != "true" ]]; then
        run_security
    else
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
