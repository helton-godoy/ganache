# Guia de Solução: Erro "fatal: not a git repository"

## 🔍 Diagnóstico do Problema

O erro **"Failed to push commits: fatal: not a git repository"** indica que o Git não consegue identificar o diretório atual como um repositório Git válido. Isso pode acontecer por várias razões.

## 🚨 Principais Causas do Erro

### 1. **Diretório não inicializado como repositório Git**
   - O diretório nunca foi inicializado com `git init`
   - O diretório `.git` foi corrompido ou removido

### 2. **Problemas de configuração do workspace no VS Code**
   - VS Code pode estar operando em um diretório diferente do esperado
   - Plugin GitCOM pode estar configurado incorretamente

### 3. **Conflitos de caminhos**
   - Working directory incorreto no terminal integrado
   - Múltiplas instâncias do VS Code com workspaces diferentes

### 4. **Problemas de permissões**
   - Diretório `.git` com permissões incorretas
   - Usuário sem acesso ao repositório

## 🔧 Verificações e Soluções

### **Passo 1: Verificar se é um repositório Git**

Execute estes comandos no terminal integrado do VS Code:

```bash
# Verificar diretório atual
pwd

# Listar arquivos, incluindo ocultos
ls -la

# Verificar se existe o diretório .git
ls -la | grep .git

# Verificar status do Git
git status
```

### **Passo 2: Soluções por Cenário**

#### **Cenário A: Diretório não inicializado**

```bash
# Inicializar repositório Git
git init

# Configurar branch principal (se necessário)
git branch -M main

# Adicionar arquivo inicial (obrigatório para primeiro commit)
echo "# Meu Projeto" > README.md
git add README.md
git commit -m "Commit inicial"

# Adicionar remote origin (substitua pela sua URL)
git remote add origin https://github.com/usuario/repositorio.git

# Configurar branch upstream
git push -u origin main
```

#### **Cenário B: Diretório .git corrompido**

```bash
# Verificar integridade do repositório
git fsck --full

# Se corrupto, restaurar de backup (se disponível)
# OU recriar repositório:
rm -rf .git
git init
git add .
git commit -m "Recriação do repositório"
```

#### **Cenário C: Problema de configuração do VS Code**

1. **Verificar workspace atual:**
   - `Ctrl+Shift+P` → "Git: Status"
   - Verificar se está no diretório correto

2. **Recarregar janela do VS Code:**
   - `Ctrl+Shift+P` → "Developer: Reload Window"

3. **Configurar path do Git no VS Code:**
   - `Ctrl+,` → Configurações
   - Procurar por "git.path"
   - Definir caminho explícito para o executável Git

#### **Cenário D: Working directory incorreto**

```bash
# Navegar para o diretório correto
cd /caminho/para/seu/projeto

# Verificar se está no local correto
pwd
git status

# Se necessário, abrir VS Code no diretório correto
code /caminho/para/seu/projeto
```

### **Passo 3: Verificações Avançadas**

```bash
# Verificar configuração do Git
git config --list --local

# Verificar remotes configurados
git remote -v

# Verificar branch atual e remota
git branch -vv

# Verificar se há commits
git log --oneline -5

# Verificar se há mudanças não commitadas
git diff --stat
```

## ⚙️ Configurações do Plugin GitCOM

### **Configurações Recomendadas:**

1. **Verificar configurações do plugin:**
   - Settings → Extensions → GitCOM
   - Confirmar que o path do Git está correto
   - Verificar configurações de autenticação

2. **Configurações do Git global:**
   ```bash
   git config --global user.name "Seu Nome"
   git config --global user.email "seu.email@exemplo.com"
   git config --global core.editor "code --wait"
   ```

3. **Configurações de autenticação:**
   ```bash
   # Para HTTPS
   git config --global credential.helper store
   
   # Ou usar SSH
   git config --global url."git@github.com:".insteadOf "https://github.com/"
   ```

## 🚨 Armadilhas Comuns

### **1. Diretório errado no VS Code**
- **Problema:** VS Code aberto em diretório pai ou子公司
- **Solução:** Verificar workspace atual e abrir projeto correto

### **2. Arquivo .gitignore incorreto**
- **Problema:** Diretório `.git` sendo ignorado
- **Solução:** Verificar se `.git` não está no `.gitignore`

### **3. Permissões de arquivo**
- **Problema:** Usuário sem acesso ao diretório `.git`
- **Solução:** 
  ```bash
  sudo chown -R $USER:$USER .git
  chmod -R 755 .git
  ```

### **4. Submódulos problemáticos**
- **Problema:** Submódulos com problemas
- **Solução:** 
  ```bash
  git submodule status
  git submodule update --init --recursive
  ```

### **5. Proxy/firewall bloqueando**
- **Problema:** Configurações de rede impedindo push
- **Solução:** Verificar configurações de proxy Git
  ```bash
  git config --global http.proxy http://proxy:porta
  git config --global https.proxy https://proxy:porta
  ```

## 🔄 Fluxo de Verificação Sistemática

1. **Verificar diretório atual:** `pwd && git status`
2. **Confirmar repositório Git:** `ls -la .git/`
3. **Verificar configurações:** `git config --list`
4. **Testar comandos básicos:** `git log`, `git branch`
5. **Verificar remote:** `git remote -v`
6. **Testar push manual:** `git push origin main`
7. **Verificar plugin VS Code:** Settings e reload

## 📞 Suporte Adicional

Se o problema persistir após todas estas verificações:

1. **Recriar workspace do VS Code:**
   - Fechar VS Code
   - Deletar `.vscode/settings.json`
   - Reabrir projeto

2. **Reinstalar plugin GitCOM:**
   - Desinstalar plugin
   - Reinstalar via Extensions

3. **Verificar logs do VS Code:**
   - `Ctrl+Shift+P` → "Developer: Toggle Developer Tools"
   - Verificar Console para erros

4. **Testar com Git externo:**
   ```bash
   # Testar comandos Git diretamente no terminal
   git push -v origin main
   ```

---

**💡 Dica:** Sempre mantenha backup do seu código antes de fazer alterações drásticas no repositório Git!