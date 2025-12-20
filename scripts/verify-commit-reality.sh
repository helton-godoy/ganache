#!/bin/bash
# scripts/verify-commit-reality.sh
# 
# Script de Verificação da Realidade de Commits
# Previne alucinações de agentes sobre operações Git
#
# Uso: ./scripts/verify-commit-reality.sh [expected_commit_count]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

EXPECTED_COMMITS=${1:-1}

echo ""
echo -e "${BOLD}${CYAN}🔍 Verificador de Realidade de Commits${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Verificar se há mudanças staged
STAGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$STAGED_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ ALUCINAÇÃO DETECTADA!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Você afirmou ter commitado, mas existem $STAGED_COUNT arquivos staged:${NC}"
    echo ""
    git diff --cached --name-status | head -10
    if [ "$STAGED_COUNT" -gt 10 ]; then
        echo -e "  ... e mais $((STAGED_COUNT - 10)) arquivos"
    fi
    echo ""
    echo -e "${RED}🚫 BLOQUEADO: Commits não foram realizados!${NC}"
    echo ""
    echo -e "${CYAN}Ações corretivas:${NC}"
    echo -e "  1. Execute: ${BOLD}./scripts/git-classify.sh${NC} para classificar mudanças"
    echo -e "  2. Faça commits atômicos por categoria"
    echo -e "  3. Execute este script novamente para verificar"
    echo ""
    exit 1
fi

# 2. Verificar se há mudanças não staged
UNSTAGED_COUNT=$(git diff --name-only | wc -l)
if [ "$UNSTAGED_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Existem $UNSTAGED_COUNT arquivos modificados não staged${NC}"
    git diff --name-only | head -5
    if [ "$UNSTAGED_COUNT" -gt 5 ]; then
        echo -e "  ... e mais $((UNSTAGED_COUNT - 5)) arquivos"
    fi
    echo ""
    echo -e "${YELLOW}Isso pode indicar que você não terminou seu trabalho.${NC}"
    echo ""
fi

# 3. Verificar se há arquivos untracked
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard | wc -l)
if [ "$UNTRACKED_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Existem $UNTRACKED_COUNT arquivos não rastreados${NC}"
    git ls-files --others --exclude-standard | head -5
    if [ "$UNTRACKED_COUNT" -gt 5 ]; then
        echo -e "  ... e mais $((UNTRACKED_COUNT - 5)) arquivos"
    fi
    echo ""
fi

# 4. Verificar commits recentes (última hora)
RECENT_COMMITS=$(git log --oneline --since="1 hour ago" | wc -l)
if [ "$RECENT_COMMITS" -eq 0 ]; then
    echo -e "${RED}❌ ALUCINAÇÃO DETECTADA!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Você afirmou ter commitado, mas NÃO HÁ COMMITS recentes (última 1h)${NC}"
    echo ""
    echo -e "${CYAN}Últimos 5 commits do repositório:${NC}"
    git log --oneline -5 --format="%C(yellow)%h%Creset %C(cyan)%ar%Creset - %s"
    echo ""
    echo -e "${RED}🚫 BLOQUEADO: Nenhum commit foi feito!${NC}"
    echo ""
    exit 1
fi

# 5. Validar quantidade esperada de commits
if [ "$RECENT_COMMITS" -lt "$EXPECTED_COMMITS" ]; then
    echo -e "${YELLOW}⚠️  AVISO: Esperava $EXPECTED_COMMITS commits, mas encontrei apenas $RECENT_COMMITS${NC}"
    echo ""
fi

# 6. Mostrar commits recentes
echo -e "${GREEN}✅ Validação de Realidade: PASSOU${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📋 Commits recentes ($RECENT_COMMITS na última hora):${NC}"
git log --oneline --since="1 hour ago" --format="%C(green)✓%Creset %C(yellow)%h%Creset %C(cyan)%ar%Creset - %s"
echo ""

# 7. Status final
echo -e "${CYAN}📊 Status do Repositório:${NC}"
echo -e "  Staged:    ${BOLD}$STAGED_COUNT${NC} arquivo(s)"
echo -e "  Unstaged:  ${BOLD}$UNSTAGED_COUNT${NC} arquivo(s)"
echo -e "  Untracked: ${BOLD}$UNTRACKED_COUNT${NC} arquivo(s)"
echo ""

# 8. Determinar se está realmente limpo
if [ "$STAGED_COUNT" -eq 0 ] && [ "$UNSTAGED_COUNT" -eq 0 ] && [ "$UNTRACKED_COUNT" -eq 0 ]; then
    echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${GREEN}🎉 REPOSITÓRIO LIMPO E COMMITS VERIFICADOS!${NC}"
    echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  Repositório não está completamente limpo${NC}"
    echo -e "${CYAN}Execute: ${BOLD}git status${NC} para detalhes"
    echo ""
    exit 0
fi
