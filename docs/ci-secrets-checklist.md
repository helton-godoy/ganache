# CI/CD Secrets Checklist

## 📝 Visão Geral

Este documento lista todos os secrets e variáveis de ambiente necessários para o pipeline CI/CD do GANACHE funcionar corretamente.

---

## ✅ Secrets Atualmente Necessários

### Nenhum Secret Obrigatório No Momento

O pipeline CI/CD atual não requer nenhum secret configurado. Os testes executam contra ambiente local (<http://localhost:3000>) iniciado pelo próprio Playwright.

---

## 🔒 Secrets Opcionais (Futuras Melhorias)

### 1. SLACK_WEBHOOK (Notificações)

**Propósito**: Enviar notificações para o Slack quando testes falharem

**Como Obter**:

1. Acesse Slack App Directory
2. Procure por "Incoming Webhooks"
3. Adicione ao seu workspace
4. Copie a Webhook URL

**Como Configurar no GitHub**:

1. Vá para Settings > Secrets and variables > Actions
2. Clique em "New repository secret"
3. Nome: `SLACK_WEBHOOK`
4. Value: Cole a webhook URL
5. Clique em "Add secret"

**Uso no Workflow**:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "Test failures detected in PR #${{ github.event.pull_request.number }}"
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

### 2. DISCORD_WEBHOOK (Notificações Alternativas)

**Propósito**: Enviar notificações para Discord

**Como Obter**:

1. Vá para Server Settings > Integrations > Webhooks
2. Clique em "New Webhook"
3. Configure nome e canal
4. Copie a Webhook URL

**Como Configurar**: Mesmo processo do SLACK_WEBHOOK

---

### 3. BASE_URL (Ambiente de Teste)

**Propósito**: URL base para executar testes contra ambiente staging/produção

**Valores Sugeridos**:

- Local: `http://localhost:3000` (padrão)
- Staging: `https://staging.ganache.example.com`
- Production: `https://ganache.example.com`

**Como Configurar**:

- Para variável pública: Use `env:` no workflow
- Para secret: Configure como repository secret

**Uso no Workflow**:

```yaml
- name: Run E2E tests
  run: npx playwright test
  env:
    BASE_URL: ${{ secrets.STAGING_BASE_URL }}
```

---

### 4. API_KEY / API_SECRET (Autenticação de API)

**Propósito**: Credenciais para testar APIs autenticadas

**Como Configurar**:

- Nome: `API_KEY`, `API_SECRET`
- Value: Credenciais obtidas do time backend

**Uso nos Testes**:

```typescript
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  },
},
```

---

## 🔐 Best Practices de Segurança

### ✅ O que Fazer

- [ ] **Rotacione secrets regularmente** (a cada 90 dias)
- [ ] **Use secrets para dados sensíveis** (nunca hardcode)
- [ ] **Documente secrets necessários** (este arquivo)
- [ ] **Principle of least privilege** (mínimo acesso necessário)
- [ ] **Audit secret usage** (revise logs regularmente)

### ❌ O que NÃO Fazer

- ❌ **NUNCA** commite secrets no código
- ❌ **NUNCA** logue secrets em console/artifacts
- ❌ **NUNCA** compartilhe secrets via Slack/email
- ❌ **NUNCA** use secrets de produção em testes

---

## 🛠️ Como Configurar Secrets no GitHub

### Via UI

1. Vá para o repositório no GitHub
2. Settings > Secrets and variables > Actions
3. Clique em "New repository secret"
4. Preencha nome e valor
5. Clique em "Add secret"

### Via GitHub CLI

```bash
# Instale gh CLI se ainda não tiver
# https://cli.github.com/

# Adicione um secret
gh secret set SECRET_NAME

# Será solicitado a digitar o valor
# Ou use: echo "secret-value" | gh secret set SECRET_NAME

# Liste secrets existentes (valores ficam ocultos)
gh secret list

# Delete um secret
gh secret delete SECRET_NAME
```

---

## 📊 Checklist de Verificação

Antes de fazer deploy de mudanças no CI/CD, verifique:

### Secrets Configurados

- [ ] Todos os secrets obrigatórios estão configurados?
- [ ] Secrets estão acessíveis no workflow correto?
- [ ] Nenhum secret está hardcoded no código?

### Variáveis de Ambiente

- [ ] `BASE_URL` configurado para ambiente correto?
- [ ] `CI=true` detectado automaticamente no GitHub Actions?
- [ ] Variáveis documentadas no README ou neste arquivo?

### Acesso e Permissões

- [ ] Time tem acesso aos secrets necessários?
- [ ] Secrets de produção NÃO estão em CI?
- [ ] Repository secrets vs Environment secrets claramente definidos?

---

## 🔍 Troubleshooting

### Secret não encontrado no workflow

**Erro**:

```
Error: The secret `SLACK_WEBHOOK` is not set
```

**Solução**:

1. Verifique se o secret existe: Settings > Secrets
2. Verifique o nome está correto (case-sensitive)
3. Verifique se está usando `${{ secrets.SLACK_WEBHOOK }}`

### Secret exposto em logs

**Problema**: Secret apareceu no console output

**Solução Imediata**:

1. REVOGUE o secret imediatamente
2. Gere novo secret e reconfigure
3. Delete os workflow run logs antigos

**Prevenção**:

```yaml
# GitHub automaticamente masca secrets nos logs
# Mas evite logar variáveis que podem conter secrets
- name: Debug (safe)
  run: echo "Running tests..."

# NUNCA faça isso:
- name: Debug (UNSAFE!)
  run: echo ${{ secrets.API_KEY }} # ❌ NUNCA!
```

---

## 📚 Recursos Adicionais

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using Secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

---

**Última atualização**: 24 de dezembro de 2024  
**Mantido por**: Time GANACHE
