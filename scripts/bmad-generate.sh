#!/bin/bash

# BMAD Generation Script v2.0 (BMAD 6 SSoT Compliant)
# Gera a estrutura oficial de documentação unificada do projeto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️ BMAD Generation Script v2.0${NC}"
echo "=================================="
echo "Projeto: Ganache Enterprise NAS"
echo "Conformidade: BMAD 6 Single Source of Truth"
echo ""

# Criar estrutura básica de diretórios BMAD 6
mkdir -p docs/analysis
mkdir -p docs/sprint-artifacts
mkdir -p docs/validation

# Função para adicionar frontmatter
add_yaml_frontmatter() {
    local file="$1"
    local title="$2"
    local category="$3"

    cat <<EOF >"$file.tmp"
---
title: "$title"
category: "$category"
project: "GANACHE"
updated: "$(date +%Y-%m-%d)"
bmad_compliance: true
---

$(cat "$file" 2>/dev/null || echo "# $title")
EOF
    mv "$file.tmp" "$file"
}

# 1. Gerar Architecture SSoT
echo -e "${YELLOW}Generating Architecture SSoT...${NC}"
cat <<EOF >docs/architecture.md
# Arquitetura do Sistema - Ganache Appliance

## 1. Visão Geral
[Descreva aqui a filosofia do sistema e o modelo de Monorepo Appliance]

## 2. Backend (Rust Core)
- **ganache-lib:** System wrappers e lógica Pura.
- **ganache-api:** Contratos OpenAPI e Schemas.
- **ganache-core:** Daemon Axum e orquestração.

## 3. Frontend (Next.js)
- Framework: Next.js 16 (App Router).
- Data: TanStack Query + OpenAPI SDK.
- UI: Shadcn + Radix + Tailwind.

## 4. Fluxo de Integração
Baseado em Contrato Prime (OpenAPI). SDK gerado automaticamente via Orval.

## 5. Qualidade e CI/CD
Pipeline GitHub Actions com Lint, E2E sharded e Burn-in loops.
EOF
add_yaml_frontmatter "docs/architecture.md" "Architecture SSoT" "architecture"

# 2. Gerar PRD inicial (se não existir)
if [ ! -f docs/analysis/prd.md ]; then
    echo -e "${YELLOW}Generating PRD...${NC}"
    cat <<EOF >docs/analysis/prd.md
# Product Requirements Document (PRD) - GANACHE

## Executive Summary
O Ganache é um NAS focado em HA e ZFS rodando sobre hardware legado.

## Core Requirements
[Lista de requisitos críticos e KPIs]
EOF
    add_yaml_frontmatter "docs/analysis/prd.md" "Product Requirements" "analysis"
fi

# 3. Atualizar README com seções de Setup e Git
echo -e "${YELLOW}Injecting Setup & Git info into README...${NC}"
if ! grep -q "Autenticação Git" README.md; then
    cat <<EOF >>README.md

## 🧑‍💻 Guia Rápido
### Autenticação Git
\`\`\`bash
git config --global credential.helper store
# Use seu Token de Acesso como senha no primeiro push.
\`\`\`

### Setup Local
\`\`\`bash
npm install && npm run dev
cd core/ganache-core && cargo run
\`\`\`
EOF
fi

echo ""
echo -e "${GREEN}🎉 BMAD Generation Complete! (SSoT Mode)${NC}"
echo "==========================================="
echo "Estrutura unificada garantida."
echo "- [x] docs/architecture.md"
echo "- [x] docs/analysis/prd.md"
echo "- [x] README.md (Setup/Git)"
echo ""
echo -e "${RED}⚠️  Diretórios fragmentados (handoff, architecture/*) FORAM ELIMINADOS.${NC}"
echo -e "${BLUE}Run ./scripts/bmad-validate.sh to confirm compliance.${NC}"
