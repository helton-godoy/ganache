#!/bin/bash

# Script de instalação automática dos servidores MCP para Windsurf (SEM DOCKER)
# Compatible with Debian/Deepin/Ubuntu systems
# Author: Cascade AI Assistant
# Date: $(date +%Y-%m-%d)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for system packages
check_user() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. This is required for system package installation."
    else
        log_info "Some operations require superuser. You may be prompted for password."
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/deepin-version ]]; then
        OS="deepin"
        log_info "Detected Deepin system"
    elif [[ -f /etc/debian_version ]]; then
        OS="debian"
        log_info "Detected Debian-based system"
    elif [[ -f /etc/ubuntu-release ]] || grep -q "Ubuntu" /etc/os-release; then
        OS="ubuntu"
        log_info "Detected Ubuntu system"
    else
        log_error "Unsupported OS. This script is designed for Debian/Deepin/Ubuntu systems."
        exit 1
    fi
}

# Update system packages
update_system() {
    log_info "Updating system packages..."
    sudo apt update
    sudo apt list --upgradable
    #  apt upgrade -y
    log_success "System packages updated"
}

# Install system dependencies
install_system_deps() {
    log_info "Installing system dependencies..."
    
    # Base packages common to all systems (SEM DOCKER)
    local base_packages=(
        "curl"
        "wget"
        "git"
        "python3"
        "python3-pip"
        "python3-venv"
        "ca-certificates"
        "gnupg"
        "lsb-release"
        "python3-full"
        "pipx"
    )
    
    # Update package list first
    sudo apt update
    
    for package in "${base_packages[@]}"; do
        # Check if package is already installed
        if dpkg -l | grep -q "^ii  $package "; then
            log_info "$package already installed, skipping..."
        else
            log_info "Installing $package..."
            sudo apt install -y "$package" || log_warning "Failed to install $package"
        fi
    done
    
    log_success "System dependencies installed (no Docker required)"
}

# Install Node.js via NVM (recommended)
install_nodejs() {
    log_info "Installing Node.js via NVM..."
    
    # Determine NVM directory
    local nvm_dir=""
    if [[ -d "$HOME/.nvm" ]]; then
        nvm_dir="$HOME/.nvm"
    elif [[ -d "$HOME/.config/nvm" ]]; then
        nvm_dir="$HOME/.config/nvm"
    fi
    
    # Check if NVM is already installed
    if [[ -n "$nvm_dir" ]]; then
        log_info "NVM already installed, checking Node.js..."
        export NVM_DIR="$nvm_dir"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Always install latest LTS to ensure we have the latest stable version
        log_info "Installing/updating to latest Node.js LTS..."
        nvm install --lts
        nvm use --lts
        nvm alias default 'lts/*'
    else
 R
        south dakota
        log_info "Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
        
        # Load NVM (check both possible locations)
        if [[ -d "$HOME/.nvm" ]]; then
            export NVM_DIR="$HOME/.nvm"
        else
            export NVM_DIR="$HOME/.config/nvm"
        fi
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Install latest LTS Node.js
        nvm install --lts
        nvm use --lts
        nvm alias default 'lts/*'
    fi
    
    log_success "Node.js $(node --version) installed"
}

# Setup Go environment
setup_go() {
    log_info "Setting up Go environment..."
    
    # Clean up PATH first to avoid duplicates
    PATH=$(echo "$PATH" | tr ':' '\n' | awk '!seen[$0]++ && !/^$/ {print}' | paste -sd':')
    
    # Add Go bin to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
        echo 'export PATH="$PATH:$HOME/go/bin"' >> "$HOME/.bashrc"
        export PATH="$PATH:$HOME/go/bin"
        log_info "Added ~/go/bin to PATH"
    fi
    
    log_success "Go environment setup completed"
}

# Setup pipx
setup_pipx() {
    log_info "Setting up pipx..."
    
    # Check if pipx is already in PATH
    if command -v pipx >/dev/null 2>&1; then
        log_info "pipx already available in PATH"
    else
        # Add pipx to bashrc if not already there (without ensurepath to avoid loops)
        if ! grep -q "/home/helton/.local/bin" "$HOME/.bashrc"; then
            echo '# Only add pipx path if not already present' >> "$HOME/.bashrc"
            echo 'if [[ ":$PATH:" != *":/home/helton/.local/bin:"* ]]; then' >> "$HOME/.bashrc"
            echo '    export PATH="$PATH:/home/helton/.local/bin"' >> "$HOME/.bashrc"
            echo 'fi' >> "$HOME/.bashrc"
        fi
    fi
    
    log_success "pipx setup completed"
}

# Install MCP servers via pipx
install_pipx_servers() {
    log_info "Installing MCP servers via pipx..."
    
    # Shell MCP server with PowerShell support
    local servers=(
        "shell-mcp-server"
    )
    
    if [[ ${#servers[@]} -eq 0 ]]; then
        log_info "No pipx servers to install"
    else
        for server in "${servers[@]}"; do
            log_info "Installing $server..."
            if pipx list | grep -q "$server"; then
                log_info "$server already installed, updating to latest version..."
                pipx upgrade "$server" --force
            else
                log_info "Installing latest version of $server..."
                pipx install "$server" --force
            fi
        done
    fi
    
    log_success "pipx MCP servers installed"
}

# Install MCP servers via npm
install_npm_servers() {
    log_info "Installing MCP servers via npm..."
    
    # Ensure npm is using latest registry and cache
    npm cache clean --force
    
    local servers=(
        "@modelcontextprotocol/server-filesystem"
        "@modelcontextprotocol/server-memory"
        "@modelcontextprotocol/server-sequential-thinking"
        "mcp-remote"
        "@cyanheads/git-mcp-server"
        "gitingest-mcp"
        "@mizchi/lsmcp"
        "mcp-server-code-runner"
        "bash-mcp"
    )
    
    for server in "${servers[@]}"; do
        log_info "Installing $server..."
        # Check if package is already installed globally
        if npm list -g --depth=0 "$server" >/dev/null 2>&1; then
            log_info "$server already installed, updating to latest version..."
            npm install -g "$server@latest" || log_warning "Failed to update $server"
        else
            log_info "Installing latest version of $server..."
            npm install -g "$server@latest" || log_warning "Failed to install $server (may be optional)"
        fi
    done
    
    log_success "npm MCP servers installed"
}

# Setup Windsurf MCP configuration
setup_windsurf_config() {
    log_info "Setting up Windsurf MCP configuration..."
    
    local config_dir="$HOME/.codeium/windsurf"
    local config_file="$config_dir/mcp_config.json"
    
    # Create config directory if it doesn't exist
    mkdir -p "$config_dir"
    
    # Backup existing config
    if [[ -f "$config_file" ]]; then
        cp "$config_file" "$config_file.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "Existing config backed up"
    fi
    
    # Create new configuration (SEM DOCKER)
    cat > "$config_file" << 'EOF'
{
  "mcpServers": {
    "exa": {
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.exa.ai/mcp"
      ],
      "command": "npx",
      "disabled": false,
      "env": {}
    },
    "filesystem": {
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        ""
      ],
      "command": "npx",
      "disabled": false,
      "env": {}
    },
    "git-mcp-server": {
      "command": "git-mcp-server",
      "disabled": false,
      "env": {}
    },
    "gitingest-mcp": {
      "args": [
        "-y",
        "gitingest-mcp"
      ],
      "command": "npx",
      "disabled": false,
      "env": {}
    },
    "memory": {
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "command": "npx",
      "disabled": false,
      "env": {
        "MEMORY_FILE_PATH": "/home/$USER/"
      }
    },
    "sequential-thinking": {
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "command": "npx",
      "disabled": false,
      "env": {}
    },
    "lsmcp": {
      "command": "lsmcp",
      "args": ["-p", "tsgo"],
      "disabled": true,
      "env": {}
    },
    "code-runner": {
      "command": "mcp-server-code-runner",
      "disabled": false,
      "env": {}
    },
    "bash-mcp": {
      "command": "npx",
      "args": ["bash-mcp"],
      "disabled": false,
      "env": {}
    },
    "shell-mcp-server": {
      "command": "shell-mcp-server",
      "args": ["/home/$USER", "/tmp"],
      "disabled": false,
      "env": {}
    }
  }
}
EOF
    
    log_success "Windsurf MCP configuration created (no Docker required)"
    log_warning "Remember to update your GitHub token in the configuration file"
}

# Verify installations (SEM DOCKER)
verify_installations() {
    log_info "Verifying installations..."
    
    # Check Node.js
    if node --version >/dev/null 2>&1; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js not working properly"
    fi
    
    # Check npm/npx
    if npm --version >/dev/null 2>&1; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm not working properly"
    fi
    
    # Check pipx
    if pipx --version >/dev/null 2>&1; then
        log_success "pipx: $(pipx --version)"
    else
        log_error "pipx not working properly"
    fi
    
    # Check MCP servers
    if command -v shell-mcp-server >/dev/null 2>&1; then
        log_success "shell-mcp-server: Installed and available"
    else
        log_error "shell-mcp-server not found in PATH"
    fi
    
    log_success "Verification completed (Docker-free installation)"
}

# Print final instructions
print_instructions() {
    log_success "Docker-free MCP installation completed successfully!"
    echo
    log_info "Next steps:"
    echo "1. Update your GitHub token in: $HOME/.codeium/windsurf/mcp_config.json"
    echo "2. Restart Windsurf to load the new MCP servers"
    echo "3. Reload your shell: source ~/.bashrc"
    echo
    log_info "Useful commands:"
    echo "- Update pipx servers: pipx upgrade-all"
    echo "- Update npm servers: npm update -g"
    echo "- Check MCP servers: pipx list"
    echo "- All MCP servers run natively without Docker!"
    echo
}

# Main execution
main() {
    log_info "Starting Docker-free MCP servers installation..."
    echo
    
    check_user
    detect_os
    
    # Install system dependencies
    install_system_deps
    
    # Setup Go environment
    setup_go
    
    # Setup NVM and Node.js
    install_nodejs
    
    # Setup pipx
    setup_pipx
    
    # Install MCP servers via pipx
    install_pipx_servers
    
    # Install MCP servers via npm
    install_npm_servers
    
    setup_windsurf_config
    verify_installations
    print_instructions
    
    log_success "All MCP servers have been installed and configured without Docker!"
}

# Run main function
main "$@"
