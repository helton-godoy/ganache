#!/bin/bash
# scripts/uninstall-githooks.sh
#
# Remove os githooks customizados do projeto GANACHE
# Útil para troubleshooting ou se precisar desativar temporariamente
# Uso: ./scripts/uninstall-githooks.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}🔧 Desinstalador de Githooks do Projeto GANACHE${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se está no repositório Git
if [ ! -d ".git" ]; then
	echo -e "${RED}❌ ERRO: Este script deve ser executado na raiz do repositório Git.${NC}"
	exit 1
fi

# Confirmar ação
echo -e "${YELLOW}⚠  Esta ação irá remover todos os githooks customizados.${NC}"
echo -e "${YELLOW}   Os hooks padrão do Git (samples) serão restaurados.${NC}"
echo ""
read -p "Deseja continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
	echo -e "${CYAN}Operação cancelada.${NC}"
	exit 0
fi

echo ""

# Remover configuração de hooks path
echo -e "${CYAN}⚙️  Removendo configuração do Git hooks path...${NC}"
git config --unset core.hooksPath || echo -e "${YELLOW}   (nenhuma configuração personalizada encontrada)${NC}"
echo ""

# Remover hooks instalados
echo -e "${CYAN}🗑️  Removendo hooks customizados...${NC}"
REMOVED_COUNT=0

CUSTOM_HOOKS="pre-commit prepare-commit-msg commit-msg post-commit pre-push"

for hook_name in $CUSTOM_HOOKS; do
	hook_file=".git/hooks/$hook_name"

	if [ -f "$hook_file" ] || [ -L "$hook_file" ]; then
		rm "$hook_file"
		echo -e "   ${GREEN}✓${NC} Removido: $hook_name"
		REMOVED_COUNT=$((REMOVED_COUNT + 1))
	fi
done

echo ""

# Procurar por backups
LATEST_BACKUP=$(ls -dt .git/hooks.backup.* 2>/dev/null | head -1 || echo "")

if [ ! -z "$LATEST_BACKUP" ]; then
	echo -e "${CYAN}📦 Backup encontrado: $LATEST_BACKUP${NC}"
	read -p "Deseja restaurar os hooks do backup? (y/N): " -n 1 -r
	echo ""

	if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo -e "${CYAN}   Restaurando hooks do backup...${NC}"
		cp "$LATEST_BACKUP"/* .git/hooks/ 2>/dev/null || true
		echo -e "${GREEN}   ✓ Hooks restaurados${NC}"
	fi
	echo ""
fi

# Resumo
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ Desinstalação Concluída!${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "   Hooks removidos: ${BOLD}$REMOVED_COUNT${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}💡 Para reinstalar os hooks:${NC}"
echo -e "   ${YELLOW}./scripts/install-githooks.sh${NC}"
echo ""
