#!/bin/bash
# Configura o Git para ler os hooks DIRETAMENTE da pasta versionada
# Vantagem: Qualquer alteração no hook é aplicada imediatamente para todos

echo "🏗️  Configurando Git Hooks Dinâmicos..."

# Define o caminho de hooks para a pasta local .githooks
git config core.hooksPath .githooks

# Torna os scripts executáveis (caso tenham perdido a permissão no git)
chmod +x .githooks/*

echo "✅ Git agora obedece aos scripts em .githooks/ automaticamente."