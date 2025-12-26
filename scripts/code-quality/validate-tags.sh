#!/bin/bash
# scripts/code-quality/validate-tags.sh
# @FUNC: Validate semantic tags in codebase
# @REF: Tech-Spec-Code-Standardization - Task 16

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

ensure_project_root

print_header "🏷️  Validando Semantic Tags"

ERRORS=0
WARNINGS=0

# ============================================================
# Validate @REF tags point to valid stories
# ============================================================
validate_ref_tags() {
    echo -e "\n${CYAN}[1/4]${NC} Validando @REF tags..."

    # Find all @REF tags
    local refs
    refs=$(grep -rn "@REF:" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null || true)

    if [[ -z "$refs" ]]; then
        print_info "Nenhuma tag @REF encontrada"
        return 0
    fi

    local count
    count=$(echo "$refs" | wc -l)
    print_success "Encontradas $count tags @REF"

    # Check if referenced stories exist
    while IFS= read -r line; do
        local story_ref
        story_ref=$(echo "$line" | grep -oP "Story-\d+-\d+" || true)
        if [[ -n "$story_ref" ]]; then
            # Convert Story-X-Y to X-Y pattern for file search
            local file_pattern
            file_pattern=$(echo "$story_ref" | sed 's/Story-//')
            if ! ls docs/sprint-artifacts/*"$file_pattern"* &>/dev/null 2>&1; then
                print_warning "Story referenciada não encontrada: $story_ref"
                ((WARNINGS++)) || true
            fi
        fi
    done <<<"$refs"
}

# ============================================================
# List TODO/FIXME/BUG tags (Technical Debt Report)
# ============================================================
list_technical_debt() {
    echo -e "\n${CYAN}[2/4]${NC} Gerando relatório de dívida técnica..."

    echo ""
    echo -e "${BOLD}📋 TODOs:${NC}"
    local todos
    todos=$(grep -rn "@TODO" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | head -20 || true)
    if [[ -n "$todos" ]]; then
        echo "$todos"
        local todo_count
        todo_count=$(grep -rn "@TODO" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
            --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | wc -l || echo "0")
        print_info "Total: $todo_count TODOs"
    else
        print_success "Nenhum @TODO encontrado"
    fi

    echo ""
    echo -e "${BOLD}🔧 FIXMEs:${NC}"
    local fixmes
    fixmes=$(grep -rn "@FIXME" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | head -20 || true)
    if [[ -n "$fixmes" ]]; then
        echo "$fixmes"
        local fixme_count
        fixme_count=$(grep -rn "@FIXME" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
            --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | wc -l || echo "0")
        print_warning "Total: $fixme_count FIXMEs (requerem atenção)"
        ((WARNINGS += fixme_count)) || true
    else
        print_success "Nenhum @FIXME encontrado"
    fi

    echo ""
    echo -e "${BOLD}🐛 BUGs:${NC}"
    local bugs
    bugs=$(grep -rn "@BUG" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | head -20 || true)
    if [[ -n "$bugs" ]]; then
        echo "$bugs"
        local bug_count
        bug_count=$(grep -rn "@BUG" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
            --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | wc -l || echo "0")
        print_error "Total: $bug_count BUGs conhecidos"
        ((ERRORS += bug_count)) || true
    else
        print_success "Nenhum @BUG encontrado"
    fi

    echo ""
    echo -e "${BOLD}🔨 HACKs:${NC}"
    local hacks
    hacks=$(grep -rn "@HACK" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | head -20 || true)
    if [[ -n "$hacks" ]]; then
        echo "$hacks"
        local hack_count
        hack_count=$(grep -rn "@HACK" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
            --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | wc -l || echo "0")
        print_warning "Total: $hack_count HACKs (workarounds temporários)"
    else
        print_success "Nenhum @HACK encontrado"
    fi
}

# ============================================================
# List key functions (@FUNC tags)
# ============================================================
list_key_functions() {
    echo -e "\n${CYAN}[3/4]${NC} Listando funções-chave (@FUNC)..."

    local funcs
    funcs=$(grep -rn "@FUNC" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | head -30 || true)

    if [[ -n "$funcs" ]]; then
        echo "$funcs"
        local func_count
        func_count=$(grep -rn "@FUNC" --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
            --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null | wc -l || echo "0")
        print_success "Total: $func_count funções-chave documentadas"
    else
        print_warning "Nenhuma tag @FUNC encontrada. Considere adicionar tags às funções principais."
    fi
}

# ============================================================
# Validate tag format
# ============================================================
validate_tag_format() {
    echo -e "\n${CYAN}[4/4]${NC} Validando formato das tags..."

    # Look for malformed tags (e.g., @todo instead of @TODO)
    local lowercase_tags
    lowercase_tags=$(grep -rn "@todo\|@fixme\|@bug\|@hack\|@func\|@ref" \
        --include="*.rs" --include="*.ts" --include="*.tsx" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=target . 2>/dev/null || true)

    if [[ -n "$lowercase_tags" ]]; then
        print_warning "Tags em lowercase encontradas (devem ser UPPERCASE):"
        echo "$lowercase_tags" | head -10
        ((WARNINGS++)) || true
    else
        print_success "Todas as tags estão em formato correto (UPPERCASE)"
    fi
}

# ============================================================
# Main
# ============================================================
main() {
    validate_ref_tags
    list_technical_debt
    list_key_functions
    validate_tag_format

    echo ""
    print_header "📊 Resultado"

    echo "Warnings: $WARNINGS"
    echo "Erros: $ERRORS"
    echo ""

    if [[ $ERRORS -gt 0 ]]; then
        print_error "Validação falhou com $ERRORS erro(s)"
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        print_warning "Validação passou com $WARNINGS warning(s)"
        exit 0
    else
        print_success "Validação passou sem problemas!"
        exit 0
    fi
}

main "$@"
