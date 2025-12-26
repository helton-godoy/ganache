# Scripts de Validação Anti-Alucinação

Este diretório contém scripts **OBRIGATÓRIOS** para prevenir alucinações de agentes de IA sobre operações Git.

## 🚨 Script Primário (DEVE SER EXECUTADO)

### force-agent-compliance.sh

**Uso OBRIGATÓRIO antes de afirmar sucesso:**

```bash
./scripts/force-agent-compliance.sh
```

**O que faz:**

- ✅ Verifica se há arquivos staged (BLOQUEIA se houver)
- ✅ Verifica se há commits recentes (BLOQUEIA se não houver)
- ✅ Valida working tree
- ✅ Mostra resumo final

**Exit Codes:**

- `0`: ✅ Passou - PODE afirmar sucesso
- `1`: ❌ Falhou - **NÃO PODE** afirmar sucesso

**Quando executar:**

- SEMPRE antes de dizer "commitei X mudanças"
- SEMPRE antes de dizer "repositório está limpo"
- SEMPRE antes de marcar tarefas como concluídas
- SEMPRE antes de afirmar "pode prosseguir"

---

## 🔧 Scripts Auxiliares

### agent-commit-guard.sh

Validação com expectativa específica de commits:

```bash
./scripts/agent-commit-guard.sh --task "Nome Tarefa" --expected-commits N
```

### verify-commit-reality.sh

Verificação de realidade (mais simples):

```bash
./scripts/verify-commit-reality.sh [expected_count]
```

### commit-with-verification.sh

Wrapper que substitui `git commit` com verificação automática:

```bash
./scripts/commit-with-verification.sh -m "mensagem"
```

### git-classify.sh

Classificação de mudanças pendentes:

```bash
./scripts/git-classify.sh [--validate] [--fix] [--interactive]
```

---

## 📋 Workflow Obrigatório para Agentes

```bash
# 1. Classificar mudanças
./scripts/git-classify.sh

# 2. Fazer commits atômicos
git add categoria1/
git commit -m "tipo(escopo): descrição"

git add categoria2/
git commit -m "tipo(escopo): descrição"

# 3. ANTES DE AFIRMAR SUCESSO: VALIDAR (OBRIGATÓRIO!)
./scripts/force-agent-compliance.sh

# Se passou (exit 0): AGORA pode afirmar
# Se falhou (exit 1): FAZER commits e repetir passo 3
```

---

## ⚠️ Casos de Alucinação Detectados

### Caso 1: Staged files não commitados

**Alucinação:**

> "Commitei 4 mudanças atômicas e o repositório está limpo"

**Realidade:**

```bash
$ git status --short
# 18 arquivos staged

$ git log --oneline --since="1 hour ago"
# (vazio)
```

**Script detectou:**

```bash
$ ./scripts/force-agent-compliance.sh
🚫 BLOQUEIO ABSOLUTO
Existem 18 arquivos STAGED aguardando commit!
VOCÊ AFIRMOU TER COMMITADO, MAS NÃO COMMITOU NADA!
exit 1
```

### Caso 2: Afirmação de execução sem evidências

**Alucinação:**

> "Executei ./scripts/verify-commit-reality.sh e está tudo limpo"

**Realidade:**

- Script nunca foi executado (sem output)
- Arquivos ainda staged

**Prevenção:**

- Agente DEVE capturar e mostrar output do script
- Sem output = não executou = alucinação

---

## 🛡️ Garantias do Sistema

Quando os scripts são executados corretamente:

✅ **100% de detecção** de alucinações sobre commits  
✅ **Bloqueio total** se commits não foram feitos  
✅ **Impossível burlar** (exit codes, outputs visuais)  
✅ **Evidências verificáveis** (outputs podem ser auditados)

---

## 📖 Documentação Completa

Ver: [`project-context.md` - Seção 9.4](../project-context.md)
