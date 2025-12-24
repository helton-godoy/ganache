# Mapa de Dependências da História

**História Alvo:** `6.3-robustness-log-parsing`  
**Data:** 2025-12-24  
**Status:** Backlog (exemplo para referência)

## 1. Dependências de Código (Entrada)

| Componente/Arquivo | Origem (História/Épico) | Status (Done/WIP) | Criticidade |
| ------------------ | ----------------------- | ----------------- | ----------- |
| `core/ganache-lib/src/security_event_service.rs` | Story 6.1 | Done | Alta |
| Funções: `decode_tty_data`, `parse_samba_audit_log` | Story 6.1 | Done | Alta |
| Tipos: `SecurityEvent`, `AuditLogEntry`, `ParseError` | Story 6.1 | Done | Média |
| `scripts/git-classify.sh` | Story 6.1 | Done | Baixa |

## 2. Impactos (Saída)

| Componente Afetado | Natureza da Mudança | Risco de Quebra |
| ------------------ | ------------------- | --------------- |
| `security_event_service.rs` | Adicionar validações UTF-8 | Baixo (apenas extends) |
| Testes de 6.1 | Pode exigir ajustes se casos novos cobrem mesma área | Médio |
| Story 6.5 (Troubleshooting Guide) | Deve documentar novos edge cases | Baixo |

## 3. Serviços Compartilhados

**Reutilizados (de 6.1):**

- [x] `SecurityEventParser` trait - usar interface existente
- [x] `ParseError` enum - estender com novos error types se necessário
- [x] Tipos base (`AuditLogEntry`, `SecurityEvent`)

**Novos (criados por 6.3):**

- [ ] `validate_utf8_data()` - função helper para validação
- [ ] `SafeParser` wrapper - adiciona fallback para dados malformados

**Regra de Integração:** NÃO reescrever funções de 6.1. Apenas estender com validações extras.

## 4. Plano de Mitigação de Conflitos

**Ações para evitar conflitos:**

- [ ] Revisar código de 6.1 ANTES de iniciar implementação
- [ ] Criar branch a partir de commit que incluiu 6.1
- [ ] Fazer rebase diário com `main` durante desenvolvimento
- [ ] Coordenar testes: adicionar novos casos sem modificar testes existentes de 6.1

**Pontos de sincronização:**

- [ ] Dia 1: Revisar implementação de 6.1, mapear o que já está coberto
- [ ] Dia 2-3: Implementar apenas casos de borda faltantes
- [ ] Dia 4: Code review com foco em não duplicar lógica de 6.1

**Exemplo de Uso deste Template:**

Ao iniciar qualquer história do Épico 6 (ou qualquer épico), copie este template e preencha:

1. Liste arquivos/componentes que outras histórias `done` já modificaram
2. Identifique serviços que você pode reutilizar (não recriar!)
3. Mapeie impactos da sua história em histórias futuras
4. Defina plano para evitar conflitos de merge
