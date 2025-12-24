# Framework de Diretrizes de Integração de Histórias (Story 6.2)

## 1. Visão Geral

Este framework define os padrões para integrar múltiplas histórias no projeto GANACHE, com foco específico na prevenção de sobreposição e garantia de consistência arquitetural.

## 2. Análise de Sobreposição (Épico 6)

### 2.1 Histórias Analisadas

- **6.1 (Done):** Otimização de Revisão Adversarial. Introduziu `analyze-review-readiness.sh`, `suggest-fixes.sh` e melhorias de log parsing.
- **6.2 (Current):** Diretrizes de Integração.
- **6.3 (Backlog):** Robustez de Log Parsing.
- **6.4 (Backlog):** Testes SSR.
- **6.6 (Backlog):** Geração de Docs.

### 2.2 Áreas de Conflito Identificadas

- **Log Parsing (6.1 vs 6.3):** A história 6.1 já implementou melhorias significativas em `security_event_service.rs` e `decode_tty_data`.
  - *Mitigação:* A história 6.3 deve focar **apenas** em casos de borda não cobertos por 6.1, ou ser marcada como parcialmente concluída/reduzida durante o planejamento.
- **Scripts de Validação:** A proliferação de scripts (`git-classify.sh`, `analyze-review-readiness.sh`) requer consolidação.

## 3. Padrões de Serviços Compartilhados

### 3.1 Princípios

- **Responsabilidade Única:** Cada serviço deve fazer uma coisa bem feita.
- **Contratos Claros:** Todo serviço compartilhado deve ter interface definida (Trait em Rust, Types em TS).
- **Sem Estado Compartilhado:** Evitar estado mutável global.

### 3.2 Limites de Responsabilidade

- **Rust Core:** Lógica de negócios, acesso ao sistema, segurança.
- **Frontend:** Visualização e interatividade apenas. NUNCA lógica de negócios crítica.
- **Scripts:** Automação de fluxo de trabalho e verificação.

## 4. Modelo de Comunicação

### 4.1 Entre Histórias

- Utilize **Issues** ou **Comentários de Código** (`@ref Story-ID`) para marcar dependências.
- Bloqueio explícito: Não inicie histórias dependentes até que a "Mãe" esteja `done` ou tenha commits estáveis.

## 5. Processo de Coordenação

### 5.1 Checklist de Integração

1. [ ] Verificar se componentes novos duplicam existentes.
2. [ ] Validar compatibilidade com `project-context.md`.
3. [ ] Executar testes de regressão completos.

### 5.2 Resolução de Conflitos

- Se duas histórias tocarem no mesmo arquivo, o **rebase** deve ser feito diariamente.
- Prioridade: Correções de segurança (P0) > Features (P1) > Docs (P2).

## 6. Ferramentas de Suporte

- `scripts/integration-validator.sh`: Verifica a estrutura básica de integração.
- `docs/dependency-mapping-template.md`: Template para mapear dependências antes do desenvolvimento.
