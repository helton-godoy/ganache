# História 6.1: otimizar-processo-de-revisao-adversarial

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## História

Como uma Equipe de Desenvolvimento,
Desejamos que o processo de revisão adversarial de código seja mais eficiente,
Para que possamos alcançar alta qualidade com menos rodadas de revisão.

## Critérios de Aceitação

1. Dado uma mudança de código pronta para revisão
Quando o processo de revisão adversarial é executado
Então ele deve identificar problemas de forma mais eficaz na primeira passagem
E fornecer sugestões automatizadas para correções comuns
E reduzir o número médio de iterações de revisão por história

## Tarefas / Subtarefas

- [x] Analisar a implementação atual do processo de revisão adversarial e identificar gargalos
  - [x] Revisar o fluxo de trabalho e checklist de revisão de código existentes
  - [x] Analisar dados da retrospectiva do Epic 5 para feedback do processo de revisão
  - [x] Identificar padrões comuns de problemas que causam múltiplas rodadas de revisão
- [x] Implementar sistema de detecção automática de problemas e sugestões
  - [x] Criar verificações automatizadas para anti-padrões comuns (ex.: falta de tratamento de erros, problemas de segurança)
  - [x] Integrar com git hooks existentes (`pre-commit`, `pre-push`) e scripts de validação
  - [x] Adicionar motor de sugestões para correções padrão
  - [ ] Melhorar a robustez das funções de parsing de logs para logs de segurança e auditoria
- [ ] Atualizar diretrizes e treinamento de revisão adversarial
  - [ ] Documentar fluxo de processo otimizado
  - [ ] Criar materiais de treinamento para a equipe de desenvolvimento
  - [ ] Estabelecer métricas para medir a eficiência do processo (ex.: reduzir iterações médias de revisão de 3 para 1)
- [ ] Integrar com pipeline de CI/CD
  - [ ] Garantir que verificações automatizadas sejam executadas no pipeline de CI/CD
  - [ ] Validar integração com fluxos de trabalho existentes (ex.: `bmad-validate.sh`)
- [ ] Testar e validar o processo otimizado
  - [ ] Executar revisões piloto usando o novo processo
  - [ ] Medir redução nas iterações de revisão
  - [ ] Coletar feedback da equipe e iterar

## Notas de Desenvolvimento

- Padrões e restrições de arquitetura relevantes: Seguir a arquitetura do fluxo de trabalho BMAD, integrar com git hooks existentes (`pre-commit`, `pre-push`), utilizar `bmad-validate.sh` para verificações automatizadas
- Componentes da árvore de origem a serem modificados: _bmad/bmm/workflows/4-implementation/code-review/, scripts/git-classify.sh, scripts/bmad-validate.sh
- Resumo dos padrões de teste: Incluir testes unitários para novas verificações automatizadas, testes de integração com fluxo de trabalho git, medir métricas de processo (ex.: redução nas iterações de revisão)
- Requisitos de estrutura de arquivos: Manter padrões de documentação BMAD, atualizar docs/ com novas diretrizes, garantir documentação semântica para geração automatizada
- Integração com CI/CD: Garantir que verificações automatizadas sejam executadas no pipeline de CI/CD e validar integração com fluxos de trabalho existentes

### Project Structure Notes

- Alignment with unified project structure: Follow project-context.md rules, use conventional commits, maintain SSoT in docs/
- Detected conflicts or variances: Ensure compatibility with existing Rust/TypeScript stack, no introduction of new dependencies without architecture approval

### References

- [Source: docs/epics.md#Story-6.1] - Original story requirements
- [Source: project-context.md#8.0-Githooks-Inteligentes] - Existing git hooks integration
- [Source: _bmad/bmm/workflows/4-implementation/code-review/checklist.md] - Current review checklist
- [Source: docs/sprint-artifacts/epic-5-retro-2025-12-24.md] - Retrospective insights for optimization

## Registro do Agente de Desenvolvimento

### Modelo do Agente Utilizado

x-ai/grok-code-fast-1

### Referências de Log de Depuração

### Lista de Notas de Conclusão

- Gerado contexto abrangente da história usando o método BMAD
- Analisados épicos, arquitetura e contexto do projeto para orientação completa do desenvolvedor
- Incluídas referências específicas de arquivos e pontos de integração
- Preparado para otimização do processo de revisão adversarial
- Consultados insights da retrospectiva do Epic 5 para otimização
- Aplicadas melhorias com base nos insights da retrospectiva do Epic 5

### Notas de Desenvolvimento - Análise (2025-12-24)

- **Análise do Processo Atual:** O processo atual depende de checklists manuais. Falta automação prévia.
- **Padrões Identificados:** Regressões, tratamento de erros em logs complexos, e documentação semântica incompleta.

### Notas de Desenvolvimento - Implementação (2025-12-24)

- **Script de Auditoria:** Criado `scripts/analyze-review-readiness.sh` para verificar:
  - Presença de TODO/FIXME (Bloqueante para revisão).
  - Consistência com File List (Bloqueante).
- **Integração:** Adicionado check "Adversarial Readiness" no `scripts/git-classify.sh`, alertando desenvolvedores sobre problemas antes do commit.
- **Testes:** Criado harness em `tests/scripts/test_analyze_review_readiness.sh`.

### Notas de Desenvolvimento - Motor de Sugestões (2025-12-24)

- **Script Implementado:** `scripts/suggest-fixes.sh` com 4 categorias de verificação:
  - Error Handling: Detecta `.unwrap()` e `.expect()` em Rust
  - TODOs/FIXMEs: Identifica comentários pendentes e sugere resolução
  - Test Coverage: Verifica presença de testes (inline ou arquivos separados)
  - Security: Detecta hardcoded secrets e SQL injection risks
- **Integração:** Adicionado ao `git-classify.sh --validate` como Step 6
- **Testes:** 5/5 testes passando em `tests/scripts/test_suggestion_engine.sh`
- **Impacto:** Desenvolvedores agora recebem sugestões automatizadas antes de commits

### File List

- scripts/analyze-review-readiness.sh
- scripts/git-classify.sh
- scripts/suggest-fixes.sh
- tests/scripts/test_analyze_review_readiness.sh
- tests/scripts/test_suggestion_engine.sh
