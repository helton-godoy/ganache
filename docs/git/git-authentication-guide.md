# 🔐 Guia Completo: Configuração de Autenticação Git

## 📋 Métodos de Autenticação Disponíveis

### **1. Token de Acesso Pessoal (Recomendado)**

### **2. Chave SSH**

### **3. Credenciais HTTP (Username/Password)**

---

## 🎯 **MÉTODO 1: TOKEN DE ACESSO PESSOAL (GitHub/GitLab)**

### **Passo 1: Gerar Token no GitHub**

1. **Acesse GitHub:**
   - Vá para: <https://github.com/settings/tokens>
   - Clique em "Generate new token (classic)"

2. **Configure o Token:**
   - **Nome:** `git-vscode-token`
   - **Expiração:** Nunca ou 90 dias
   - **Permissões necessárias:**
     - ✅ `repo` (acesso completo a repositórios)
     - ✅ `workflow` (se usar GitHub Actions)

3. **Copie o Token:**
   - Guarde em local seguro (não commite no código!)

### **Passo 2: Configurar Git para usar Token**

```bash
# Configurar credential helper
git config --global credential.helper store

# Para primeira vez, Git pedirá credenciais:
# Username: seu-username-github
# Password: seu-token-aqui
```

### **Passo 3: Testar Autenticação**

```bash
# Teste de push (primeira vez pedirá credenciais)
git push origin main

# Username: helton-godoy
# Password: ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## 🔑 **MÉTODO 2: CHAVE SSH (Mais Seguro)**

### **Passo 1: Verificar se já tem chave SSH**

```bash
# Listar chaves SSH existentes
ls -la ~/.ssh/

# Verificar se chave existe
ls ~/.ssh/id_rsa.pub
```

### **Passo 2: Gerar nova chave SSH (se necessário)**

```bash
# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "chileno.brasil@gmail.com"

# Aceitar local padrão (pressione Enter)
# Definir passphrase (opcional, mas recomendado)
```

### **Passo 3: Adicionar chave ao SSH Agent**

```bash
# Iniciar SSH agent
eval "$(ssh-agent -s)"

# Adicionar chave privada
ssh-add ~/.ssh/id_rsa
```

### **Passo 4: Copiar chave pública para GitHub**

```bash
# Copiar chave pública
cat ~/.ssh/id_rsa.pub

# OU copiar para clipboard
xclip -sel clip < ~/.ssh/id_rsa.pub
```

**No GitHub:**

1. Vá para: <https://github.com/settings/keys>
2. Clique "New SSH key"
3. Cole a chave pública
4. Salve

### **Passo 5: Configurar Git para usar SSH**

```bash
# Verificar remote atual (provavelmente HTTPS)
git remote -v

# Mudar para SSH
git remote set-url origin git@github.com:helton-godoy/ganache.git

# Verificar mudança
git remote -v
```

### **Passo 6: Testar conexão SSH**

```bash
# Testar conexão com GitHub
ssh -T git@github.com

# Deve aparecer: "Hi helton-godoy! You've successfully authenticated..."
```

---

## 🌐 **MÉTODO 3: CREDENCIAIS HTTP (Básico)**

### **Configuração Básica:**

```bash
# Configurar credential helper
git config --global credential.helper store

# Git pedirá username/password na primeira vez
# Username: helton-godoy
# Password: sua-senha-github
```

**⚠️ Desvantagens:**

- Menos seguro que token/SSH
- GitHub não permite mais senha direta
- Use apenas se necessário

---

## 🛠️ **CONFIGURAÇÕES AVANÇADAS**

### **Credential Helpers Disponíveis:**

```bash
# Store (salva em plain text - menos seguro)
git config --global credential.helper store

# Cache (salva em memória por tempo limitado)
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'

# Manager (usa sistema de credenciais do SO)
git config --global credential.helper manager-core

# Para Windows
git config --global credential.helper manager

# Para macOS
git config --global credential.helper osxkeychain
```

### **Configurações por Repositório:**

```bash
# Configurações específicas do projeto
git config user.name "helton-godoy"
git config user.email "chileno.brasil@gmail.com"

# Verificar configurações
git config --list --local
```

---

## 🔍 **DIAGNÓSTICO DE PROBLEMAS DE AUTENTICAÇÃO**

### **Script de Diagnóstico:**

```bash
#!/bin/bash
echo "🔍 DIAGNÓSTICO DE AUTENTICAÇÃO GIT"
echo "=================================="

# Verificar configurações
echo "📧 Configurações Git:"
echo "User: $(git config user.name)"
echo "Email: $(git config user.email)"
echo "Helper: $(git config credential.helper)"
echo ""

# Verificar remote
echo "🌐 Remote atual:"
git remote -v
echo ""

# Testar conexão HTTPS
echo "🔗 Teste HTTPS:"
curl -s https://api.github.com/user -H "Authorization: token $GITHUB_TOKEN" | head -5 || echo "Token não configurado"
echo ""

# Testar SSH
echo "🔑 Teste SSH:"
ssh -T git@github.com 2>&1 | head -3
echo ""

# Testar push dry-run
echo "🚀 Teste Push (dry-run):"
git push --dry-run origin main 2>&1 | head -5
echo ""
```

### **Problemas Comuns:**

#### **1. "Permission denied (publickey)"**

```bash
# Verificar se chave SSH está carregada
ssh-add -l

# Adicionar chave se necessário
ssh-add ~/.ssh/id_rsa

# Verificar se chave pública está no GitHub
cat ~/.ssh/id_rsa.pub
```

#### **2. "Authentication failed"**

```bash
# Limpar credenciais armazenadas
git config --global --unset credential.helper
git config --global credential.helper store

# Tentar novamente (pedirá credenciais)
git push origin main
```

#### **3. "fatal: remote origin already exists"**

```bash
# Ver remote atual
git remote -v

# Mudar URL do remote
git remote set-url origin git@github.com:helton-godoy/ganache.git
```

---

## 📱 **CONFIGURAÇÃO PARA DIFERENTES PLATAFORMAS**

### **GitHub:**

```bash
# HTTPS com token
git remote set-url origin https://helton-godoy@github.com/helton-godoy/ganache.git

# SSH
git remote set-url origin git@github.com:helton-godoy/ganache.git
```

### **GitLab:**

```bash
# HTTPS com token
git remote set-url origin https://oauth2:TOKEN@gitlab.com/usuario/projeto.git

# SSH
git remote set-url origin git@gitlab.com:usuario/projeto.git
```

### **Bitbucket:**

```bash
# HTTPS com token
git remote set-url origin https://usuario@bitbucket.org/usuario/projeto.git

# SSH
git remote set-url origin git@bitbucket.org:usuario/projeto.git
```

---

## 🔒 **MELHORES PRÁTICAS DE SEGURANÇA**

### **1. Use Tokens em vez de Senhas**

- Tokens podem ter permissões específicas
- Tokens podem ser revogados individualmente
- Não expõem sua senha principal

### **2. Use SSH Keys**

- Mais seguro que HTTPS
- Não requer credenciais repetidas
- Funciona com múltiplos repositórios

### **3. Configure GPG para Commits**

```bash
# Instalar GPG
sudo apt-get install gnupg

# Gerar chave GPG
gpg --full-generate-key

# Configurar Git para usar GPG
git config --global commit.gpgsign true
git config --global user.signingkey [KEY-ID]
```

### **4. Use SSH Config para múltiplas contas**

```bash
# Editar ~/.ssh/config
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_personal

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_work
```

---

## 🚀 **CONFIGURAÇÃO RÁPIDA (Recomendada)**

Para começar rapidamente com GitHub:

```bash
# 1. Configurar Git
git config --global user.name "helton-godoy"
git config --global user.email "chileno.brasil@gmail.com"

# 2. Configurar credential helper
git config --global credential.helper store

# 3. Primeiro push pedirá token
git push origin main

# Username: helton-godoy
# Password: [cole seu token GitHub]
```

---

## 📞 **SUPORTE E TROUBLESHOOTING**

### **Comandos Úteis:**

```bash
# Ver todas configurações
git config --list --show-origin

# Limpar credenciais armazenadas
git config --global --unset-all credential.helper

# Testar conexão
ssh -vT git@github.com

# Ver logs de autenticação
GIT_TRACE=1 git push origin main
```

### **Se nada funcionar:**

1. **Verifique se o token não expirou**
2. **Confirme se tem as permissões corretas**
3. **Teste com outro repositório**
4. **Verifique firewall/proxy**
5. **Use SSH como alternativa**

---

**💡 Dica:** Sempre teste a autenticação com `git push --dry-run origin main` antes de fazer push real!
