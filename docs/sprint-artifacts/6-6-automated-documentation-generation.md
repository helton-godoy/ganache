# Story 6.6: Geração Automatizada de Documentação

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

Como uma Equipe de Desenvolvimento,
Eu quero um sistema de geração automatizada de documentação,
Para que possamos manter uma documentação consistente e atualizada com o mínimo esforço manual.

## Acceptance Criteria

1. **Dado** alterações de código com comentários semânticos e anotações apropriadas
   **Quando** o processo de geração de documentação é executado
   **Então** ele deve extrair e formatar automaticamente a documentação a partir do código
   **E** gerar documentação de API a partir de especificações OpenAPI
   **E** criar documentação de componentes a partir de anotações de componentes React
   **E** garantir que toda a documentação gerada siga os padrões de documentação semântica do projeto
   **E** integrar-se com o pipeline de compilação de documentação existente

## Tasks / Subtasks

### 1. Análise do Sistema Atual e Definição de Escopo (AC: #1)

- [ ] Auditar documentação existente
  - [ ] Mapear todos os documentos em `docs/` seguindo BMAD 6 SSoT
  - [ ] Identificar gaps de documentação (APIs Rust não documentadas, Componentes React sem JSDoc)
  - [ ] Validar conformidade com `project-context.md` seção 10 (Semantic Documentation Strategy)
- [ ] Definir fontes de extração
  - [ ] Backend Rust: Triple-slash comments (`///`) em `core/ganache-*`
  - [ ] Frontend React: JSDoc blocks (`/** */`) em `src/components/`
  - [ ] OpenAPI Spec: `core/ganache-api/openapi.json`
  - [ ] Tipos e Contratos: Serde structs em `ganache-api`

### 2. Implementação do Extrator de Documentação Rust (AC: #1)

- [ ] Criar ferramenta de extração `cargo doc` customizada
  - [ ] Implementar script `scripts/generate-rust-docs.sh`
  - [ ] Extrair comentários `///` de todas as funções e structs públicas
  - [ ] Validar presença obrigatória de seções: `# Purpose`, `# Arguments`, `# Returns`, `# Panic`
  - [ ] Gerar Markdown estruturado em `docs/api/rust/`
- [ ] Integrar com pipeline de build
  - [ ] Adicionar hook ao `bmad-sync.sh` para execução automática após mudanças em `core/`
  - [ ] Configurar CI para falhar se documentação obrigatória estiver ausente

### 3. Implementação do Extrator de Documentação OpenAPI (AC: #1)

- [ ] Criar gerador de documentação a partir de `openapi.json`
  - [ ] Implementar script `scripts/generate-api-docs.sh`
  - [ ] Parsear especificação OpenAPI e extrair endpoints, schemas, exemplos
  - [ ] Gerar Markdown estruturado em `docs/api/openapi/` com:
    - [ ] Lista de endpoints organizados por tags
    - [ ] Schemas de request/response
    - [ ] Exemplos de uso com `curl` e TypeScript SDK
  - [ ] Integrar exemplos de consumo dos hooks Orval gerados

### 4. Implementação do Extrator de Documentação React (AC: #1)

- [ ] Criar ferramenta de extração de componentes
  - [ ] Implementar script `scripts/generate-react-docs.sh`
  - [ ] Parsear JSDoc de componentes em `src/components/`
  - [ ] Extrair props, descrições, exemplos de uso
  - [ ] Validar presença obrigatória de: `@description`, `@param`, `@returns`
  - [ ] Gerar Markdown estruturado em `docs/components/`
- [ ] Documentar padrões de uso
  - [ ] Criar exemplos de uso dos componentes Shadcn customizados
  - [ ] Documentar patterns de `features/` (Smart) vs `ui/` (Dumb)

### 5. Implementação do Sistema de Rastreabilidade (@ref Links) (AC: #1)

- [ ] Criar parser de tags `@ref`
  - [ ] Implementar script `scripts/generate-traceability-matrix.sh`
  - [ ] Escanear codebase buscando comentários com `@ref [Story-ID]`
  - [ ] Gerar matriz de rastreabilidade em `docs/traceability.md`
  - [ ] Mapear Code Chunks → User Stories para sistema RAG futuro
- [ ] Validar cobertura
  - [ ] Garantir que todos os arquivos críticos tenham tags `@ref`
  - [ ] Criar relatório de código sem rastreabilidade

### 6. Integração com Pipeline de Build (AC: #1)

- [ ] Atualizar `bmad-sync.sh`
  - [ ] Adicionar chamadas para todos os scripts de geração de docs
  - [ ] Garantir execução apenas quando arquivos relevantes mudarem (dirty check)
  - [ ] Adicionar cache para evitar regeneração desnecessária
- [ ] Atualizar `bmad-validate.sh`
  - [ ] Adicionar validação de conformidade de documentação
  - [ ] Verificar presença de comentários obrigatórios
  - [ ] Validar estrutura de Markdown gerado
- [ ] Configurar GitHub Actions
  - [ ] Adicionar step de geração de docs ao pipeline CI
  - [ ] Bloquear merge se documentação estiver desatualizada ou inválida

### 7. Testes e Validação (AC: #1)

- [ ] Criar suite de testes de documentação
  - [ ] Implementar `tests/docs/test_rust_doc_coverage.sh`
  - [ ] Implementar `tests/docs/test_openapi_doc_generation.sh`
  - [ ] Implementar `tests/docs/test_react_doc_coverage.sh`
  - [ ] Implementar `tests/docs/test_traceability_matrix.sh`
- [ ] Validar integração end-to-end
  - [ ] Simular mudança em código Rust → verificar doc gerado
  - [ ] Simular mudança em OpenAPI → verificar doc gerado
  - [ ] Simular mudança em React → verificar doc gerado
  - [ ] Executar `bmad-validate.sh` e garantir sucesso

### 8. Documentação e Handoff (AC: #1)

- [ ] Criar guia de uso para desenvolvedores
  - [ ] Documentar padrão de comentários obrigatórios em `docs/documentation-standards.md`
  - [ ] Criar exemplos de good/bad documentation
  - [ ] Explicar fluxo de geração automática
- [ ] Atualizar `README.md`
  - [ ] Adicionar seção sobre geração automática de docs
  - [ ] Documentar comandos `./scripts/generate-*-docs.sh`
- [ ] Commit final e atualização de status
  - [ ] Fazer commits atômicos seguindo Conventional Commits
  - [ ] Atualizar sprint-status.yaml para `done`

## Dev Notes

### Arquitetura de Geração de Documentação

Este sistema implementa uma **pipeline multi-source de extração de documentação** que garante consistência e atualização automática da documentação técnica do projeto Ganache.

#### Princípios de Design

1. **Source of Truth**: O código é a fonte primária. Documentação é gerada, não mantida manualmente.
2. **Contract-First**: OpenAPI spec define contratos, documentação flui dali.
3. **Semantic Links**: Tags `@ref` conectam código a requisitos (preparação para RAG).
4. **Validation-First**: Ferramentas falham se doc obrigatória estiver ausente.

#### Fontes de Documentação

| Fonte | Localização | Formato de Entrada | Output |
| ----- | ----------- | ------------------ | ------ |
| **Rust Backend** | `core/ganache-*/**/*.rs` | Triple-slash (`///`) + tags obrigatórias | `docs/api/rust/*.md` |
| **OpenAPI Spec** | `core/ganache-api/openapi.json` | JSON Schema | `docs/api/openapi/*.md` |
| **React Components** | `src/components/**/*.tsx` | JSDoc (`/** */`) | `docs/components/*.md` |
| **Traceability** | `**/*.{rs,ts,tsx}` | `@ref [Story-ID]` comments | `docs/traceability.md` |

### Detalhes Técnicos por Componente

#### 1. Rust Documentation Extractor

**Ferramenta**: `cargo doc` + custom parser

**Padrão Obrigatório** (de `project-context.md`):

```rust
/// # Purpose
/// Cria um novo ZFS pool sobre dispositivo DRBD.
///
/// # Arguments
/// * `pool_name` - Nome do pool ZFS a criar
/// * `drbd_device` - Path para o dispositivo DRBD (ex: `/dev/drbd0`)
///
/// # Returns
/// * `Ok(PoolInfo)` - Informações do pool criado
/// * `Err(ZfsError)` - Se comando `zpool create` falhar
///
/// # Panic
/// Panics se `pool_name` contiver caracteres inválidos
///
/// @ref Story-2.2 - Implementa criação de pool ZFS sobre DRBD
pub fn create_zfs_pool(pool_name: &str, drbd_device: &str) -> Result<PoolInfo, ZfsError>
```

**Script**: `scripts/generate-rust-docs.sh`

- Escanear `core/ganache-*/src/**/*.rs`
- Extrair blocos `///` de `pub fn`, `pub struct`, `pub enum`
- Validar presença de seções obrigatórias
- Gerar Markdown por módulo

#### 2. OpenAPI Documentation Generator

**Ferramenta**: Custom Node.js script + `openapi.json`

**Output Esperado**:

```markdown
# API Endpoints - ZFS Storage Management

## POST /api/v1/storage/pool

Cria um novo ZFS pool.

**Request Body** (`CreatePoolRequest`):
```json
{
  "name": "mainpool",
  "drbd_device": "/dev/drbd0",
  "compression": "lz4"
}
```

**Response** (`PoolInfo`):

```json
{
  "name": "mainpool",
  "capacity_bytes": 1099511627776,
  "used_bytes": 0
}
```

**TypeScript SDK Usage**:

```typescript
import { useCreatePoolMutation } from '@/api/generated';

const { mutate } = useCreatePoolMutation();
mutate({ name: 'mainpool', drbd_device: '/dev/drbd0' });
```

**Script**: `scripts/generate-api-docs.sh`

- Parsear `core/ganache-api/openapi.json`
- Agrupar endpoints por tags
- Gerar exemplos de curl e TypeScript SDK
- Linkar schemas aos tipos Rust

#### 3. React Component Documentation Extractor

**Ferramenta**: TypeScript AST parser (ts-morph ou similar)

**Padrão Obrigatório** (de `project-context.md`):

```typescript
/**
 * @description Exibe o status de saúde do cluster DRBD em tempo real.
 * Implementa polling via React Query para atualização automática (2-5s).
 * 
 * @param onNodeClick - Callback acionado ao clicar em um nó do cluster
 * @param refreshInterval - Intervalo de polling em ms (padrão: 3000)
 * @returns Componente visual de status do cluster
 * 
 * @ref Story-2.1 - Visualização de saúde do cluster HA
 */
export function ClusterHealthCard({ 
  onNodeClick, 
  refreshInterval = 3000 
}: ClusterHealthCardProps) {
  // ...
}
```

**Script**: `scripts/generate-react-docs.sh`

- Escanear `src/components/**/*.tsx`
- Extrair JSDoc de componentes exportados
- Documentar props com tipos TypeScript
- Gerar exemplos de uso

#### 4. Traceability Matrix Generator

**Purpose**: Preparar para sistema RAG futuro

**Pattern**:

- Todo código que implementa um requisito DEVE ter `@ref [Story-ID]`
- Script escaneia codebase e gera matriz:

```markdown
# Traceability Matrix

## Story 2.2: ZFS Pool Creation on DRBD

**Implementação**:
- `core/ganache-lib/src/zfs/pool.rs` - `create_zfs_pool()` (linha 45)
- `core/ganache-core/src/routes/storage.rs` - `POST /storage/pool` handler (linha 120)
- `src/components/features/StorageWizard.tsx` - Pool creation UI (linha 78)

**Testes**:
- `core/ganache-lib/tests/zfs_pool_tests.rs` - `test_create_pool_on_drbd()` (linha 12)
```

**Script**: `scripts/generate-traceability-matrix.sh`

- Buscar regex `@ref (Story-\d\.\d|[0-9]-[0-9])`
- Agrupar por Story ID
- Gerar links para arquivos/linhas

### Integração com Pipeline Existente

#### bmad-sync.sh Enhancement

```bash
#!/bin/bash
# Adicionado ao bmad-sync.sh

echo "🔍 Verificando mudanças em código..."

if git diff --name-only HEAD~1 | grep -E "core/.*\.rs$"; then
  echo "📝 Gerando documentação Rust..."
  ./scripts/generate-rust-docs.sh
fi

if git diff --name-only HEAD~1 | grep "core/ganache-api/openapi.json"; then
  echo "📝 Gerando documentação OpenAPI..."
  ./scripts/generate-api-docs.sh
fi

if git diff --name-only HEAD~1 | grep -E "src/components/.*\.tsx$"; then
  echo "📝 Gerando documentação React..."
  ./scripts/generate-react-docs.sh
fi

echo "🔗 Atualizando matriz de rastreabilidade..."
./scripts/generate-traceability-matrix.sh
```

#### bmad-validate.sh Enhancement

```bash
# Adicionado ao bmad-validate.sh

echo "📚 Validando conformidade de documentação..."

# Validar comentários Rust obrigatórios
if ! ./tests/docs/test_rust_doc_coverage.sh; then
  echo "❌ FALHA: Rust code sem documentação obrigatória"
  exit 1
fi

# Validar JSDoc React
if ! ./tests/docs/test_react_doc_coverage.sh; then
  echo "❌ FALHA: Componentes React sem JSDoc"
  exit 1
fi

# Validar matrix de rastreabilidade
if ! ./tests/docs/test_traceability_matrix.sh; then
  echo "⚠️ AVISO: Código sem tags @ref detectado"
fi
```

### Padrões de Teste

#### Teste de Cobertura Rust

```bash
#!/bin/bash
# tests/docs/test_rust_doc_coverage.sh

echo "🔍 Verificando cobertura de documentação Rust..."

missing_docs=()

for file in core/ganache-*/src/**/*.rs; do
  pub_fns=$(grep -n "^pub fn" "$file" | cut -d: -f1)
  
  for line_num in $pub_fns; do
    prev_line=$((line_num - 1))
    comment=$(sed -n "${prev_line}p" "$file")
    
    if [[ ! "$comment" =~ ^///.*# Purpose ]]; then
      missing_docs+=("$file:$line_num - função sem /// # Purpose")
    fi
  done
done

if [ ${#missing_docs[@]} -gt 0 ]; then
  echo "❌ Documentação faltando:"
  printf '%s\n' "${missing_docs[@]}"
  exit 1
fi

echo "✅ Todas as funções públicas estão documentadas"
```

### Compliance com BMAD 6 SSoT

**Alinhamento com `project-context.md` Seção 5**:

1. ✅ **Não cria novos eixos**: Documentação gerada vai para `docs/api/` e `docs/components/` (subpastas permitidas pois são outputs gerados, não manuais)
2. ✅ **Source of Truth**: Código é a fonte, docs são derivados
3. ✅ **Validation-First**: `bmad-validate.sh` garante conformidade
4. ✅ **Automation**: `bmad-sync.sh` executa geração automaticamente

**Alinhamento com Seção 10 (Semantic Documentation)**:

1. ✅ Implementa padrão `///` para Rust com seções obrigatórias
2. ✅ Implementa padrão JSDoc para TypeScript com tags obrigatórias
3. ✅ Implementa tags `@ref` para rastreabilidade (preparação RAG)
4. ✅ Gera blocos parseáveis para futuro Vector DB indexing

### Architecture Requirements

De `docs/architecture.md`:

1. **Backend (Rust)**:
   - Documentar todas as APIs públicas em `ganache-lib`, `ganache-api`, `ganache-core`
   - Seguir pattern de comentários `///` com seções obrigatórias
   - Gerar docs para OpenAPI spec automaticamente

2. **Frontend (Next.js)**:
   - Documentar todos os componentes exportados em `src/components/`
   - Usar JSDoc com tags obrigatórias
   - Documentar hooks customizados e utilitários

3. **Integration**:
   - Documentar fluxo de dados OpenAPI → Orval → React Hooks
   - Manter sincronização entre `openapi.json` e docs gerados

### Testing Standards

De `docs/architecture.md` Seção 7:

1. **Tests Location**: `tests/docs/` para validação de documentação
2. **CI Integration**: Adicionar step ao `.github/workflows/test.yml`
3. **Quality Gate**: Docs faltando = CI failure

### Previous Story Intelligence

Da Story 6-5 (Audit Troubleshooting Guide):

**Learnings Aplicáveis**:

1. ✅ **Single Consolidated Document**: Story 6-5 criou `docs/audit-troubleshooting-guide.md` como documento único. Aplicar mesmo pattern aqui → gerar docs estruturados mas consolidados.

2. ✅ **Validation Tests**: Story 6-5 implementou `tests/docs/test_audit_guide_exists.sh`. Replicar pattern para validar docs gerados.

3. ✅ **Code Review Fixes Applied**: Story 6-5 teve review adversarial que identificou links relativos quebrados e falta de seção de validação. **PREVENIR AQUI**:
   - Gerar links absolutos ou relativos corretos
   - Incluir seções de validação em docs gerados

4. ✅ **SSoT Alignment**: Story 6-5 seguiu BMAD 6 SSoT criando doc em `docs/` sem fragmentação. Manter consistência.

### Git Intelligence

Commits recentes relevantes:

```bash
# Story 6-5 commits (exemplo de pattern a seguir)
docs: create audit troubleshooting guide in single file
test: add validation script for audit guide
fix(docs): correct relative links and add validation section
```

**Pattern a seguir**:

- Commits atômicos por tipo: scripts, tests, docs
- Conventional Commits obrigatório
- Zero pending policy antes de marcar done

### Latest Tech Information Requirements

**Rust `cargo doc`**:

- Usar `cargo doc --no-deps --document-private-items` para extração completa
- Versão estável: Rust 1.75+ (projeto usa latest stable)

**TypeScript AST Parsing**:

- Usar `ts-morph` v20+ para parsing robusto de JSDoc
- Alternativa: `typedoc` com custom plugin

**OpenAPI Documentation**:

- Usar `redoc-cli` ou `openapi-generator` para gerar docs de `openapi.json`
- Orval já faz parsing, adaptar para gerar Markdown também

**Markdown Generation**:

- Usar template engine simples (Handlebars ou Mustache)
- Garantir validação de Markdown gerado com `markdownlint`

### Project Context Reference

Este código DEVE seguir rigorosamente:

- **[project-context.md](file:///root/GANACHE/project-context.md)** - Seção 10: Semantic Documentation Strategy
  - Formato de comentários Rust: Triple-slash `///` com seções obrigatórias
  - Formato JSDoc TypeScript: `/** */` com tags obrigatórias  
  - Pattern `@ref [Story-ID]` para rastreabilidade
  - Goal: Preparar código para RAG system (Vector DB indexing)

- **[project-context.md](file:///root/GANACHE/project-context.md)** - Seção 5: Documentation Methodology (BMAD 6 SSoT)
  - Eixos centrais permitidos: `README.md`, `project-context.md`, `docs/analysis/prd.md`, `docs/architecture.md`, `docs/epics.md`, `docs/sprint-artifacts/`
  - Proibido fragmentar documentação em subpastas manuais
  - Permitido gerar docs em `docs/api/` e `docs/components/` (outputs automáticos)

- **[project-context.md](file:///root/GANACHE/project-context.md)** - Seção 7: Governança de Automação
  - Integrar com `bmad-sync.sh` para execução automática
  - Integrar com `bmad-validate.sh` para validação obrigatória
  - GitHub Actions DEVE executar validação em todo PR

- **[project-context.md](file:///root/GANACHE/project-context.md)** - Seção 8: Protocolo de Commits Atômicos
  - Commits granulares por escopo: `docs(generator)`, `test(docs)`, `chore(scripts)`
  - Conventional Commits obrigatório (validado por hook `commit-msg`)
  - Zero pending policy: executar `./scripts/force-agent-compliance.sh` antes de afirmar sucesso

### Critical Implementation Notes

⚠️ **ANTI-PATTERNS A EVITAR**:

1. ❌ **Não criar documentação manual**: Docs DEVEM ser gerados de código
2. ❌ **Não fragmentar em múltiplos arquivos pequenos**: Consolidar por módulo/categoria
3. ❌ **Não ignorar validação**: CI DEVE falhar se docs faltarem
4. ❌ **Não confundir geração com sincronização**: Geração é automática, sincronização é manual via `bmad-sync.sh`

✅ **SUCCESS CRITERIA**:

1. ✅ Developer faz commit de código Rust → `bmad-sync.sh` roda → docs atualizados automaticamente
2. ✅ Developer faz commit sem comentários obrigatórios → `bmad-validate.sh` falha → CI bloqueia merge
3. ✅ Developer procura "Como criar pool ZFS?" → encontra doc gerado em `docs/api/rust/zfs.md` com exemplo completo
4. ✅ Future RAG system pode indexar código usando tags `@ref` → responde "Onde está implementado Story 2.2?" → retorna arquivos corretos

### References

- [Source: docs/epics.md#Story-6.6](file:///root/GANACHE/docs/epics.md) - Requisitos e Acceptance Criteria
- [Source: docs/architecture.md#7-Qualidade-e-Automacao](file:///root/GANACHE/docs/architecture.md) - Testing standards e CI/CD pipeline
- [Source: project-context.md#10-Semantic-Documentation-Strategy](file:///root/GANACHE/project-context.md) - Padrões de comentários obrigatórios
- [Source: project-context.md#5-Documentation-Methodology](file:///root/GANACHE/project-context.md) - BMAD 6 SSoT principles
- [Source: project-context.md#7-Governanca-de-Automacao](file:///root/GANACHE/project-context.md) - Scripts `bmad-*.sh`
- [Source: docs/sprint-artifacts/6-5-audit-troubleshooting-guide.md](file:///root/GANACHE/docs/sprint-artifacts/6-5-audit-troubleshooting-guide.md) - Pattern de documentação da story anterior

## Dev Agent Record

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

### Completion Notes

### File List
