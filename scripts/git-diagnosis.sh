#!/bin/bash

# Script de Diagnóstico para Erro "fatal: not a git repository"
# Execute este script no terminal integrado do VS Code

echo "🔍 DIAGNÓSTICO DO REPOSITÓRIO GIT"
echo "=================================="
echo ""

# Verificar diretório atual
echo "📁 Diretório atual:"
pwd
echo ""

# Verificar se é um repositório Git
echo "🔧 Verificando repositório Git..."
if [ -d ".git" ]; then
    echo "✅ Diretório .git encontrado"
    echo "📊 Permissões do diretório .git:"
    ls -ld .git
    echo ""
    
    # Testar comandos Git básicos
    echo "🧪 Testando comandos Git..."
    if git status > /dev/null 2>&1; then
        echo "✅ Comando 'git status' funciona"
        echo ""
        echo "📋 Status atual:"
        git status --porcelain
        echo ""
    else
        echo "❌ Comando 'git status' falhou"
        echo "🔍 Erro detalhado:"
        git status
        echo ""
    fi
    
    # Verificar configurações
    echo "⚙️ Verificando configurações Git..."
    echo "📧 User name: $(git config user.name 2>/dev/null || echo 'NÃO CONFIGURADO')"
    echo "📧 User email: $(git config user.email 2>/dev/null || echo 'NÃO CONFIGURADO')"
    echo ""
    
    # Verificar remotes
    echo "🌐 Verificando remotes..."
    git remote -v 2>/dev/null || echo "❌ Nenhum remote configurado"
    echo ""
    
    # Verificar branch atual
    echo "🌿 Branch atual:"
    git branch --show-current 2>/dev/null || echo "❌ Nenhuma branch atual"
    echo ""
    
else
    echo "❌ Diretório .git NÃO encontrado"
    echo "💡 O diretório não é um repositório Git"
    echo ""
    
    # Sugerir soluções
    echo "🔧 SOLUÇÕES POSSÍVEIS:"
    echo "1. Inicializar repositório: git init"
    echo "2. Verificar se está no diretório correto do projeto"
    echo "3. Abrir VS Code no diretório correto: code ."
    echo ""
fi

# Verificar configurações do VS Code
echo "🔧 Verificando configurações do VS Code..."
if [ -f ".vscode/settings.json" ]; then
    echo "📄 Arquivo .vscode/settings.json encontrado"
    if grep -q "git.path" .vscode/settings.json; then
        echo "✅ Path do Git configurado no VS Code"
    else
        echo "⚠️ Path do Git não configurado no VS Code"
    fi
else
    echo "📄 Nenhum arquivo .vscode/settings.json encontrado"
fi
echo ""

# Verificar se há arquivos tracked
if [ -d ".git" ]; then
    echo "📊 Verificando histórico..."
    commit_count=$(git rev-list --all --count 2>/dev/null || echo "0")
    echo "📝 Total de commits: $commit_count"
    
    if [ "$commit_count" -gt 0 ]; then
        echo "📅 Últimos 3 commits:"
        git log --oneline -3 2>/dev/null || echo "❌ Não foi possível obter o histórico"
    else
        echo "⚠️ Nenhum commit encontrado"
    fi
    echo ""
fi

# Verificar se há mudanças não commitadas
if [ -d ".git" ]; then
    echo "📋 Verificando mudanças..."
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "✅ Nenhuma mudança não commitada"
    else
        echo "⚠️ Há mudanças não commitadas"
        git diff --stat
    fi
    echo ""
fi

echo "🎯 RESUMO DO DIAGNÓSTICO:"
echo "========================="

# Determinar causa mais provável
if [ ! -d ".git" ]; then
    echo "🔴 CAUSA MAIS PROVÁVEL: Diretório não inicializado como repositório Git"
    echo "🔧 SOLUÇÃO: Execute 'git init' no diretório correto do projeto"
elif ! git status > /dev/null 2>&1; then
    echo "🔴 CAUSA MAIS PROVÁVEL: Repositório Git corrompido ou com problemas de permissão"
    echo "🔧 SOLUÇÃO: Verifique permissões do diretório .git e integridade com 'git fsck'"
else
    echo "🟢 REPOSITÓRIO GIT FUNCIONANDO CORRETAMENTE"
    echo "💡 O problema pode estar no plugin GitCOM ou configurações do VS Code"
    echo "🔧 SOLUÇÃO: Verificar configurações do plugin e recarregar VS Code"
fi

echo ""
echo "📞 Para mais detalhes, consulte o arquivo: git-troubleshooting-guide.md"