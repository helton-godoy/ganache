#!/bin/bash
# scripts/force-agent-compliance.sh
#
# SCRIPT DEFINITIVO DE CONFORMIDADE FORÇADA
# Não permite que agente prossiga sem fazer commits
#
# Uso: Agente DEVE executar antes de afirmar qualquer coisa
# ./scripts/force-agent-compliance.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo ""
echo -e "${BOLD}${RED}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${RED}║                                                        ║${NC}"
echo -e "${BOLD}${RED}║    🚨  CONFORMIDADE OBRIGATÓRIA - SEM EXCEÇÕES  🚨    ║${NC}"
echo -e "${BOLD}${RED}║                                                        ║${NC}"
echo -e "${BOLD}${RED}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Este script é OBRIGATÓRIO antes de afirmar sucesso.${NC}"
echo -e "${YELLOW}Não há como burlar esta verificação.${NC}"
echo ""

# BLOQUEIO 1: Staged Files
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}[1/3] Verificando Staged Files${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

STAGED=$(git diff --cached --name-only)
if [ ! -z "$STAGED" ]; then
    STAGED_COUNT=$(echo "$STAGED" | wc -l)
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}🚫 BLOQUEIO ABSOLUTO - VOCÊ NÃO PODE PROSSEGUIR${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}${RED}Existem $STAGED_COUNT arquivos STAGED aguardando commit!${NC}"
    echo ""
    echo -e "${YELLOW}Arquivos pendentes:${NC}"
    echo "$STAGED" | head -20 | while read file; do
        echo -e "  ${RED}✗${NC} $file"
    done
    if [ "$STAGED_COUNT" -gt 20 ]; then
        echo -e "  ${YELLOW}... e mais $((STAGED_COUNT - 20)) arquivos${NC}"
    fi
    echo ""
    echo -e "${BOLD}${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║  VOCÊ AFIRMOU TER COMMITADO, MAS NÃO COMMITOU NADA!    ║${NC}"
    echo -e "${BOLD}${RED}║                                                        ║${NC}"
    echo -e "${BOLD}${RED}║  ISTO É UMA ALUCINAÇÃO. VOCÊ NÃO PODE CONTINUAR.       ║${NC}"
    echo -e "${BOLD}${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}${BOLD}AÇÕES OBRIGATÓRIAS:${NC}"
    echo ""
    echo -e "  ${BOLD}1.${NC} Classificar mudanças:"
    echo -e "     ${YELLOW}./scripts/git-classify.sh${NC}"
    echo ""
    echo -e "  ${BOLD}2.${NC} Fazer commits atômicos POR CATEGORIA:"
    echo -e "     ${YELLOW}git add <categoria1>${NC}"
    echo -e "     ${YELLOW}git commit -m \"tipo(escopo): descrição\"${NC}"
    echo ""
    echo -e "  ${BOLD}3.${NC} Repetir para CADA categoria separadamente"
    echo ""
    echo -e "  ${BOLD}4.${NC} Executar este script novamente:"
    echo -e "     ${YELLOW}./scripts/force-agent-compliance.sh${NC}"
    echo ""
    echo -e "  ${BOLD}5.${NC} SÓ ENTÃO você pode afirmar sucesso"
    echo ""
    echo -e "${RED}${BOLD}NÃO HÁ OUTRA OPÇÃO. FAÇA OS COMMITS AGORA.${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Nenhum arquivo staged - commits foram feitos${NC}"
echo ""

# BLOQUEIO 2: Commits Recentes
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}[2/3] Verificando Commits Recentes${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RECENT_COMMITS=$(git log --oneline --since="2 hours ago" | wc -l)
if [ "$RECENT_COMMITS" -eq 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}🚫 BLOQUEIO ABSOLUTO - VOCÊ NÃO PODE PROSSEGUIR${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}${RED}ZERO commits nas últimas 2 horas!${NC}"
    echo ""
    echo -e "${YELLOW}Últimos commits do repositório:${NC}"
    git log --oneline -5 --format="%C(yellow)%h%Creset %C(cyan)%ar%Creset - %s"
    echo ""
    echo -e "${BOLD}${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║  VOCÊ AFIRMOU TER COMMITADO, MAS NÃO HÁ COMMITS!       ║${NC}"
    echo -e "${BOLD}${RED}║                                                        ║${NC}"
    echo -e "${BOLD}${RED}║  ISTO É UMA ALUCINAÇÃO TOTAL.                          ║${NC}"
    echo -e "${BOLD}${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Commits recentes encontrados: $RECENT_COMMITS${NC}"
git log --oneline --since="2 hours ago" --format=" %C(green)✓%Creset %C(yellow)%h%Creset %s"
echo ""

# BLOQUEIO 3: Working Tree Clean
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}[3/3] Verificando Working Tree${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

UNSTAGED=$(git diff --name-only | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)

if [ "$UNSTAGED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVISO: $UNSTAGED arquivo(s) unstaged${NC}"
fi

if [ "$UNTRACKED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVISO: $UNTRACKED arquivo(s) untracked${NC}"
fi

if [ "$UNSTAGED" -eq 0 ] && [ "$UNTRACKED" -eq 0 ]; then
    echo -e "${GREEN}✓ Working tree completamente limpo${NC}"
fi
echo ""

# SUCESSO TOTAL
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║                                                        ║${NC}"
echo -e "${BOLD}${GREEN}║    ✅  CONFORMIDADE VERIFICADA - PODE PROSSEGUIR  ✅  ║${NC}"
echo -e "${BOLD}${GREEN}║                                                        ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Resumo Final:${NC}"
echo -e "  Commits recentes:  ${BOLD}$RECENT_COMMITS${NC}"
echo -e "  Arquivos staged:   ${BOLD}0${NC}"
echo -e "  Arquivos unstaged: ${BOLD}$UNSTAGED${NC}"
echo -e "  Arquivos untracked: ${BOLD}$UNTRACKED${NC}"
echo ""
echo -e "${BOLD}${GREEN}🎉 AGORA você pode afirmar que fez os commits!${NC}"
echo -e "${BOLD}${GREEN}🎉 AGORA você pode marcar tarefas como concluídas!${NC}"
echo -e "${BOLD}${GREEN}🎉 AGORA você pode prosseguir com confiança!${NC}"
echo ""
exit 0
