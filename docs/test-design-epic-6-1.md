# Test Design - Story 6.1: Optimize Adversarial Review Process

**Epic:** 6 - Quality Process Improvements  
**Story ID:** 6-1-optimize-adversarial-review-process  
**Test Design Date:** 2025-12-24  
**Test Architect:** Murat (TEA Agent)  

---

## Executive Summary

This test design addresses **Story 6.1: Optimize Adversarial Review Process**, which implements automated checks, suggestion engine, robust log parsing, and CI/CD integration to reduce code review iterations.

**Key Risks:**

- 🚨 **3 High-Priority Risks** (Score ≥6): Protocol violations, false positives blocking commits, unvalidated business value
- **4 Medium Risks** (Score 3-4): Test coverage gaps, edge cases, CI triggers
- **1 Low Risk** (Score 1-2): Performance degradation

**Test Coverage:**

- **P0 Tests:** 8 scenarios (critical path validation)
- **P1 Tests:** 12 scenarios (important features)
- **P2 Tests:** 6 scenarios (edge cases)
- **Total Effort:** ~42 hours (~5.5 days)

---

## 1. Risk Assessment Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| **R-001** | TECH | Scripts não detectam todos anti-padrões | 2 | 2 | **4** | Pilot reviews, feedback loop | QA |
| **R-002** | OPS | Falsos positivos bloqueiam commits | 2 | 3 | **6** 🚨 | Bypass workflow, edge case tests | Dev |
| **R-003** | DATA | Parser robusto falha com edge cases | 2 | 2 | **4** | 11 testes robustos, logging | Dev |
| **R-004** | BUS | Métricas não provam melhoria real | 3 | 2 | **6** 🚨 | Pilot reviews, baseline metrics | PM |
| **R-005** | TECH | CI workflow não cobre todos triggers | 2 | 2 | **4** | Smoke test CI triggers | QA |
| **R-006** | SEC | Violação protocolo anti-hallucination | 3 | 3 | **9** 🚨🚨🚨 | Commits obrigatórios, guard script | Dev |
| **R-007** | PERF | Degradação de performance em parsing | 1 | 2 | **2** | Benchmarks de performance | Dev |

### High-Priority Risks (Score ≥6)

1. **R-006 [CRITICAL]**: Protocolo Anti-Hallucination violado - Story BLOQUEADA até commits
2. **R-002**: Falsos positivos podem bloquear desenvolvedores
3. **R-004**: Valor de negócio não comprovado (AC #1)

---

## 2. Acceptance Criteria Breakdown

### AC #1: Identificar problemas de forma mais eficaz na primeira passagem

**Cenários de Teste:**

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-001 | Script detecta TODO/FIXME em commits | E2E | P0 | R-001 |
| T-002 | Script detecta inconsistência com File List | E2E | P0 | R-001 |
| T-003 | Motor de sugestões detecta `.unwrap()` em Rust | Unit | P0 | R-001 |
| T-004 | Motor detecta hardcoded secrets | Unit | P0 | R-001 |
| T-005 | Git hook bloqueia commit com TODO não resolvido | E2E | P1 | R-002 |
| T-006 | Bypass funciona em emergências (`--no-verify`) | E2E | P1 | R-002 |
| T-007 | False positive: permite comentário educacional `// TODO example` | Unit | P2 | R-002 |

**Precondições:**

- Scripts instalados: `analyze-review-readiness.sh`, `suggest-fixes.sh`
- Git hooks instalados via `install-githooks.sh`
- Repositório com mudanças staged

### AC #2: Fornecer sugestões automatizadas para correções comuns

**Cenários de Teste:**

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-008 | Sugestão para `.unwrap()` → `.map_err()` | Unit | P0 | R-001 |
| T-009 | Sugestão para SQL injection risk | Unit | P0 | R-001 |
| T-010 | Sugestão para test coverage ausente | Unit | P1 | R-001 |
| T-011 | Sugestões formatadas em Markdown legível | Unit | P1 | - |
| T-012 | Performance: sugestões retornam em <2s para 100 arquivos | Performance | P2 | R-007 |

**Precondições:**

- `suggest-fixes.sh` instalado
- Arquivos Rust e TypeScript com anti-padrões

### AC #3: Reduzir o número médio de iterações de revisão por história

**Cenários de Teste:**

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-013 | Revisão piloto #1: comparar detecção manual vs. automated | Manual | P0 | R-004 |
| T-014 | Revisão piloto #2: medir tempo de revisão | Manual | P0 | R-004 |
| T-015 | Revisão piloto #3: feedback da equipe sobre eficácia | Manual | P0 | R-004 |
| T-016 | Baseline estabelecido (iterações médias ANTES) | Manual | P1 | R-004 |
| T-017 | Agregação de métricas funciona (script `analyze-review-metrics.sh`) | Unit | P1 | R-004 |

**Precondições:**

- 3 stories anteriores para piloto (sugestão: 5.2, 5.3, 5.4)
- Histórico git com dados de revisões anteriores
- Script de agregação de métricas implementado

---

## 3. Implementation Features Coverage

### Feature 1: Scripts de Automação

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-018 | `analyze-review-readiness.sh` executa sem erros | Unit | P0 | R-001 |
| T-019 | `suggest-fixes.sh` executa sem erros | Unit | P0 | R-001 |
| T-020 | Scripts retornam exit code correto (0=pass, 1=fail) | Unit | P1 | R-001 |
| T-021 | Scripts têm testes próprios (`test_*.sh` passam) | Unit | P1 | - |

**Testes Existentes:**

- ✅ `tests/scripts/test_analyze_review_readiness.sh`
- ✅ `tests/scripts/test_suggestion_engine.sh`

### Feature 2: Melhorias de Parsing Robusto

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-022 | `decode_tty_data` manuseia hex inválido graciosamente | Unit | P0 | R-003 |
| T-023 | `decode_tty_data` manuseia dados vazios | Unit | P0 | R-003 |
| T-024 | `decode_tty_data` usa lossy UTF-8 conversion | Unit | P0 | R-003 |
| T-025 | `parse_samba_audit_log` valida estrutura de 5 partes | Unit | P0 | R-003 |
| T-026 | Parsing de logs não regride (39 testes totais passam) | Unit | P0 | - |
| T-027 | Performance: parse de 1000 logs em <100ms | Performance | P2 | R-007 |

**Testes Existentes:**

- ✅ `core/ganache-lib/tests/robust_log_parsing_tests.rs` (11 novos testes)
- ⚠️ **ACTION REQUIRED:** Executar `cargo test` do diretório correto (action item MEDIUM)

### Feature 3: Integração CI/CD

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-028 | Workflow `.github/workflows/adversarial-review-checks.yml` existe | E2E | P0 | R-005 |
| T-029 | Workflow executa em `push` events | E2E | P0 | R-005 |
| T-030 | Workflow executa em `pull_request` events | E2E | P0 | R-005 |
| T-031 | Workflow reporta warnings no GitHub Actions UI | E2E | P1 | R-005 |
| T-032 | Workflow NÃO bloqueia draft PRs | E2E | P1 | R-005 |
| T-033 | Workflow funciona com force push | E2E | P2 | R-005 |

**Precondições:**

- GitHub Actions habilitado no repositório
- Workflow commitado (⚠️ **BLOCKED**: pending commits - R-006)

---

## 4. Critical Path: Protocol Anti-Hallucination Compliance

| Test ID | Scenario | Test Level | Priority | Risk Link |
| ------- | -------- | ---------- | -------- | --------- |
| T-034 | 🚨 Todos os arquivos implementados foram commitados | Manual | P0 | R-006 |
| T-035 | 🚨 `force-agent-compliance.sh` retorna exit 0 | Manual | P0 | R-006 |
| T-036 | 🚨 ZERO arquivos staged após commits | Manual | P0 | R-006 |
| T-037 | Git log mostra 5+ commits atômicos (não 1 commitão) | Manual | P0 | R-006 |
| T-038 | File List está sincronizada com git changes | Manual | P0 | R-006 |

**⚠️ BLOQUEIO ATUAL:**

- Story 6-1 está **BLOQUEADA** até completar action item "COMMITS PENDENTES"
- 7 arquivos implementados não foram commitados nas últimas 2 horas
- Violação do protocolo `project-context.md` §9.4

**Validação Obrigatória:**

```bash
# Deve executar e passar ANTES de marcar story como done
./scripts/force-agent-compliance.sh
```

---

## 5. Test Execution Strategy

### Smoke Tests (<5 min)

1. **T-018**: Scripts de automação executam sem erro
2. **T-034**: 🚨 Force agent compliance passa
3. **T-026**: Testes Rust não regrediram

### P0 Tests (<15 min)

**Categoria: Detecção de Problemas**

- T-001: TODO/FIXME detection
- T-002: File List consistency
- T-003: Unwrap detection
- T-004: Secret detection

**Categoria: Parsing Robusto**

- T-022: Hex inválido handling
- T-023: Dados vazios handling
- T-024: Lossy UTF-8
- T-025: Samba log structure validation

**Categoria: CI/CD**

- T-028: Workflow exists
- T-029: Push trigger
- T-030: PR trigger

**Categoria: Protocol Compliance** 🚨

- T-034: All files committed
- T-035: Compliance script passes
- T-036: Zero staged files

**Total P0:** 15 tests

### P1 Tests (<30 min)

**Categoria: Sugestões**

- T-008: Unwrap suggestions
- T-009: SQL injection suggestions
- T-010: Test coverage suggestions

**Categoria: Git Hooks**

- T-005: Hooks block TODO commits
- T-006: Bypass works

**Categoria: Métricas (Manual)**

- T-013: Pilot review #1
- T-014: Pilot review #2
- T-015: Pilot review #3
- T-016: Baseline established
- T-017: Metrics aggregation works

**Categoria: CI/CD**

- T-031: Workflow reporting
- T-032: Draft PR handling

**Total P1:** 12 tests

### P2 Tests (<60 min)

**Categoria: Edge Cases**

- T-007: False positive handling
- T-012: Performance suggestions
- T-027: Performance parsing
- T-033: Force push CI trigger
- T-020: Script exit codes
- T-021: Script own tests

**Total P2:** 6 tests

---

## 6. Resource Estimates

### Test Effort Breakdown

| Priority | Scenarios | Avg Time | Total Time |
| -------- | --------- | -------- | ---------- |
| **P0** | 15 tests | 1.5 hours | **22.5 hours** |
| **P1** | 12 tests | 1 hour | **12 hours** |
| **P2** | 6 tests | 1 hour | **6 hours** |
| **Manual Pilots** | 3 pilots | 2 hours | **6 hours** |
| **Total** | **36 tests** | - | **46.5 hours** |

**Estimated Duration:** ~6 days (1 QA Engineer)

### Test Data Requirements

**Preconditions:**

- ✅ Story 6-1 implementação completa
- ⚠️ **BLOCKED**: Commits pendentes (R-006)
- ✅ Git hooks instalados
- ✅ Scripts em `/scripts` disponíveis
- ✅ Rust tests em `/core/ganache-lib/tests`
- ⚠️ 3 stories para pilot reviews (5.2, 5.3, 5.4)

**Test Fixtures Needed:**

- Repositório mock com anti-padrões (TODO, unwrap, secrets)
- Logs malformados (hex inválido, UTF-8 inválido)
- GitHub Actions test environment

---

## 7. Quality Gate Criteria

### Gate Decision Matrix

| Criteria | Threshold | Current Status |
| -------- | --------- | -------------- |
| **P0 Pass Rate** | 100% | ⚠️ BLOCKED (commits pendentes) |
| **P1 Pass Rate** | ≥95% | 🔴 Pending (pilots não executados) |
| **High-Risk Mitigation** | 100% (all 3) | 🔴 0/3 mitigated |
| **Protocol Compliance** | 100% | 🔴 FAIL (R-006 violado) |
| **Rust Tests** | 39/39 passing | ✅ Reported passing |

### Gate Recommendation: **FAIL** 🚨

**Blockers:**

1. **CRITICAL**: Protocolo Anti-Hallucination violado (R-006) - 7 arquivos não commitados
2. **HIGH**: Métricas de negócio não validadas (R-004) - AC #1 sem evidência
3. **HIGH**: Falsos positivos não testados (R-002) - Risco de bloquear devs

**Required Actions Before Story Completion:**

1. ✅ Complete action item "COMMITS PENDENTES" (5 commits atômicos)
2. ✅ Execute `force-agent-compliance.sh` → exit 0
3. ✅ Execute 3 pilot reviews e documentar resultados
4. ✅ Estabelecer baseline de métricas
5. ✅ Validar Rust tests do diretório correto: `cd core/ && cargo test`

---

## 8. Next Steps

### Immediate Actions (Blocking)

1. **Execute Commits Obrigatórios** (Dev Agent)

   ```bash
   # Sequência de commits conforme action item CRITICAL-1
   git add scripts/analyze-review-readiness.sh scripts/suggest-fixes.sh tests/scripts/test_*.sh
   git commit -m "feat(governance): add adversarial review automation scripts"
   
   git add core/ganache-lib/src/system/security_event_service.rs core/ganache-lib/tests/robust_log_parsing_tests.rs
   git commit -m "feat(backend): improve log parsing robustness"
   
   git add .github/workflows/adversarial-review-checks.yml
   git commit -m "ci(workflows): add adversarial review checks"
   
   git add docs/adversarial-review-optimized-guide.md docs/adversarial-review-training-examples.md docs/6-1-implementation-summary.md
   git commit -m "docs(governance): add adversarial review documentation"
   
   git add docs/sprint-artifacts/6-1-optimize-adversarial-review-process.md core/ganache-core/src/security_handlers.rs
   git commit -m "docs(story): update file list and fix code formatting"
   
   ./scripts/force-agent-compliance.sh  # MUST PASS
   ```

2. **Execute Testes Rust** (Dev Agent)

   ```bash
   cd core/
   cargo test --package ganache-lib -- robust_log_parsing_tests --nocapture
   # Esperado: 11/11 testes passando
   ```

3. **Execute Pilot Reviews** (QA/PM)
   - Aplicar verificações automatizadas em stories 5.2, 5.3, 5.4
   - Documentar problemas detectados vs. revisão manual anterior
   - Output: `docs/adversarial-review-pilot-results.md`

4. **Coletar Métricas Baseline** (PM/SM)
   - Analisar git log para iterações de revisão médias (antes da otimização)
   - Implementar script `analyze-review-metrics.sh`
   - Documentar em `adversarial-review-optimized-guide.md#metricas`

### Post-Unblock: Run Test Automation Workflow

```bash
# Após commits e validação manual
/testarch-automate
```

---

## Appendix A: Knowledge Base References

Workflow utilizou os seguintes fragmentos:

- ✅ `risk-governance.md` - 6 categorias (TECH, SEC, PERF, DATA, BUS, OPS)
- ✅ `probability-impact.md` - Matriz 1-3 × 1-3 scoring
- ✅ `test-priorities-matrix.md` - P0-P3 classification
- ✅ `test-levels-framework.md` - E2E vs Unit selection

## Appendix B: Story References

- **Story File:** [6-1-optimize-adversarial-review-process.md](file:///root/GANACHE/docs/sprint-artifacts/6-1-optimize-adversarial-review-process.md)
- **Project Context:** [project-context.md](file:///root/GANACHE/project-context.md) §9.4 (Anti-Hallucination Protocol)
- **Epic:** [epics.md](file:///root/GANACHE/docs/epics.md#Story-6.1)
- **Sprint Status:** [sprint-status.yaml](file:///root/GANACHE/docs/sprint-artifacts/sprint-status.yaml)

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-24  
**Approver:** Pending User Review  
