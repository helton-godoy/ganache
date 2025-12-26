#!/bin/bash
# scripts/code-quality/security.sh
# @FUNC: Run security scanners
# @REF: Tech-Spec-Code-Standardization - Task 7
# @SECURITY: Scans for vulnerabilities and exposed secrets

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

ensure_project_root

print_header "🔒 Executando Security Scanners"

ERRORS=0
WARNINGS=0
CHECKED=0

# ============================================================
# Secrets Detection (inline - no external tool needed)
# ============================================================
scan_secrets() {
    echo -e "\n${CYAN}[Secrets]${NC} Scanning for exposed secrets..."

    # Pattern for common secret formats
    local patterns=(
        'API[_-]?KEY.*=.*[A-Za-z0-9]{20,}'
        'SECRET.*=.*[A-Za-z0-9]{20,}'
        'PASSWORD.*=.*[^\\\$]'
        'TOKEN.*=.*[A-Za-z0-9]{20,}'
        'PRIVATE[_-]?KEY'
        'aws_access_key_id.*=.*AKIA'
        'aws_secret_access_key.*=.*[A-Za-z0-9/+]{40}'
    )

    local found_secrets=false

    for pattern in "${patterns[@]}"; do
        if grep -rn --include="*.ts" --include="*.js" --include="*.rs" --include="*.py" \
            --include="*.sh" --include="*.env" --include="*.json" \
            --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=target \
            -iE "$pattern" . 2>/dev/null | grep -v "EXAMPLE\|PLACEHOLDER\|TODO\|process.env\|env::var" | head -5; then
            found_secrets=true
        fi
    done

    if [[ "$found_secrets" == "true" ]]; then
        print_error "Possíveis secrets encontrados! Revise os resultados acima."
        ((ERRORS++)) || true
    else
        print_success "Nenhum secret hardcoded detectado"
        ((CHECKED++)) || true
    fi
}

# ============================================================
# Dependency Vulnerability Scan
# ============================================================
scan_dependencies() {
    echo -e "\n${CYAN}[Dependencies]${NC} Checking for vulnerabilities..."

    # npm audit
    if [[ -f "package-lock.json" ]]; then
        echo -e "${CYAN}  npm audit${NC}"
        if npm audit --audit-level=high 2>/dev/null; then
            print_success "npm audit passou"
            ((CHECKED++)) || true
        else
            print_warning "npm audit encontrou vulnerabilidades"
            ((WARNINGS++)) || true
        fi
    fi

    # Cargo audit (if available)
    if [[ -f "core/Cargo.lock" ]] && command_exists cargo-audit; then
        echo -e "${CYAN}  cargo audit${NC}"
        cd core
        if cargo audit 2>/dev/null; then
            print_success "cargo audit passou"
            ((CHECKED++)) || true
        else
            print_warning "cargo audit encontrou vulnerabilidades"
            ((WARNINGS++)) || true
        fi
        cd ..
    fi

    # OSV Scanner (if available)
    if command_exists osv-scanner; then
        echo -e "${CYAN}  osv-scanner${NC}"
        if osv-scanner --lockfile=package-lock.json 2>/dev/null; then
            print_success "osv-scanner passou"
            ((CHECKED++)) || true
        else
            print_warning "osv-scanner encontrou vulnerabilidades"
            ((WARNINGS++)) || true
        fi
    else
        print_info "osv-scanner não instalado (opcional)"
    fi
}

# ============================================================
# Trufflehog (if available)
# ============================================================
scan_trufflehog() {
    echo -e "\n${CYAN}[Trufflehog]${NC} Deep secrets scan..."

    if command_exists trufflehog; then
        if trufflehog filesystem . --only-verified --json 2>/dev/null | jq -e '.[]' >/dev/null 2>&1; then
            print_error "trufflehog encontrou secrets verificados!"
            ((ERRORS++)) || true
        else
            print_success "trufflehog passou"
            ((CHECKED++)) || true
        fi
    else
        print_info "trufflehog não instalado (use via Docker: docker run trufflesecurity/trufflehog)"
    fi
}

# ============================================================
# Checkov (IaC Security)
# ============================================================
scan_iac() {
    echo -e "\n${CYAN}[IaC]${NC} Infrastructure as Code security..."

    if command_exists checkov; then
        if checkov -d . --quiet --compact --skip-check CKV_GHA_7 2>/dev/null; then
            print_success "checkov passou"
            ((CHECKED++)) || true
        else
            print_warning "checkov encontrou problemas de IaC"
            ((WARNINGS++)) || true
        fi
    else
        print_info "checkov não instalado (pip install checkov)"
    fi
}

# ============================================================
# Python Security (Bandit)
# ============================================================
scan_python_security() {
    local py_files
    py_files=$(find . -name "*.py" -not -path "./node_modules/*" -not -path "./.venv/*" 2>/dev/null || true)

    if [[ -z "$py_files" ]]; then return 0; fi

    echo -e "\n${CYAN}[Python Security]${NC} bandit"

    if command_exists bandit; then
        if bandit -r . -q --exclude "./.venv,./node_modules" -ll 2>/dev/null; then
            print_success "bandit passou"
            ((CHECKED++)) || true
        else
            print_error "bandit encontrou problemas de segurança"
            ((ERRORS++)) || true
        fi
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    scan_secrets
    scan_dependencies
    scan_trufflehog
    scan_iac
    scan_python_security

    echo ""
    print_header "📊 Resultado de Segurança"

    echo "Verificados: $CHECKED"
    echo "Warnings: $WARNINGS"
    echo "Erros: $ERRORS"
    echo ""

    if [[ $ERRORS -gt 0 ]]; then
        print_error "Security scan falhou com $ERRORS erro(s) crítico(s)"
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        print_warning "Security scan passou com $WARNINGS warning(s)"
        exit 0
    else
        print_success "Security scan passou sem problemas!"
        exit 0
    fi
}

main "$@"
