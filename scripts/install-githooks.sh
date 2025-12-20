#!/bin/bash
# scripts/install-githooks.sh
# 
# Instala os githooks customizados do projeto GANACHE
# Uso: ./scripts/install-githooks.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}🔧 Instalador de Githooks do Projeto GANACHE${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se está no repositório Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠  ERRO: Este script deve ser executado na raiz do repositório Git.${NC}"
    exit 1
fi

# Verificar se .githooks existe
if [ ! -d ".githooks" ]; then
    echo -e "${YELLOW}⚠  ERRO: Diretório .githooks não encontrado.${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Hooks disponíveis em .githooks/:${NC}"
ls -1 .githooks/ | grep -v "\.md\|\.sample" | while read hook; do
    echo -e "   - $hook"
done
echo ""

# Criar backup dos hooks existentes (se houver)
BACKUP_DIR=".git/hooks.backup.$(date +%Y%m%d_%H%M%S)"
if ls .git/hooks/* 2>/dev/null | grep -qv "\.sample"; then
    echo -e "${CYAN}📦 Criando backup dos hooks existentes...${NC}"
    mkdir -p "$BACKUP_DIR"
    cp .git/hooks/* "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup salvo em: $BACKUP_DIR${NC}"
    echo ""
fi

# Instalar hooks
echo -e "${CYAN}🔗 Instalando hooks...${NC}"
INSTALLED_COUNT=0

for hook_file in .githooks/*; do
    # Ignorar arquivos auxiliares
    if [[ "$hook_file" == *".md" ]] || [[ "$hook_file" == *".sample" ]]; then
        continue
    fi
    
    hook_name=$(basename "$hook_file")
    target=".git/hooks/$hook_name"
    
    # Criar symlink ou copiar arquivo
    if [ -L "$target" ]; then
        # Já é um symlink, atualizar
        rm "$target"
    elif [ -f "$target" ]; then
        # Arquivo existe, remover
        rm "$target"
    fi
    
    # Copiar hook (preferível a symlink para compatibilidade)
    cp "$hook_file" "$target"
    chmod +x "$target"
    
    echo -e "   ${GREEN}✓${NC} Instalado: $hook_name"
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
done

echo ""

# Configurar Git hooks path (opcional, mas útil)
echo -e "${CYAN}⚙️  Configurando Git hooks path...${NC}"
git config core.hooksPath .githooks
echo -e "${GREEN}✓ Git configurado para usar .githooks/${NC}"
echo ""

# Resumo
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ Instalação Concluída!${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "   Hooks instalados: ${BOLD}$INSTALLED_COUNT${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Mostrar informações úteis
echo -e "${CYAN}📘 Informações Importantes:${NC}"
echo ""
echo -e "   ${BOLD}Hooks Instalados:${NC}"
echo -e "   - ${CYAN}pre-commit${NC}:        Validações antes de commit (conflitos, segredos, linting, testes)"
echo -e "   - ${CYAN}prepare-commit-msg${NC}: Cria template de mensagem com auto-detecção de escopo"
echo -e "   - ${CYAN}commit-msg${NC}:        Valida formato Conventional Commits"
echo -e "   - ${CYAN}post-commit${NC}:       Notificações e verificações pós-commit"
echo -e "   - ${CYAN}pre-push${NC}:          Validações antes de push (BMAD, testes, builds)"
echo ""
echo -e "   ${BOLD}Como usar:${NC}"
echo -e "   - Os hooks rodam ${BOLD}automaticamente${NC} em cada commit/push"
echo -e "   - Para pular hooks em emergências: ${YELLOW}git commit --no-verify${NC}"
echo -e "   - Para classificar mudanças manualmente: ${YELLOW}./scripts/git-classify.sh${NC}"
echo -e "   - Para validar integridade: ${YELLOW}./scripts/git-classify.sh --validate${NC}"
echo ""
echo -e "   ${BOLD}Variáveis de Ambiente Opcionais:${NC}"
echo -e "   - ${CYAN}GANACHE_PRE_PUSH_TESTS=1${NC}: Ativa testes de integração no pre-push"
echo -e "   - ${CYAN}GANACHE_VERBOSE_POST_COMMIT=1${NC}: Mostra mais detalhes no post-commit"
echo ""
echo -e "${GREEN}💡 Tudo pronto! Faça um commit de teste para ver os hooks em ação.${NC}"
echo ""
