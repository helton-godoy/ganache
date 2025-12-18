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

- **OS:** Ubuntu 20.04+ / Debian 13+ / macOS 12+ / Windows 10+
- **RAM:** 8GB (16GB recomendado)
- **Storage:** 50GB espaço livre
- **Network:** Conexão estável para downloads

### Recommended Requirements

- **OS:** Ubuntu 22.04 LTS / Debian 13
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

### 2. Node.js (v20+)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify installation
node --version  # Should be v20.x.x
npm --version
```

### 3. Verification

Always run the test suite after setup to ensure environmental correctness (sudo permissions, node version).

```bash
pnpm test
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
git clone <repository_url>
cd GANACHE
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

## Troubleshooting

#### Node Issues

Common issues found in this environment:

```bash
# Update Dependencies
pnpm update

# Reset node_modules
rm -rf node_modules
pnpm install
```
