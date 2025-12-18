# Code Review: Story 2.3 - 90% Hard Quota Enforcement

**Status:** REJECTED (Requires rework)
**Reviewer:** Amelia (Senior Dev Agent)
**Date:** 2025-12-18

## Resumo da Revisão

A implementação da Story 2.3 apresenta falhas críticas tanto no cumprimento dos Critérios de Aceitação (AC) quanto na adesão ao processo de desenvolvimento BMM. Embora a estrutura básica de backend e frontend exista, funcionalidades essenciais de alerta e consistência de dados estão ausentes.

## Problemas Identificados (7)

### 1. Violação de Processo BMM (CRITICAL)

- **Local:** `docs/sprint-artifacts/2-3-90-hard-quota-enforcement.md`
- **Descrição:** A história foi movida para `review` no `sprint-status.yaml`, mas todas as tarefas (Tasks/Subtasks) estão marcadas como vazias `[ ]`.
- **Impacto:** Impossibilidade de rastrear o progresso real e quebra de governança do projeto.

### 2. Ausência de Alerta Crítico (HIGH)

- **Local:** `src/components/features/dashboard/status-dashboard.tsx`
- **Descrição:** O AC #2 exige que o Middleware dispare um "alerta crítico no Dashboard" ao atingir o limite. Atualmente, apenas a cor da barra muda para `amber-100`.
- **Impacto:** O administrador não é notificado proativamente sobre a exaustão da quota, violando o requisito funcional.

### 3. Falha na Lógica de Cálculo de Quota (MEDIUM)

- **Local:** `core/ganache-lib/src/system/zfs.rs` - `calculate_90_percent`
- **Descrição:** A função assume que o sufixo é sempre de 1 caractere (`size_str.len() - 1`). Se o ZFS retornar valores em MB ou sem sufixo, o cálculo falhará ou retornará erro de parse.
- **Impacto:** Fragilidade em ambiente de produção com diferentes formatos de saída do ZFS.

### 4. Inconsistência na Aplicação de Quota (MEDIUM)

- **Local:** `core/ganache-lib/src/system/zfs.rs` - `create_pool`
- **Descrição:** A função calcula a quota mas nunca invoca `apply_quota`. O AC #1 exige a aplicação via `zfs set quota`.
- **Impacto:** Novos pools criados durante o runtime do sistema não terão a quota aplicada até o próximo reboot (onde o `enforce_quotas_on_all_pools` do `main.rs` atuaria).

### 5. Cálculo Matemático Inseguro no Frontend (MEDIUM)

- **Local:** `src/components/features/dashboard/status-dashboard.tsx`
- **Descrição:** O cálculo de `usagePercent` usa `parseFloat` em strings como "8G" e "18.0G". Se as unidades divergirem (ex: KB vs GB), o dashboard exibirá dados errados.
- **Impacto:** Erro de visualização de capacidade.

### 6. Tratamento de Erro Silencioso no Boot (LOW)

- **Local:** `core/ganache-core/src/main.rs`
- **Descrição:** O comando `let _ = enforce_quotas_on_all_pools().await;` ignora silenciosamente falhas na aplicação de quotas durante o boot.
- **Impacto:** Redução na confiabilidade do appliance core.

### 7. Teste E2E Incompleto (HIGH)

- **Local:** `tests/e2e/storage-quota.spec.ts`
- **Descrição:** O teste verifica apenas a existência do badge. Não valida a prevenção de escritas nem o disparo de alertas exigidos pelo AC #2.
- **Impacto:** Cobertura de teste insuficiente para os requisitos mais críticos da história.

## Veredito

**NÃO APROVADO.** O desenvolvedor deve:

1. Sincronizar os status das tarefas no arquivo da história.
2. Implementar o sistema de alertas no Dashboard.
3. Corrigir a fragilidade no cálculo de quotas e unidades.
4. Garantir que `create_pool` aplique a quota imediatamente.
5. Expandir o teste E2E para cobrir os ACs de alerta e erro de escrita.
