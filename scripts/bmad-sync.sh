#!/bin/bash

# BMAD Sync Script v2.0 (SSoT Compliant)
# Sincroniza a documentação centralizada com mudanças no código-fonte

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 BMAD Sync Script v2.0${NC}"
echo "=================================="
echo "Projeto: Ganache Enterprise NAS"
echo "Foco: Single Source of Truth (docs/architecture.md)"
echo ""

# Caminhos centrais
ARCH_FILE="docs/architecture.md"
PRD_FILE="docs/analysis/prd.md"

# 1. Verificar mudanças no Backend (Rust)
echo -e "${YELLOW}Analisando código Backend (Core)...${NC}"
RUST_CHANGES=$(find core/ -name "*.rs" -mmin -60 | wc -l)
if [ "$RUST_CHANGES" -gt 0 ]; then
	echo -e "${BLUE}➔ Detectadas $RUST_CHANGES mudanças recentes em Rust.${NC}"
	echo -e "DICA: Verifique se novas Crates ou Serviços precisam ser documentados em $ARCH_FILE."
fi

# 2. Verificar mudanças na API (OpenAPI)
echo -e "${YELLOW}Analisando definições de API...${NC}"
if find core/ganache-api -name "*.rs" -mmin -60 | grep -q "."; then
	echo -e "${BLUE}➔ Detectadas mudanças no contrato da API.${NC}"
	echo -e "DICA: Atualize a seção 'Fluxo de Integração' em $ARCH_FILE."
fi

# 3. Validar Regra Anti-Fragmentação
echo -e "${YELLOW}Validando conformidade de estrutura...${NC}"
if [ -d "docs/architecture" ] || [ -d "docs/handoff" ] || [ -d "docs/git" ]; then
	echo -e "${RED}🚨 VIOLAÇÃO DETECTADA: Existem diretórios fragmentados residuais.${NC}"
	echo "Diretórios banidos: docs/architecture/, docs/handoff/, docs/git/"
	echo "Ação: Mova o conteúdo para os eixos centrais e delete as pastas."
else
	echo -e "${GREEN}✅ Estrutura em conformidade com BMAD 6 SSoT.${NC}"
fi

# 4. Verificar Status da Sprint
if [ -f "docs/sprint-artifacts/sprint-status.yaml" ]; then
	echo -e "${GREEN}✅ Sprint Status detectado.${NC}"
fi

echo ""
echo -e "${BLUE}Sync check complete.${NC}"
