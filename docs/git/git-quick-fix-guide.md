# 🚀 Guia de Início Rápido: Corrigir Erro Git

## ⚡ Solução Rápida em 3 Passos

### **PASSO 1: Diagnóstico Rápido**

```bash
# Execute no terminal integrado do VS Code (Ctrl+`)
pwd && ls -la .git && git status
```

### **PASSO 2: Ação Corretiva (escolha uma)**

#### Se o diretório `.git` NÃO existe

```bash
git init
git add .
git commit -m "Commit inicial"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

#### Se o `.git` existe mas `git status` falha

```bash
# Verificar permissões
sudo chown -R $USER:$USER .git
chmod -R 755 .git

# Verificar integridade
git fsck --full
```

#### Se o repositório funciona, mas plugin falha

```bash
# Recarregar VS Code
# Ctrl+Shift+P → "Developer: Reload Window"

# Verificar configurações Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### **PASSO 3: Teste Final**

```bash
git status
git add .
git commit -m "Teste"
git push
```

## 🎯 Comandos de Verificação Imediata

```bash
# Verificar se está no diretório correto
pwd
# Deve mostrar o caminho do seu projeto

# Verificar se é repositório Git
ls -la | grep .git
# Deve mostrar 'drwxr-xr-x ... .git'

# Testar comando Git
git status
# Deve mostrar status do repositório (não erro)

# Verificar configuração
git config --list | grep user
# Deve mostrar name e email
```

## 🚨 Soluções para Casos Específicos

### **Caso A: "Nenhum repositório Git encontrado"**

```bash
# Navegar para o diretório correto
cd /caminho/para/seu/projeto
git init
```

### **Caso B: "Permission denied"**

```bash
# Corrigir permissões
sudo chown -R $(whoami) .
chmod -R 755 .git
```

### **Caso C: "Plugin VS Code não funciona"**

1. **Recarregar VS Code:** `Ctrl+Shift+P` → "Reload Window"
2. **Verificar configurações:** `Ctrl+,` → Extensions → GitCOM
3. **Reinstalar plugin:** Extensions → GitCOM → Uninstall → Install

### **Caso D: "Remote não configurado"**

```bash
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

## 📱 Comandos de Emergência

```bash
# Script de diagnóstico automático
./scripts/git-diagnosis.sh

# Verificar se VS Code está no diretório certo
code .

# Forçar re-detecção do Git pelo VS Code
# Ctrl+Shift+P → "Git: Restart Extension Host"
```

## 🔍 Checklist de Verificação

- [ ] Estou no diretório correto do projeto?
- [ ] O diretório `.git` existe?
- [ ] `git status` funciona sem erro?
- [ ] User.name e user.email estão configurados?
- [ ] Remote origin está configurado?
- [ ] Plugin GitCOM está habilitado?
- [ ] VS Code foi recarregado recentemente?

## 💡 Dica Final

Se nada funcionar, execute este comando para verificar logs:

```bash
# No terminal externo (não integrado do VS Code)
cd /caminho/para/seu/projeto
git push -v origin main
```

O erro mostrará informações mais detalhadas que ajudarão no diagnóstico!
