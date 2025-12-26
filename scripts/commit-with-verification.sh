#!/bin/bash
# scripts/commit-with-verification.sh
#
# WRAPPER OBRIGATÓRIO PARA COMMITS
# Este script SUBSTITUI "git commit" e FORÇA verificação automática
#
# Uso: ./scripts/commit-with-verification.sh -m "mensagem" [arquivos...]
# Ou: ./scripts/commit-with-verification.sh (abre editor)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}🔒 Commit Wrapper com Verificação Obrigatória${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# PRÉ-VERIFICAÇÃO: Bloquear se não há staged files
STAGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$STAGED_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ ERRO: Nenhum arquivo staged para commit!${NC}"
    echo -e "${YELLOW}Execute: git add <arquivos>${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Arquivos staged: $STAGED_COUNT${NC}"
git diff --cached --name-status | head -5
if [ "$STAGED_COUNT" -gt 5 ]; then
    echo -e "  ... e mais $((STAGED_COUNT - 5)) arquivos"
fi
echo ""

# EXECUTAR GIT COMMIT
echo -e "${CYAN}→ Executando git commit...${NC}"
if ! git commit "$@"; then
    echo -e "${RED}❌ Commit falhou ou foi abortado${NC}"
    exit 1
fi

# PÓS-VERIFICAÇÃO AUTOMÁTICA: Garantir que commit foi feito
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}🔍 Verificação Pós-Commit Automática${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Verificar se ainda há staged files (indica commit parcial ou falha)
STAGED_AFTER=$(git diff --cached --name-only | wc -l)
if [ "$STAGED_AFTER" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Ainda existem $STAGED_AFTER arquivos staged!${NC}"
    echo -e "${YELLOW}   Isso pode indicar commit parcial.${NC}"
    git diff --cached --name-status | head -5
    echo ""
fi

# 2. Confirmar que commit foi criado
LAST_COMMIT=$(git log -1 --oneline --format="%h - %s")
echo -e "${GREEN}✓ Último commit:${NC} $LAST_COMMIT"
echo ""

# 3. Mostrar status final
echo -e "${CYAN}📊 Status do repositório:${NC}"
TOTAL_STAGED=$(git diff --cached --name-only | wc -l)
TOTAL_UNSTAGED=$(git diff --name-only | wc -l)
TOTAL_UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
echo -e "  Staged:    $TOTAL_STAGED arquivo(s)"
echo -e "  Unstaged:  $TOTAL_UNSTAGED arquivo(s)"
echo -e "  Untracked: $TOTAL_UNTRACKED arquivo(s)"
echo ""

if [ "$TOTAL_STAGED" -eq 0 ] && [ "$TOTAL_UNSTAGED" -eq 0 ] && [ "$TOTAL_UNTRACKED" -eq 0 ]; then
    echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${GREEN}✅ PERFEITO: Repositório completamente limpo!${NC}"
    echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${YELLOW}💡 Você pode ter mais mudanças para commitar.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Commit verificado e registrado com sucesso!${NC}"
echo ""
