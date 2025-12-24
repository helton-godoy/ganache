# Mapa de Dependências da História

**História Alvo:** `[ID-Review]`  
**Data:** `[YYYY-MM-DD]`  
**Status:** `[Backlog/Ready-for-Dev]`

## 1. Dependências de Código (Entrada)

| Componente/Arquivo | Origem (História/Épico) | Status (Done/WIP) | Criticidade |
| ------------------ | ----------------------- | ----------------- | ----------- |
| `path/to/file` | Story X.Y | Done | Alta/Média/Baixa |

## 2. Impactos (Saída)

| Componente Afetado | Natureza da Mudança | Risco de Quebra |
| ------------------ | ------------------- | --------------- |
| `path/to/file` | Descrição da mudança | Alto/Médio/Baixo |

## 3. Serviços Compartilhados

**Reutilizados:**

- [ ] `ServiceName` trait - usar interface existente
- [ ] `TypeName` - reutilizar tipos base

**Novos (criados por esta história):**

- [ ] `FunctionName()` - descrição
- [ ] `ServiceName` - descrição

**Regra de Integração:** NÃO reescrever funções existentes. Apenas estender com validações extras ou novos métodos.

## 4. Plano de Mitigação de Conflitos

**Ações para evitar conflitos:**

- [ ] Revisar código das dependências ANTES de iniciar implementação
- [ ] Criar branch a partir de commit estável
- [ ] Fazer rebase diário com `main`
- [ ] Coordenar testes: adicionar novos casos sem modificar testes existentes

**Exemplo de Uso deste Template:**

Consulte `docs/examples/dependency-mapping-example.md` para ver um preenchimento real.
