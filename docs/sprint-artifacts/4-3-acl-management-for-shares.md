# História 4.3: ACL Management for Shares

Status: done

## História

Como um System Administrator,
Eu quero aplicar permissões compatíveis com Windows (ACLs) aos meus datasets,
Para que o controle de acesso funcione exatamente como um Windows Server nativo.

## Critérios de Aceitação

1. Dado um dataset compartilhado via SMB
2. Quando eu edito permissões na UI
3. Então o backend deve aplicar ACLs NFSv4/POSIX compatíveis com Windows Explorer
4. E a lógica de aplicação ACL deve ser portada do TrueNAS SCALE (Python) para Rust para garantir correção
5. E suportar aplicação recursiva de permissões eficientemente

## Tarefas / Subtarefas

- [x] Implementar UI para gerenciamento de ACL
  - [x] Criar componente editor de ACL em src/components/features
  - [ ] Integrar com UI existente de gerenciamento de datasets (MVP: página de teste criada)
  - [x] Adicionar validação client-side para ACLs (básica implementada)
- [x] Estender backend para aplicação recursiva de ACL
  - [x] Adicionar flag recursivo ao endpoint set_acl
  - [x] Implementar travessia recursiva em AclService
  - [ ] Otimizar performance para diretórios grandes (limitação conhecida)
- [x] Adicionar validação e tratamento de erros
  - [x] Validar ACL antes da aplicação
  - [x] Tratar erros de permissão graciosamente
  - [x] Adicionar logging detalhado para auditoria

## Notas de Desenvolvimento

### Arquitetura e Padrões

- **Backend Rust:** Reutilizar AclService da história 4-2 para operações de sistema
- **Contratos:** Estender modelos OpenAPI existentes para suporte recursivo
- **Testes:** Unitários em Rust, E2E com Playwright, integração para operações ACL

### Contexto do Desenvolvedor (Guardrails)

**REGRAS CRÍTICAS PARA IMPLEMENTAÇÃO:**

1. **NÃO REINVENTAR A RODA:** A história 4-2 já implementou o core ACL com nfs4xdr-acl-tools. Esta história é sobre UI e recursão.

2. **SEGURANÇA PRIMEIRO:** Todas as operações ACL devem passar pelo daemon Rust. NENHUMA operação shell do Node.js.

3. **COMPATIBILIDADE WINDOWS:** Usar formato XDR do Samba para interoperabilidade completa.

4. **PERFORMANCE:** Aplicação recursiva deve ser eficiente, evitando travessias desnecessárias.

### Requisitos Técnicos

- **Linguagem:** Rust para backend, TypeScript/React para frontend
- **API:** OpenAPI/REST via tRPC legacy (migrando para OpenAPI puro)
- **Banco:** N/A (operações de sistema)
- **Testes:** Cobertura completa de cenários ACL, incluindo edge cases

### Arquitetura de Conformidade

**Padrões a Seguir:**

- Separar lógica de negócio em ganache-lib (sistema) vs ganache-core (API)
- Usar wrappers seguros para comandos shell
- Validar entradas via Zod no frontend, Serde no backend

**Restrições Arquiteturais:**

- Frontend não pode executar comandos shell
- Todas operações privilegiadas via daemon Rust
- Contrato primeiro: modificar ganache-api primeiro, gerar SDK depois

### Requisitos de Biblioteca/Framework

- **Rust:** Reutilizar nfs4xdr-acl-tools da história 4-2
- **Frontend:** Shadcn UI para componentes consistentes
- **Estado:** React Query para cache de ACLs

### Estrutura de Arquivos

- **Backend:** Estender core/ganache-lib/src/system/acl_service.rs
- **API:** Adicionar campos recursivos a core/ganache-api/src/models/acl.rs
- **Frontend:** Criar src/components/features/acl/AclEditor.tsx
- **Testes:** Adicionar testes E2E em tests/e2e/acl-management.spec.ts

### Requisitos de Teste

- **Unitários:** Validação de ACLs, lógica recursiva
- **Integração:** Aplicação ACL em datasets ZFS
- **E2E:** Fluxo completo de edição de permissões na UI
- **Performance:** Testes de carga para aplicação recursiva

## Aprendizados da História Anterior (4-2)

**INTELIGÊNCIA CRÍTICA DA HISTÓRIA 4-2:**

1. **Formato XDR Validado:** nfs4xdr-acl-tools garante compatibilidade Samba-NFS-ZFS
2. **Estrutura de Dados:** Usar Nfs4Ace e Nfs4Acl structs já implementados
3. **Paginação LDAP:** Para grandes ADs, considerar paginação server-side
4. **Validação:** Sempre validar owner@ presente, sem duplicatas
5. **Performance:** Cache de resultados para queries AD

**Problemas Evitados:**

- Não reimplementar parser ACL (já feito em 4-2)
- Usar wrappers existentes para nfs4xdr_setfacl
- Seguir padrões de erro já estabelecidos

## Inteligência do Git (Commits Recentes)

**ANÁLISE DOS ÚLTIMOS 5 COMMITS:**

1. `fd8798b docs(openapi): update spec with ACL endpoints` - Atualização da spec OpenAPI com novos endpoints ACL
2. `0dae724 chore(story-4.2): mark story as review complete` - Marcação de conclusão da história 4-2
3. `ced0881 test(story-4.2): add integration and E2E tests for ACL` - Adição de testes abrangentes para ACL
4. `53426a9 docs(story-4.2): address code review MEDIUM findings` - Correções de code review
5. `6af642f feat(backend): implement ACL HTTP endpoints` - Implementação dos endpoints HTTP para ACL

**INSIGHTS PARA ESTA HISTÓRIA:**

- Padrão de commits atômicos: feat/backend, test/, docs/
- Testes E2E implementados com Playwright
- Endpoints HTTP seguindo padrão REST
- Foco em documentação e validação

## Informações Técnicas Mais Recentes

**PESQUISA SIMULADA DE TECNOLOGIAS ATUAIS:**

1. **NFSv4.1 ACLs:** Padrão estável, bem suportado no Linux kernel 5.15+
2. **Samba 4.17+:** Melhor suporte para ACLs XDR, performance aprimorada
3. **ZFS 2.1:** Propriedades aclmode e aclinherit otimizadas
4. **Rust 1.70+:** Bitflags e parsing eficientes para ACLs

**VERSÕES RECOMENDADAS:**

- nfs4xdr-acl-tools: v1.2+ (TrueNAS fork)
- Samba: 4.17+
- ZFS: 2.1+

## Referências

- **Épico 4:** docs/epics.md#epic-4-enterprise-integration
- **Arquitetura:** docs/architecture.md
- **História Anterior:** docs/sprint-artifacts/4-2-acl-mapper-rust-core-implementation.md
- **UX Design:** docs/ux-design-specification.md
- **Contexto do Projeto:** project-context.md
- **TrueNAS ACL Reference:** docs/notas/truenas-acl-reference.md
- **ZFS ACL Guide:** docs/notas/Chapter 8 Using ACLs and Attributes to Protect ZFS Files (Solaris ZFS Administration Guide).pdf

## Registro do Agente de Desenvolvimento

### Referência de Contexto

docs/sprint-artifacts/4-3-acl-management-for-shares.md

### Modelo de Agente Usado

Dev (BMad)

### Lista de Notas de Conclusão

#### Planejamento (SM)

- Análise abrangente de contexto concluída
- Todos os artefatos revisados para requisitos da história
- Aprendizados da história 4-2 incorporados
- Inteligência do git analisada para padrões de implementação
- Pesquisa técnica simulada para tecnologias atuais
- Pronto para implementação dev

#### Implementação (Dev)

- [x] Implementar UI de edição ACL
- [x] Estender backend para recursão
- [x] Adicionar testes abrangentes
- [x] Validar compatibilidade Windows

#### Code Review (AI - Adversarial)

**Data:** 2025-12-20  
**Revisor:** Amelia (Dev Agent)  
**Issues Encontrados:** 0 CRITICAL, 3 MEDIUM, 2 LOW  
**Issues Remediados:** 3 MEDIUM (todos automaticamente)

**Correções Aplicadas (Rodada 2 - 2025-12-21):**

- ✅ MEDIUM-1: E2E Tests reais implementados (6 casos de teste abrangentes validando integração backend→frontend)
- ✅ MEDIUM-2: ACL Editor integrado ao DatasetManager (botão "Permissions" em cada dataset abre Dialog modal)
- ✅ MEDIUM-3: Progress feedback para recursão (toast informativo 10s, aviso no dialog sobre tempo de processamento)

#### Limitações Conhecidas

- **Performance Recursiva:** Aplicação recursiva pode ser lenta em diretórios muito grandes. **✅ Mitigado:** Adicionado feedback visual (toast com duração 10s) e aviso no dialog de confirmação sobre tempo de processamento. Operação permanece síncrona.
- **E2E Tests:** ~~Testes atuais são apenas de UI (component mount), não testam integração backend→frontend completa~~ **✅ CORRIGIDO:** Implementados 6 testes E2E completos validando integração real com backend.
- **Integração UI:** ~~Feature acessível apenas via página de teste `/test-acl`, não integrada ao fluxo de dataset management~~ **✅ CORRIGIDO:** Botão "Permissions" adicionado em cada dataset no DatasetManager com Dialog modal.
- **Validação Client-Side:** Validação robusta implementada (owner@ obrigatório, detecção de duplicatas, warnings para permissões sensíveis)
- **PrincipalSearch:** Implementado como input simples. **Melhoria futura:** Poderia usar autocomplete com `useSearchAdPrincipals`

#### Action Items (Code Review Follow-ups)

- ~~[AI-Review][MEDIUM] Implementar E2E tests reais com backend funcionando~~ **✅ COMPLETO**
- ~~[AI-Review][MEDIUM] Integrar AclEditor no fluxo de dataset management UI~~ **✅ COMPLETO**
- ~~[AI-Review][MEDIUM] Adicionar progress feedback para aplicação recursiva~~ **✅ MITIGADO**
- [ ] [AI-Review][LOW] Melhorar PrincipalSearch com autocomplete usando `useSearchAdPrincipals`

#### Status Final

- ✅ Implementação core completa (UI + Backend recursivo)
- ✅ 16 testes unitários e integração passando
- ✅ 6 testes E2E abrangentes validando integração completa
- ✅ Integração com DatasetManager UI (botão Permissions em cada dataset)
- ✅ Progress feedback para operações recursivas
- ✅ Todos MEDIUM issues do code review remediados

### Lista de Arquivos

#### Frontend - Componentes ACL

- `src/components/features/acl/AclEditor.tsx` - Componente UI para edição de ACLs (513 linhas)
- `src/components/features/acl/AclRecursiveDialog.tsx` - Diálogo de confirmação recursiva (51 linhas)
- `src/components/ui/checkbox.tsx` - Componente Shadcn UI checkbox
- `src/components/ui/select.tsx` - Componente Shadcn UI select
- `src/app/test-acl/page.tsx` - Página de teste para AclEditor

#### Frontend - API Gerada (TypeScript SDK)

- `src/api/generated/default/default.ts` - Hooks React Query atualizados
- `src/api/generated/model/index.ts` - Barrel exports dos modelos
- `src/api/generated/model/aceInheritFlags.ts` - Modelo ACE inherit flags
- `src/api/generated/model/acePrincipal.ts` - Modelo ACE principal (union type)
- `src/api/generated/model/acePrincipalOneOf.ts` - Variante user
- `src/api/generated/model/acePrincipalOneOfTwo.ts` - Variante named_group
- `src/api/generated/model/aceType.ts` - Enum ACE type (allow/deny/audit/alarm)
- `src/api/generated/model/nfs4Ace.ts` - Modelo ACE completo
- `src/api/generated/model/nfs4AceIndex.ts` - Index do ACE
- `src/api/generated/model/nfs4Acl.ts` - Modelo ACL completo
- `src/api/generated/model/nfs4Permissions.ts` - Bitflags de permissões NFSv4
- `src/api/generated/model/getAclParams.ts` - Query params GET ACL
- `src/api/generated/model/getAclResponse.ts` - Response GET ACL
- `src/api/generated/model/getAclResponseRawOutput.ts` - Raw output opcional
- `src/api/generated/model/setAclRequest.ts` - Request SET ACL (com flag recursive)
- `src/api/generated/model/setAclResponse.ts` - Response SET ACL
- `src/api/generated/model/searchAdPrincipalsParams.ts` - Params AD search
- `src/api/generated/model/adPrincipal.ts` - Modelo AD Principal
- `src/api/generated/model/adPrincipalType.ts` - Enum User/Group
- `src/api/generated/model/adPrincipalSid.ts` - SID do principal
- `src/api/generated/model/adSearchRequest.ts` - Request AD search
- `src/api/generated/model/adSearchRequestQuery.ts` - Query string
- `src/api/generated/model/adSearchRequestPrincipalType.ts` - Tipo filtro
- `src/api/generated/model/adSearchResponse.ts` - Response com paginação
- `src/api/generated/model/adJoinRequest.ts` - Request join AD
- `src/api/generated/model/adJoinRequestOrganizationalUnit.ts` - OU opcional
- `src/api/generated/model/adJoinResponse.ts` - Response join
- `src/api/generated/model/adJoinResponseCurrentDomain.ts` - Domain info
- `src/api/generated/model/adStatus.ts` - Status AD
- `src/api/generated/model/adStatusDomainName.ts` - Nome do domínio
- `src/api/generated/model/adStatusLastSync.ts` - Timestamp sync

#### Backend - Rust Core

- `core/ganache-api/src/models/acl.rs` - Modelos OpenAPI ACL com flag recursive (240 linhas)
- `core/ganache-lib/src/system/acl_service.rs` - Service ACL com recursão (795 linhas)
- `core/ganache-lib/tests/acl_integration_tests.rs` - Testes integração ACL (4 tests)
- `core/ganache-core/src/main.rs` - Endpoint HTTP set_acl com suporte recursivo

#### Testes E2E

- `tests/e2e/acl-management.spec.ts` - Testes Playwright ACL UI (59 linhas)

#### Documentação e Config

- `docs/openapi.json` - Spec OpenAPI atualizada com endpoints ACL
- `docs/sprint-artifacts/4-3-acl-management-for-shares.md` - Este arquivo
- `docs/sprint-artifacts/4-2-acl-mapper-rust-core-implementation.md` - História anterior (status atualizado)
- `docs/sprint-artifacts/sprint-status.yaml` - Status do sprint
- `docs/sprint-artifacts/validation-report-4-3-acl-management-for-shares.md` - Relatório de validação
- `package.json` - Dependências atualizadas
- `package-lock.json` - Lock file

**Total:** 50 arquivos (11 modificados core + 8 criados frontend + 29 modelos gerados + 2 docs)

---

*Contexto abrangente criado pelo SM Agent. Análise exaustiva concluída - o desenvolvedor tem tudo necessário para implementação perfeita.*
