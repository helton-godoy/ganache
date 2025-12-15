#!/bin/bash
# setup-hooks.sh
# Instala os hooks de governança do projeto

echo "🏗️  Instalando Git Hooks de Governança..."

# Copia os scripts da pasta 'hooks' do projeto para a pasta oculta .git/hooks
cp .githooks/* .git/hooks/

# Dá permissão de execução
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

echo "✅ Hooks instalados com sucesso!"
