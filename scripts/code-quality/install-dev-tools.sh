#!/bin/bash
# scripts/code-quality/install-dev-tools.sh
# @FUNC: Idempotent installation script for development tools
# @REF: Tech-Spec-Code-Standardization - Task 3
# @SECURITY: Requires sudo for apt installations

set -e

# Load config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

print_header "🛠️  Code Quality Toolkit - Instalador de Ferramentas"
echo "Target: Debian/Ubuntu"
echo ""

# ============================================================
# Check if running as appropriate user
# ============================================================
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Executando como root. Algumas ferramentas serão instaladas globalmente."
    else
        print_info "Executando como usuário normal. Pode ser necessário sudo para apt."
    fi
}

# ============================================================
# Track installation results
# ============================================================
declare -A INSTALLED_TOOLS
declare -A SKIPPED_TOOLS
declare -A FAILED_TOOLS

mark_installed() {
    INSTALLED_TOOLS["$1"]="$2"
}

mark_skipped() {
    SKIPPED_TOOLS["$1"]="já instalado"
}

mark_failed() {
    FAILED_TOOLS["$1"]="$2"
}

# ============================================================
# APT Packages
# ============================================================
install_apt_packages() {
    print_header "📦 Instalando pacotes APT"

    local packages=(
        "shellcheck"
        "curl"
        "git"
        "jq"
    )

    # Check if shfmt is available in apt (Debian 12+)
    if apt-cache show shfmt &>/dev/null 2>&1; then
        packages+=("shfmt")
    fi

    local to_install=()

    for pkg in "${packages[@]}"; do
        if dpkg -l | grep -q "^ii  $pkg "; then
            mark_skipped "$pkg"
        else
            to_install+=("$pkg")
        fi
    done

    if [[ ${#to_install[@]} -gt 0 ]]; then
        print_info "Instalando: ${to_install[*]}"
        if sudo apt-get update -qq && sudo apt-get install -y -qq "${to_install[@]}"; then
            for pkg in "${to_install[@]}"; do
                mark_installed "$pkg" "apt"
            done
        else
            for pkg in "${to_install[@]}"; do
                mark_failed "$pkg" "apt install failed"
            done
        fi
    else
        print_success "Todos os pacotes APT já estão instalados"
    fi
}

# ============================================================
# Python/Pip Packages
# ============================================================
install_pip_packages() {
    print_header "🐍 Instalando ferramentas Python"

    if ! command_exists pip3; then
        print_warning "pip3 não encontrado. Instalando python3-pip..."
        sudo apt-get install -y -qq python3-pip python3-venv
    fi

    local packages=(
        "black"
        "isort"
        "ruff"
        "bandit"
        "yamllint"
    )

    for pkg in "${packages[@]}"; do
        if command_exists "$pkg"; then
            mark_skipped "$pkg"
        else
            print_info "Instalando $pkg..."
            if pip3 install --user -q "$pkg" 2>/dev/null || pip3 install -q "$pkg" 2>/dev/null; then
                mark_installed "$pkg" "pip"
            else
                mark_failed "$pkg" "pip install failed"
            fi
        fi
    done
}

# ============================================================
# NPM Global Packages
# ============================================================
install_npm_packages() {
    print_header "📦 Instalando ferramentas Node.js"

    if ! command_exists npm; then
        print_error "npm não encontrado! Por favor instale Node.js primeiro."
        return 1
    fi

    local packages=(
        "prettier"
        "eslint"
        "markdownlint-cli2"
        "svgo"
        "typescript"
        "typescript-language-server"
        "pyright"
        "bash-language-server"
        "yaml-language-server"
        "vscode-langservers-extracted"
    )

    for pkg in "${packages[@]}"; do
        # Check if package is installed globally
        if npm list -g "$pkg" &>/dev/null 2>&1; then
            mark_skipped "$pkg"
        else
            print_info "Instalando $pkg..."
            if npm install -g "$pkg" --silent 2>/dev/null; then
                mark_installed "$pkg" "npm"
            else
                mark_failed "$pkg" "npm install failed"
            fi
        fi
    done
}

# ============================================================
# Rust Components
# ============================================================
install_rust_components() {
    print_header "🦀 Instalando componentes Rust"

    if ! command_exists rustup; then
        print_warning "rustup não encontrado. Pulando componentes Rust."
        print_info "Para instalar: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        return 0
    fi

    local components=(
        "rustfmt"
        "clippy"
        "rust-analyzer"
    )

    for comp in "${components[@]}"; do
        if rustup component list --installed | grep -q "$comp"; then
            mark_skipped "$comp"
        else
            print_info "Instalando $comp..."
            if rustup component add "$comp" 2>/dev/null; then
                mark_installed "$comp" "rustup"
            else
                mark_failed "$comp" "rustup add failed"
            fi
        fi
    done

    # Install taplo for TOML formatting
    if command_exists cargo; then
        if command_exists taplo; then
            mark_skipped "taplo"
        else
            print_info "Instalando taplo (TOML formatter)..."
            if cargo install taplo-cli --quiet 2>/dev/null; then
                mark_installed "taplo" "cargo"
            else
                mark_failed "taplo" "cargo install failed"
            fi
        fi
    fi
}

# ============================================================
# Binary Downloads (Go tools without Go dependency)
# ============================================================
install_binaries() {
    print_header "📥 Instalando binários standalone"

    local bin_dir="$HOME/.local/bin"
    mkdir -p "$bin_dir"

    # Ensure bin_dir is in PATH
    if [[ ":$PATH:" != *":$bin_dir:"* ]]; then
        print_warning "$bin_dir não está no PATH. Adicione ao seu .bashrc/.zshrc"
    fi

    # actionlint
    if command_exists actionlint; then
        mark_skipped "actionlint"
    else
        print_info "Instalando actionlint..."
        local actionlint_url="https://github.com/rhysd/actionlint/releases/latest/download/actionlint_linux_amd64.tar.gz"
        if curl -sL "$actionlint_url" | tar xz -C "$bin_dir" actionlint 2>/dev/null; then
            chmod +x "$bin_dir/actionlint"
            mark_installed "actionlint" "binary"
        else
            mark_failed "actionlint" "download failed"
        fi
    fi

    # shfmt (if not installed via apt)
    if ! command_exists shfmt; then
        print_info "Instalando shfmt..."
        local shfmt_url="https://github.com/mvdan/sh/releases/latest/download/shfmt_linux_amd64"
        if curl -sL "$shfmt_url" -o "$bin_dir/shfmt" 2>/dev/null; then
            chmod +x "$bin_dir/shfmt"
            mark_installed "shfmt" "binary"
        else
            mark_failed "shfmt" "download failed"
        fi
    fi

    # marksman (Markdown LSP)
    if command_exists marksman; then
        mark_skipped "marksman"
    else
        print_info "Instalando marksman (Markdown LSP)..."
        local marksman_url="https://github.com/artempyanykh/marksman/releases/latest/download/marksman-linux-x64"
        if curl -sL "$marksman_url" -o "$bin_dir/marksman" 2>/dev/null; then
            chmod +x "$bin_dir/marksman"
            mark_installed "marksman" "binary"
        else
            # Marksman is optional, don't fail
            print_warning "marksman não pôde ser instalado (opcional)"
        fi
    fi
}

# ============================================================
# Security Scanners (Optional)
# ============================================================
install_security_tools() {
    print_header "🔒 Instalando scanners de segurança (opcional)"

    # checkov (Python)
    if command_exists checkov; then
        mark_skipped "checkov"
    else
        print_info "Instalando checkov (IaC security scanner)..."
        if pip3 install --user -q checkov 2>/dev/null || pip3 install -q checkov 2>/dev/null; then
            mark_installed "checkov" "pip"
        else
            print_warning "checkov não pôde ser instalado (opcional)"
        fi
    fi

    # osv-scanner and trufflehog require Go or Docker
    # We'll skip these and suggest Docker alternatives
    print_info "Para osv-scanner e trufflehog, recomendamos usar via Docker:"
    print_info "  docker run -it ghcr.io/google/osv-scanner:latest"
    print_info "  docker run -it trufflesecurity/trufflehog:latest"
}

# ============================================================
# Print Summary
# ============================================================
print_summary() {
    print_header "📊 Resumo da Instalação"

    echo ""
    if [[ ${#INSTALLED_TOOLS[@]} -gt 0 ]]; then
        echo -e "${GREEN}✓ Instalados (${#INSTALLED_TOOLS[@]}):${NC}"
        for tool in "${!INSTALLED_TOOLS[@]}"; do
            echo -e "  - $tool (via ${INSTALLED_TOOLS[$tool]})"
        done
    fi

    echo ""
    if [[ ${#SKIPPED_TOOLS[@]} -gt 0 ]]; then
        echo -e "${CYAN}○ Já existentes (${#SKIPPED_TOOLS[@]}):${NC}"
        for tool in "${!SKIPPED_TOOLS[@]}"; do
            echo -e "  - $tool"
        done
    fi

    echo ""
    if [[ ${#FAILED_TOOLS[@]} -gt 0 ]]; then
        echo -e "${RED}✗ Falhas (${#FAILED_TOOLS[@]}):${NC}"
        for tool in "${!FAILED_TOOLS[@]}"; do
            echo -e "  - $tool: ${FAILED_TOOLS[$tool]}"
        done
    fi

    echo ""
    print_header "🎉 Instalação Concluída!"
    echo ""
    echo "Próximos passos:"
    echo "  1. Recarregue seu shell: source ~/.bashrc"
    echo "  2. Verifique as ferramentas: make check-all"
    echo "  3. Instale os git hooks: ./scripts/install-githooks.sh"
    echo ""
}

# ============================================================
# Main
# ============================================================
main() {
    check_permissions

    install_apt_packages
    install_pip_packages
    install_npm_packages
    install_rust_components
    install_binaries
    install_security_tools

    print_summary
}

main "$@"
