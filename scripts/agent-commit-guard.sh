#!/bin/bash
# scripts/agent-commit-guard.sh
#
# Guarda de Commits para Agentes de IA
# Bloqueia finalizações de tarefas sem commits reais
#
# Este script deve ser chamado por agentes ANTES de afirmar que commitaram
# Uso: ./scripts/agent-commit-guard.sh --task "nome da tarefa" --expected-commits N

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

TASK_NAME=""
EXPECTED_COMMITS=1

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --task)
            TASK_NAME="$2"
            shift 2
            ;;
        --expected-commits)
            EXPECTED_COMMITS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo ""
echo -e "${BOLD}${CYAN}🛡️  Agent Commit Guard${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ ! -z "$TASK_NAME" ]; then
    echo -e "${CYAN}Task:${NC} $TASK_NAME"
fi
echo -e "${CYAN}Commits esperados:${NC} $EXPECTED_COMMITS"
echo ""

# 1. VERIFICAÇÃO CRÍTICA: Staged files
STAGED=$(git diff --cached --name-only)
if [ ! -z "$STAGED" ]; then
    STAGED_COUNT=$(echo "$STAGED" | wc -l)
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}${BOLD}🚨 CRITICAL: ALUCINAÇÃO DETECTADA! 🚨${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Você AFIRMOU ter feito commits, mas existem:${NC}"
    echo -e "${BOLD}  $STAGED_COUNT arquivo(s) STAGED (aguardando commit)${NC}"
    echo ""
    echo -e "${CYAN}Arquivos staged que NÃO foram commitados:${NC}"
    echo "$STAGED" | head -15 | while read file; do
        echo -e "  ${RED}✗${NC} $file"
    done
    if [ "$STAGED_COUNT" -gt 15 ]; then
        echo -e "  ${YELLOW}... e mais $((STAGED_COUNT - 15)) arquivos${NC}"
    fi
    echo ""
    echo -e "${RED}${BOLD}🚫 BLOQUEADO: Você NÃO pode afirmar sucesso!${NC}"
    echo ""
    echo -e "${CYAN}Passos obrigatórios:${NC}"
    echo -e "  1. ${BOLD}./scripts/git-classify.sh${NC} - Classificar mudanças"
    echo -e "  2. ${BOLD}git commit${NC} - Fazer commits atômicos por categoria"
    echo -e "  3. ${BOLD}./scripts/agent-commit-guard.sh${NC} - Verificar novamente"
    echo -e "  4. Só então você pode afirmar sucesso"
    echo ""
    exit 1
fi

# 2. Verificar commits recentes
RECENT_COMMITS=$(git log --oneline --since="2 hours ago" | wc -l)
if [ "$RECENT_COMMITS" -eq 0 ]; then
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}${BOLD}🚨 CRITICAL: ALUCINAÇÃO DETECTADA! 🚨${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Você AFIRMOU ter feito commits, mas:${NC}"
    echo -e "${BOLD}  ZERO commits nas últimas 2 horas!${NC}"
    echo ""
    echo -e "${CYAN}Últimos commits do repositório (podem ser antigos):${NC}"
    git log --oneline -5 --format="%C(yellow)%h%Creset %C(cyan)%ar%Creset - %s"
    echo ""
    echo -e "${RED}${BOLD}🚫 BLOQUEADO: Nenhum commit foi feito!${NC}"
    echo ""
    exit 1
fi

# 3. Validar quantidade esperada
if [ "$RECENT_COMMITS" -lt "$EXPECTED_COMMITS" ]; then
    echo -e "${YELLOW}⚠️  AVISO: Esperado $EXPECTED_COMMITS commits, encontrado $RECENT_COMMITS${NC}"
    echo ""
    echo -e "${CYAN}Commits recentes:${NC}"
    git log --oneline --since="2 hours ago" --format="  %C(yellow)%h%Creset %C(cyan)%ar%Creset - %s"
    echo ""
    echo -e "${YELLOW}Você pode ter esquecido de commitar algo?${NC}"
    echo ""
fi

# 4. Verificar unstaged/untracked
UNSTAGED=$(git diff --name-only | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)

if [ "$UNSTAGED" -gt 0 ] || [ "$UNTRACKED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Repositório não está completamente limpo${NC}"
    echo -e "  Unstaged:  $UNSTAGED arquivo(s)"
    echo -e "  Untracked: $UNTRACKED arquivo(s)"
    echo ""
    echo -e "${CYAN}Você tem certeza que terminou tudo?${NC}"
    echo ""
fi

# 5. SUCCESS: Passou em todas as verificações
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ GUARD PASSOU: Commits Verificados!${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📋 Commits recentes verificados ($RECENT_COMMITS):${NC}"
git log --oneline --since="2 hours ago" --format="%C(green)✓%Creset %C(yellow)%h%Creset %C(cyan)%ar%Creset - %s"
echo ""
echo -e "${GREEN}${BOLD}🎉 Você PODE afirmar que os commits foram feitos!${NC}"
echo ""
exit 0
