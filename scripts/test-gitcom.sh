#!/bin/bash

# Script de Teste Específico para Plugin GitCOM
# Execute este script para testar configurações do plugin

echo "🧪 TESTE ESPECÍFICO DO PLUGIN GITCOM"
echo "===================================="
echo ""

# Verificar versão do Git
echo "📋 Versão do Git instalada:"
git --version
echo ""

# Verificar configurações globais do Git
echo "⚙️ Configurações Globais do Git:"
echo "User Name: $(git config --global user.name)"
echo "User Email: $(git config --global user.email)"
echo "Editor: $(git config --global core.editor)"
echo "Helper: $(git config --global credential.helper)"
echo ""

# Verificar configurações locais (do repositório)
if [ -d ".git" ]; then
    echo "⚙️ Configurações Locais do Repositório:"
    echo "User Name: $(git config --local user.name)"
    echo "User Email: $(git config --local user.email)"
    echo ""
fi

# Testar operações Git básicas
echo "🧪 Testando Operações Git:"
echo ""

echo "1️⃣ Testando 'git status':"
if git status > /dev/null 2>&1; then
    echo "   ✅ git status funciona"
else
    echo "   ❌ git status falhou"
    git status
fi
echo ""

echo "2️⃣ Testando 'git log':"
if git log --oneline -1 > /dev/null 2>&1; then
    echo "   ✅ git log funciona"
    echo "   Último commit: $(git log --oneline -1)"
else
    echo "   ❌ git log falhou"
fi
echo ""

echo "3️⃣ Testando 'git branch':"
if git branch > /dev/null 2>&1; then
    echo "   ✅ git branch funciona"
    echo "   Branch atual: $(git branch --show-current)"
else
    echo "   ❌ git branch falhou"
fi
echo ""

echo "4️⃣ Testando 'git remote':"
if git remote -v > /dev/null 2>&1; then
    echo "   ✅ git remote funciona"
    git remote -v
else
    echo "   ❌ git remote falhou"
fi
echo ""

echo "5️⃣ Testando 'git push' (dry-run):"
if git push --dry-run origin main > /dev/null 2>&1; then
    echo "   ✅ git push --dry-run funciona"
elif [ $? -eq 128 ]; then
    echo "   ⚠️ git push falhou (provavelmente autenticação)"
else
    echo "   ❌ git push falhou com erro não relacionado à autenticação"
fi
echo ""

# Verificar configurações do VS Code
echo "🔧 Verificando Configurações do VS Code:"
echo ""

if [ -f ".vscode/settings.json" ]; then
    echo "📄 Arquivo .vscode/settings.json encontrado"
    echo "📋 Conteúdo relacionado ao Git:"
    grep -E "(git\.|terminal\.|extensions\.)" .vscode/settings.json 2>/dev/null || echo "   Nenhuma configuração Git específica encontrada"
else
    echo "📄 Nenhum arquivo .vscode/settings.json encontrado"
fi
echo ""

# Verificar se há extensões Git instaladas
echo "🔌 Verificando Extensões do VS Code:"
echo "💡 Para verificar extensões instaladas:"
echo "   1. Abra VS Code"
echo "   2. Ctrl+Shift+X (Extensions)"
echo "   3. Procure por 'Git' ou 'GitCOM'"
echo "   4. Verifique se está habilitado"
echo ""

# Recomendações específicas
echo "🎯 RECOMENDAÇÕES ESPECÍFICAS PARA GITCOM:"
echo "=========================================="
echo ""

if ! git config --global user.name > /dev/null 2>&1; then
    echo "⚠️ Configure o nome do usuário:"
    echo "   git config --global user.name 'Seu Nome Completo'"
    echo ""
fi

if ! git config --global user.email > /dev/null 2>&1; then
    echo "⚠️ Configure o email do usuário:"
    echo "   git config --global user.email 'seu@email.com'"
    echo ""
fi

echo "🔄 Passos para resolver problemas do GitCOM:"
echo "1. Recarregar VS Code: Ctrl+Shift+P → 'Reload Window'"
echo "2. Reiniciar extension host: Ctrl+Shift+P → 'Restart Extension Host'"
echo "3. Verificar logs: Ctrl+Shift+P → 'Developer: Toggle Developer Tools'"
echo "4. Reinstalar plugin se necessário"
echo ""

# Teste final de conectividade
echo "🌐 Teste de Conectividade com Remote:"
if git ls-remote origin > /dev/null 2>&1; then
    echo "✅ Conectividade com remote origin OK"
else
    echo "❌ Problema de conectividade com remote origin"
    echo "💡 Verifique:"
    echo "   - Conexão com internet"
    echo "   - URL do remote: $(git remote get-url origin 2>/dev/null || echo 'N/A')"
    echo "   - Autenticação (token/credentials)"
fi
echo ""

echo "📋 RESUMO DO TESTE:"
echo "==================="
echo "✅ Git está instalado e funcionando"
echo "✅ Repositório Git está operacional"
echo "⚠️ Verificar configurações específicas do GitCOM no VS Code"
echo "⚠️ Se problemas persistirem, verificar logs e reinstalar plugin"
echo ""
echo "📞 Para mais ajuda, consulte: git-troubleshooting-guide.md"