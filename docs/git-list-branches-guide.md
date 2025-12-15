# 🌿 Guia Completo: Listar Branches no Git

## 📋 Comandos Básicos para Listar Branches

### **1. Listar Branches Locais**

```bash
git branch
```

- Mostra apenas as branches locais
- A branch atual é marcada com `*`
- Exemplo de saída:

  ```shell
  * main
    feature/nova-funcionalidade
    bugfix/correcao-erro
  ```

### **2. Listar Todas as Branches (Locais + Remotas)**

```bash
git branch -a
```

- Mostra branches locais e remotas
- Branches remotas são prefixadas com `remotes/`
- Exemplo de saída:

  ```
  * main
    feature/nova-funcionalidade
    bugfix/correcao-erro
    remotes/origin/main
    remotes/origin/develop
    remotes/origin/feature/nova-funcionalidade
  ```

### **3. Listar Apenas Branches Remotas**

```bash
git branch -r
```

- Mostra apenas branches remotas
- Útil para ver o que está disponível no repositório remoto
- Exemplo de saída:

  ```
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/develop
  ```

## 🔍 Comandos Avançados

### **4. Listar Branches com Informações Detalhadas**

```bash
git branch -vv
```

- Mostra branches locais com informações adicionais:
  - Último commit
  - Branch que está seguindo
  - Se está ahead/behind da branch remota

### **5. Listar Branches Remotas com Detalhes**

```bash
git branch -rv
```

- Mostra branches remotas com informações do último commit

### **6. Listar Branches por Autor**

```bash
git branch --author="nome-do-autor"
```

- Filtra branches por autor do último commit

### **7. Listar Branches Mescladas**

```bash
git branch --merged
```

- Mostra branches que já foram mescladas na branch atual

### **8. Listar Branches Não Mescladas**

```bash
git branch --no-merged
```

- Mostra branches que ainda não foram mescladas

## 🎯 Comandos com Formatação

### **9. Listar Branches com Formato Personalizado**

```bash
git branch --format="%(refname:short) - %(contents:subject)"
```

- Mostra apenas nome da branch e último commit

### **10. Listar Branches em Formato JSON**

```bash
git branch --json
```

- Saída em formato JSON (útil para scripts)

## 📊 Comandos de Status e Merging

### **11. Verificar Status de Merging**

```bash
git branch --contains <commit-hash>
```

- Mostra branches que contêm um commit específico

### **12. Verificar Branches com Unmerged Changes**

```bash
git branch --no-merged --all
```

- Mostra branches com mudanças não mescladas (incluindo remotas)

## 🔄 Comandos com Remotes

### **13. Listar Branches de um Remote Específico**

```bash
git branch -r --list "origin/*"
```

- Lista apenas branches do remote `origin`

### **14. Listar Branches por Padrão**

```bash
git branch --list "feature/*"
```

- Lista branches que começam com `feature/`

## 🚀 Comandos com Filtering

### **15. Filtrar por Data de Último Commit**

```bash
git branch --sort=-committerdate
```

- Lista branches ordenadas por data do último commit (mais recentes primeiro)

### **16. Filtrar por Nome de Branch**

```bash
git branch --list "*feature*"
```

- Lista branches que contêm "feature" no nome

## 📱 Comandos para Interface Visual

### **17. Mostrar Gráfico de Branches**

```bash
git log --oneline --graph --decorate --all
```

- Mostra visualização gráfica de todas as branches e commits

### **18. Tree de Branches**

```bash
git show-branch --all
```

- Mostra tree de branches com ancestralidade

## 🛠️ Comandos Úteis para Debugging

### **19. Verificar Branch Atual**

```bash
git branch --show-current
```

- Mostra apenas o nome da branch atual

### **20. Verificar Branch Padrão**

```bash
git symbolic-ref refs/remotes/origin/HEAD
```

- Mostra qual é a branch padrão do remote

## 📋 Resumo de Casos de Uso

| Comando | Quando Usar |
|---------|-------------|
| `git branch` | Listar branches locais rapidamente |
| `git branch -a` | Ver branches locais + remotas |
| `git branch -r` | Ver apenas branches remotas |
| `git branch -vv` | Ver status detalhado das branches |
| `git branch --merged` | Identificar branches para deletar |
| `git branch --no-merged` | Ver branches com trabalho pendente |
| `git branch -a --sort=-committerdate` | Ver branches mais recentes |
| `git log --oneline --graph --all` | Visualizar histórico visual |

## 💡 Dicas Importantes

1. **Branches Locais vs Remotas:**
   - Locais: criadas no seu repositório
   - Remotas: existem apenas no repositório remoto

2. **Atualizar Lista de Branches Remotas:**

   ```bash
   git fetch --all
   ```

3. **Navegação entre Branches:**

   ```bash
   git checkout nome-da-branch
   # ou (Git 2.23+)
   git switch nome-da-branch
   ```

4. **Criar Nova Branch:**

   ```bash
   git branch nova-branch
   git checkout nova-branch
   # ou
   git checkout -b nova-branch
   ```

## 🚨 Erros Comuns

- **"No branch"**: Use `git branch` para verificar branches existentes
- **"Remote branch not found"**: Execute `git fetch` para atualizar branches remotas
- **"Multiple branch match"**: Use nome completo da branch para evitar ambiguidade

---

**💡 Para mais informações:** Consulte `git branch --help` ou a [documentação oficial do Git](https://git-scm.com/docs/git-branch)
