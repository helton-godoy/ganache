#!/bin/bash
clear
# Script de Configuração Rápida de Autenticação Git
# Suporte para GitHub, GitLab e SSH

echo "🔐 CONFIGURAÇÃO DE AUTENTICAÇÃO GIT"
echo "==================================="
echo ""

# Verificar se Git está instalado
if ! command -v git &>/dev/null; then
    echo "❌ Git não está instalado. Instale primeiro:"
    echo "   sudo apt-get install git"
    exit 1
fi

echo "✅ Git encontrado: $(git --version)"
echo ""

# Menu de opções
echo "🔑 ESCOLHA O MÉTODO DE AUTENTICAÇÃO:"
echo "===================================="
echo "1) Token de Acesso Pessoal (GitHub/GitLab) - RECOMENDADO"
echo "2) Chave SSH (Mais Seguro)"
echo "3) Credenciais HTTP Básicas"
echo "4) Diagnóstico de problemas atuais"
echo ""
read -p "Digite sua escolha (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎯 CONFIGURANDO TOKEN DE ACESSO PESSOAL"
        echo "======================================"

        # Configurar Git básico
        echo "📧 Configurando informações básicas..."
        git config --global user.name "helton-godoy"
        git config --global user.email "chileno.brasil@gmail.com"
        echo "✅ Configurado: $(git config user.name) <$(git config user.email)>"
        echo ""

        # Configurar credential helper
        echo "🔧 Configurando credential helper..."
        git config --global credential.helper store
        echo "✅ Credential helper configurado"
        echo ""

        # Verificar remote
        echo "🌐 Verificando remote..."
        if git remote get-url origin >/dev/null 2>&1; then
            remote_url=$(git remote get-url origin)
            echo "✅ Remote encontrado: $remote_url"
        else
            echo "⚠️ Nenhum remote 'origin' configurado"
            read -p "Digite a URL do repositório (ex: https://github.com/usuario/repo.git): " repo_url
            git remote add origin "$repo_url"
            echo "✅ Remote adicionado: $repo_url"
        fi
        echo ""

        # Instruções finais
        echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
        echo "=========================="
        echo ""
        echo "📋 PRÓXIMOS PASSOS:"
        echo "1. Gere um Personal Access Token no GitHub:"
        echo "   https://github.com/settings/tokens"
        echo ""
        echo "2. Permissões necessárias:"
        echo "   ✅ repo (acesso completo)"
        echo "   ✅ workflow (se usar Actions)"
        echo ""
        echo "3. Teste o push:"
        echo "   git push origin main"
        echo ""
        echo "4. Quando solicitado:"
        echo "   Username: helton-godoy"
        echo "   Password: [cole seu token]"
        echo ""
        ;;

    2)
        echo ""
        echo "🔑 CONFIGURANDO CHAVE SSH"
        echo "========================="

        # Verificar se já tem chave SSH
        if [ -f ~/.ssh/id_rsa.pub ]; then
            echo "✅ Chave SSH já existe"
            echo "📄 Chave pública:"
            cat ~/.ssh/id_rsa.pub
            echo ""
        else
            echo "🔧 Gerando nova chave SSH..."
            ssh-keygen -t rsa -b 4096 -C "chileno.brasil@gmail.com" -f ~/.ssh/id_rsa -N ""
            echo "✅ Chave SSH gerada"
            echo ""
        fi

        # Iniciar SSH agent
        echo "🚀 Iniciando SSH agent..."
        eval "$(ssh-agent -s)" >/dev/null
        ssh-add ~/.ssh/id_rsa
        echo "✅ Chave adicionada ao agent"
        echo ""

        # Mostrar chave pública
        echo "📋 COPIE ESTA CHAVE PÚBLICA PARA O GITHUB:"
        echo "=========================================="
        cat ~/.ssh/id_rsa.pub
        echo ""
        echo "📖 INSTRUÇÕES:"
        echo "1. Acesse: https://github.com/settings/keys"
        echo "2. Clique: 'New SSH key'"
        echo "3. Cole a chave acima"
        echo "4. Salve"
        echo ""

        # Configurar remote para SSH
        echo "🌐 Configurando remote para SSH..."
        if git remote get-url origin >/dev/null 2>&1; then
            current_url=$(git remote get-url origin)
            if [[ $current_url == https://* ]]; then
                ssh_url=$(echo $current_url | sed 's|https://github.com/|git@github.com:|')
                git remote set-url origin "$ssh_url"
                echo "✅ Remote mudado para SSH: $ssh_url"
            else
                echo "✅ Remote já está em SSH: $current_url"
            fi
        else
            echo "⚠️ Configure o remote SSH manualmente:"
            echo "   git remote add origin git@github.com:usuario/repo.git"
        fi
        echo ""

        # Testar conexão
        echo "🧪 Testando conexão SSH..."
        ssh_test=$(ssh -o StrictHostKeyChecking=no -T git@github.com 2>&1 | head -3)
        if echo "$ssh_test" | grep -q "successfully authenticated"; then
            echo "✅ Conexão SSH funcionando!"
        else
            echo "⚠️ Conexão SSH precisa de configuração"
            echo "💡 Adicione a chave pública ao GitHub primeiro"
        fi
        echo ""
        ;;

    3)
        echo ""
        echo "🌐 CONFIGURANDO CREDENCIAIS HTTP BÁSICAS"
        echo "========================================"

        echo "⚠️ AVISO: Este método é menos seguro!"
        echo "Recomendamos usar Token ou SSH."
        echo ""
        read -p "Continuar mesmo assim? (s/N): " confirm
        if [[ $confirm != "s" && $confirm != "S" ]]; then
            echo "❌ Configuração cancelada"
            exit 0
        fi

        # Configurar credential helper
        git config --global credential.helper store
        echo "✅ Credential helper configurado"
        echo ""

        echo "📋 Para testar:"
        echo "git push origin main"
        echo ""
        echo "Quando solicitado:"
        echo "Username: seu-username"
        echo "Password: sua-senha"
        echo ""
        ;;

    4)
        echo ""
        echo "🔍 DIAGNÓSTICO DE AUTENTICAÇÃO"
        echo "=============================="

        echo "📧 Configurações Git:"
        echo "User: $(git config user.name)"
        echo "Email: $(git config user.email)"
        echo "Helper: $(git config credential.helper)"
        echo ""

        echo "🌐 Remote:"
        git remote -v
        echo ""

        echo "🔑 Chaves SSH:"
        if [ -f ~/.ssh/id_rsa.pub ]; then
            echo "✅ Chave SSH encontrada"
            ssh-add -l 2>/dev/null || echo "⚠️ SSH agent não está rodando"
        else
            echo "❌ Nenhuma chave SSH encontrada"
        fi
        echo ""

        echo "🧪 Teste de conectividade:"
        echo "HTTPS:" $(curl -s -o /dev/null -w "%{http_code}" https://api.github.com/user 2>/dev/null || echo "Falhou")
        echo "SSH:" $(ssh -o ConnectTimeout=5 -T git@github.com 2>&1 | grep -o "successfully\|denied\|timeout" || echo "Falhou")
        echo ""

        echo "🚀 Teste de push:"
        git push --dry-run origin main 2>&1 | head -3
        echo ""
        ;;

    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo "🎯 CONFIGURAÇÃO FINALIZADA!"
echo "==========================="
echo ""
echo "📚 Para mais detalhes, consulte:"
echo "docs/git-authentication-guide.md"
echo ""
echo "🔧 Scripts disponíveis:"
echo "scripts/setup-git-auth.sh - Este script"
echo "scripts/fix-gitcom.sh - Correção GitCOM"
echo "scripts/git-diagnosis.sh - Diagnóstico geral"
echo ""
