---
title: "Instruções de Setup"
category: "development"
project_type: "web+backend"
created: "2025-12-13"
updated: "2025-12-13"
author: "BMAD Generator"
status: "approved"
version: "1.0.0"
tags: ["bmad", "documentation", "auto-generated"]
related_docs: ["docs/index.md", "docs/project-overview-ganache.md"]
bmad_compliance: true
---

# Ganache Enterprise NAS - Setup Instructions

**Generated:** 2025-12-13  
**Compliance BMAD:** ✅  

## Environment Setup

Este documento fornece instruções detalhadas para configurar o ambiente de desenvolvimento do Ganache Enterprise NAS.

## System Requirements

### Minimum Requirements

- **OS:** Ubuntu 20.04+ / Debian 12+ / macOS 12+ / Windows 10+
- **RAM:** 8GB (16GB recomendado)
- **Storage:** 50GB espaço livre
- **Network:** Conexão estável para downloads

### Recommended Requirements

- **OS:** Ubuntu 22.04 LTS / Debian 12
- **RAM:** 32GB
- **Storage:** 200GB SSD
- **CPU:** 8 cores

## Prerequisites Installation

### 1. Git

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# macOS
brew install git

# Windows
# Download from https://git-scm.com/
```

### 2. Node.js (v18+)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installation
node --version  # Should be v18.x.x
npm --version
```

### 3. Rust (v1.70+)

```bash
# Install Rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install additional components
rustup component add rustfmt clippy

# Verify installation
rustc --version  # Should be 1.70+
cargo --version
```

### 4. Docker (Optional)

```bash
# Ubuntu/Debian
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER

# macOS
# Download Docker Desktop from https://www.docker.com/

# Windows
# Download Docker Desktop from https://www.docker.com/
```

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ganache
```

### 2. Frontend Setup (ganache/ui)

```bash
cd ganache/ui

# Install dependencies
npm install
# or
pnpm install

# Verify installation
npm run type-check
npm run lint

# Start development server
npm run dev
```

### 3. Backend Setup (ganache)

```bash
cd ganache

# Build project
cargo build

# Verify installation
cargo test
cargo clippy

# Run development server
cargo run
```

### 4. Documentation Setup

```bash
cd ganache/docs

# Validate BMAD compliance
../scripts/bmad-validate.sh

# Generate documentation
../scripts/bmad-generate.sh
```

## Development Environment

### VS Code Configuration

Recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "rust-lang.rust-analyzer",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-vscode.remote-containers"
  ]
}
```

### Editor Settings (.vscode/settings.json)

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "rust-analyzer.cargo.features": "all",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/target": true,
    "**/dist": true
  }
}
```

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

## Verification Steps

### 1. Frontend Verification

```bash
cd ganache/ui

# Start development server
npm run dev

# Should open browser at http://localhost:5173
# Dashboard should load without errors
```

### 2. Backend Verification

```bash
cd ganache

# Start API server
cargo run

# Should start on http://localhost:8080
# Check health endpoint: curl http://localhost:8080/health
```

### 3. BMAD Validation

```bash
cd ganache

# Run BMAD validation
./scripts/bmad-validate.sh

# Should output: BMAD COMPLIANCE: 100% TOTAL
```

## Troubleshooting

### Common Issues

#### Node.js Issues

```bash
# Clear npm cache
npm cache clean --force

# Reset npm configuration
npm config delete prefix
npm install -g npm@latest

# Use nvm for Node version management
nvm use 18
nvm alias default 18
```

#### Rust Issues

```bash
# Update Rust toolchain
rustup update

# Clean build artifacts
cargo clean

# Reset Rust environment
rustup self uninstall
rustup install stable
```

#### Permission Issues (Linux/macOS)

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix Rust permissions
sudo chown -R $(whoami) ~/.cargo

# Fix Docker permissions
sudo usermod -aG docker $USER
# Logout and login again
```

#### BMAD Validation Failures

```bash
# Force regenerate documentation
./scripts/bmad-generate.sh --force

# Check missing files
./scripts/bmad-sync.sh

# Run verbose validation
./scripts/bmad-validate.sh --verbose
```

## Next Steps

1. **Read Documentation:** Start with `docs/project-overview-ganache.md`
2. **Understand Architecture:** Review `docs/architecture/architecture-ganache.md`
3. **Development Workflow:** Follow `docs/development/development-guide.md`
4. **Run Validation:** Ensure BMAD compliance with `./scripts/bmad-validate.sh`

## Support

- **Issues:** Create issue on GitHub repository
- **Documentation:** Check `docs/` directory
- **BMAD Validation:** Run `./scripts/bmad-validate.sh` for diagnostics

---

*Generated by BMAD Generation Script*
*Compliance: 100% BMAD Standards*
