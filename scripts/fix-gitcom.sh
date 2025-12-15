#!/bin/bash

# Script para Corrigir Problemas Específicos do Plugin GitCOM
# Execute este script para resolver o erro "fatal: not a git repository"

echo "🔧 CORREÇÃO ESPECÍFICA PARA PLUGIN GITCOM"
echo "=========================================="
echo ""

# Verificar se estamos no diretório correto
echo "📁 Verificando diretório atual..."
pwd
echo ""

# Verificar se .git existe
echo "🔍 Verificando repositório Git..."
if [ -d ".git" ]; then
    echo "✅ Diretório .git encontrado"
    ls -ld .git
else
    echo "❌ Diretório .git NÃO encontrado!"
    echo "💡 Execute: git init"
    exit 1
fi
echo ""

# Verificar permissões do .git
echo "🔐 Verificando permissões..."
if [ -r ".git" ] && [ -w ".git" ]; then
    echo "✅ Permissões do .git OK"
else
    echo "⚠️ Corrigindo permissões..."
    sudo chown -R $(whoami):$(whoami) .git
    chmod -R 755 .git
    echo "✅ Permissões corrigidas"
fi
echo ""

# Verificar configurações do Git
echo "⚙️ Verificando configurações Git..."
git config --global user.name > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ User name configurado: $(git config --global user.name)"
else
    echo "⚠️ Configurando user name..."
    git config --global user.name "helton-godoy"
fi

git config --global user.email > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ User email configurado: $(git config --global user.email)"
else
    echo "⚠️ Configurando user email..."
    git config --global user.email "chileno.brasil@gmail.com"
fi
echo ""

# Verificar remote
echo "🌐 Verificando remote..."
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote origin configurado: $(git remote get-url origin)"
else
    echo "⚠️ Remote origin não configurado"
    echo "💡 Configure com: git remote add origin <URL>"
fi
echo ""

# Testar comandos Git básicos
echo "🧪 Testando comandos Git..."
echo ""

echo "1️⃣ Testando git status..."
if git status > /dev/null 2>&1; then
    echo "   ✅ git status funciona"
else
    echo "   ❌ git status falhou"
    git status
    exit 1
fi

echo "2️⃣ Testando git log..."
if git log --oneline -1 > /dev/null 2>&1; then
    echo "   ✅ git log funciona"
    echo "   Último commit: $(git log --oneline -1)"
else
    echo "   ❌ git log falhou"
fi

echo "3️⃣ Testando git branch..."
if git branch --show-current > /dev/null 2>&1; then
    echo "   ✅ git branch funciona"
    echo "   Branch atual: $(git branch --show-current)"
else
    echo "   ❌ git branch falhou"
fi
echo ""

# Criar arquivo de configuração específico para GitCOM
echo "📝 Criando configurações específicas para GitCOM..."
cat > .vscode/settings.json << 'EOF'
{
    "git.path": "/usr/bin/git",
    "git.enabled": true,
    "git.autofetch": true,
    "git.confirmSync": false,
    "git.enableSmartCommit": true,
    "git.enableCommitSigning": false,
    "gitcom.commitStyle": "semantic",
    "gitcom.batchCommits": true,
    "terminal.integrated.cwd": "${workspaceFolder}",
    "git.defaultCloneDirectory": "${workspaceFolder}",
    "git.useEditorAsCommitInput": false
}
EOF
echo "✅ Arquivo .vscode/settings.json atualizado"
echo ""

# Verificar se há mudanças não commitadas
echo "📋 Verificando mudanças não commitadas..."
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ Nenhuma mudança não commitada"
else
    echo "⚠️ Há mudanças não commitadas"
    echo "💡 Execute: git add . && git commit -m 'mensagem'"
fi
echo ""

# Teste final de push (dry-run)
echo "🚀 Testando push (dry-run)..."
if git push --dry-run origin main > /dev/null 2>&1; then
    echo "✅ Push dry-run funcionou"
    echo "💡 O push real deve funcionar agora"
else
    echo "⚠️ Push dry-run falhou (provavelmente autenticação)"
    echo "💡 Verifique suas credenciais Git"
fi
echo ""

echo "🎯 INSTRUÇÕES PARA RESOLVER NO VS CODE:"
echo "========================================"
echo ""
echo "1. 🔄 RECARREGUE O VS CODE:"
echo "   - Ctrl+Shift+P → 'Developer: Reload Window'"
echo "   - OU: Feche e reabra o VS Code"
echo ""
echo "2. 🔧 VERIFIQUE O PLUGIN GITCOM:"
echo "   - Ctrl+Shift+X → Procure por 'GitCOM'"
echo "   - Verifique se está habilitado e atualizado"
echo ""
echo "3. 🧪 TESTE O PUSH:"
echo "   - Tente fazer push novamente pelo plugin"
echo "   - Se ainda falhar, use o terminal: git push"
echo ""
echo "4. 📊 SE PROBLEMA PERSISTIR:"
echo "   - Desinstale e reinstale o plugin GitCOM"
echo "   - Verifique logs: Ctrl+Shift+P → 'Developer: Toggle Developer Tools'"
echo ""

echo "✅ CORREÇÃO CONCLUÍDA!"
echo "📞 Se o problema persistir, consulte: docs/git-troubleshooting-guide.md"