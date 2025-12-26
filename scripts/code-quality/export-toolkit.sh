#!/bin/bash
# scripts/code-quality/export-toolkit.sh
# @FUNC: Export Code Quality Toolkit to a new project
# @REF: Tech-Spec-Code-Standardization - Task 18

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

print_header "📦 Exportando Code Quality Toolkit"

# ============================================================
# Parse Arguments
# ============================================================
if [[ -z "$1" ]]; then
    echo "Uso: $0 <caminho-do-novo-projeto>"
    echo ""
    echo "Exemplo:"
    echo "  $0 /path/to/new-project"
    echo ""
    exit 1
fi

TARGET_DIR="$1"

if [[ ! -d "$TARGET_DIR" ]]; then
    print_error "Diretório não existe: $TARGET_DIR"
    echo "Crie o diretório primeiro ou forneça um caminho válido."
    exit 1
fi

# ============================================================
# Export Files
# ============================================================
export_toolkit() {
    echo -e "\n${CYAN}[1/4]${NC} Criando estrutura de diretórios..."
    mkdir -p "$TARGET_DIR/scripts/code-quality"
    mkdir -p "$TARGET_DIR/.vscode"
    mkdir -p "$TARGET_DIR/.githooks"
    print_success "Estrutura criada"

    echo -e "\n${CYAN}[2/4]${NC} Copiando scripts de code-quality..."

    # Copy all scripts except templates
    cp "$SCRIPT_DIR/config.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/install-dev-tools.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/fmt.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/fmt-check.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/lint.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/security.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/check-all.sh" "$TARGET_DIR/scripts/code-quality/"
    cp "$SCRIPT_DIR/validate-tags.sh" "$TARGET_DIR/scripts/code-quality/"

    # Make scripts executable
    chmod +x "$TARGET_DIR/scripts/code-quality/"*.sh

    print_success "Scripts copiados"

    echo -e "\n${CYAN}[3/4]${NC} Copiando AGENTS.md template..."

    # Copy AGENTS template to root and rename
    if [[ -f "$SCRIPT_DIR/templates/AGENTS-example.md" ]]; then
        cp "$SCRIPT_DIR/templates/AGENTS-example.md" "$TARGET_DIR/AGENTS.md"
        print_success "AGENTS.md criado (customize conforme necessário)"
    fi

    echo -e "\n${CYAN}[4/4]${NC} Gerando Makefile targets..."

    # Generate Makefile snippet
    cat >"$TARGET_DIR/Makefile.code-quality" <<'EOF'
# ============================================================
# Code Quality Toolkit
# Adicione estes targets ao seu Makefile existente
# ============================================================

.PHONY: fmt fmt-check lint security check-all install-dev-tools validate-tags

install-dev-tools:
	@./scripts/code-quality/install-dev-tools.sh

fmt:
	@./scripts/code-quality/fmt.sh

fmt-check:
	@./scripts/code-quality/fmt-check.sh

lint:
	@./scripts/code-quality/lint.sh

security:
	@./scripts/code-quality/security.sh

check-all:
	@./scripts/code-quality/check-all.sh

validate-tags:
	@./scripts/code-quality/validate-tags.sh

help:
	@echo "Code Quality Targets:"
	@echo "  make fmt             - Formata código"
	@echo "  make fmt-check       - Verifica formatação"
	@echo "  make lint            - Executa linters"
	@echo "  make security        - Scan de segurança"
	@echo "  make check-all       - Executa tudo"
	@echo "  make install-dev-tools - Instala ferramentas"
EOF
    print_success "Makefile.code-quality gerado"
}

# ============================================================
# Print Instructions
# ============================================================
print_instructions() {
    echo ""
    print_header "✅ Exportação Concluída!"
    echo ""
    echo "Arquivos exportados para: $TARGET_DIR"
    echo ""
    echo "📋 Próximos passos:"
    echo ""
    echo "1. Adicione os targets ao seu Makefile:"
    echo "   cat $TARGET_DIR/Makefile.code-quality >> $TARGET_DIR/Makefile"
    echo ""
    echo "2. Configure as linguagens em scripts/code-quality/config.sh:"
    echo "   Edite ENABLE_RUST, ENABLE_PYTHON, ENABLE_JAVASCRIPT, etc."
    echo ""
    echo "3. Customize o AGENTS.md para seu projeto:"
    echo "   Edite $TARGET_DIR/AGENTS.md"
    echo ""
    echo "4. Instale as ferramentas de desenvolvimento:"
    echo "   cd $TARGET_DIR && make install-dev-tools"
    echo ""
    echo "5. Verifique a instalação:"
    echo "   make check-all"
    echo ""
}

# ============================================================
# Main
# ============================================================
main() {
    export_toolkit
    print_instructions
}

main "$@"
