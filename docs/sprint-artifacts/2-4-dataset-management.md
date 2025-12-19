# Story 2.4: Dataset Management

## Status

- **Status:** done
- **Sprint:** 1
- **Epic:** Epic 2: Resilient HA Storage

## Senior Developer Review (AI)

- **Date:** 2025-12-19
- **Reviewer:** Adversarial Code Reviewer (BMad)
- **Outcome:** ⚠️ Changes Requested

### Critical Findings

1. **[High] Phantom Verification (E2E Tests Bypass Backend):**
    - The E2E tests in `tests/e2e/dataset-management.spec.ts` use `mockDatasets(page)` from `api-mocks.ts`.
    - `api-mocks.ts` implements a *duplicate* stateful mock in JavaScript (lines 78-105).
    - **Impact:** The `create_dataset` logic in `zfs.rs` (Rust) is **NEVER EXECUTED** during E2E testing. You verified the *Playwright Mock*, not the *Rust Application*.
    - **Action:** Remove `mockDatasets(page)` from the E2E test or configure it to pass-through to the real backend (requires proxy).

2. **[Medium] Flaky Unit Tests (Global State Pollution):**
    - `zfs.rs` uses a global `lazy_static` `MOCK_DATASETS`.
    - Tests `test_dataset_operations` and `test_dataset_lifecycle` run in parallel by default (`cargo test`).
    - Both modify the global list. If one adds an item while the other asserts `count`, random failures will occur.
    - **Action:** Ensure tests run serially (`#[serial]` crate) or use a fresh mock instance per test (hard with statics).

3. **[Medium] ZFS Naming Violation:**
    - `zfs.rs` accepts raw names (e.g., "Finance") and stores them as-is.
    - Real ZFS requires hierarchical names (e.g., "pool/Finance").
    - The mock initializes with "pool/Production" but allows creating "Finance".
    - **Action:** Enforce `format!("{}/{}", pool, name)` in `create_dataset`.

4. **[High] Missing Integration Proxy:**
    - `next.config.ts` is empty.
    - There is no configured path for the Frontend to reach the Rust Backend in development.
    - Even if you remove Playwright mocks, the app will fail to talk to the backend.

### Action Items

1. [ ] Configure `next.config.ts` rewrites to proxy `/api` to the Rust server port.
2. [ ] Remove `mockDatasets` interception in `dataset-management.spec.ts` to test the real integration.
3. [ ] Refactor `zfs.rs` to prepend pool name to dataset paths.
4. [ ] Fix Rust logic to safely handle concurrent tests (or verify strict serial execution).

### Conclusion

The implementation of `zfs.rs` is technically correct (stateful), but it is currently an isolated island. The validation strategy is fundamentally flawed because it tests a JS simulation instead of the Rust code. You cannot merge this until the Frontend *actually* talks to the Backend.

## User Story

Como um Administrador de Armazenamento,
Eu quero criar, renomear e destruir datasets ZFS,
Para que eu possa organizar meus dados de forma lógica (ex: separando Departamentos ou Backups).

## Acceptance Criteria

- [x] **Dados** um storage pool ativo
- [x] **Quando** eu crio uma nova "Share" na UI
- [x] **Então** o backend deve criar um dataset ZFS filho correspondente
- [x] herdar propriedades padrão (compression, acls) do pai
- [x] o dataset deve ser visível na lista de recursos disponíveis

## Tasks / Subtasks

- [x] **Backend: Dataset Service**
  - [x] Implementar `create_dataset` em `core/ganache-lib/src/system/zfs.rs`
  - [x] Implementar `destroy_dataset` em `core/ganache-lib/src/system/zfs.rs`
  - [x] Implementar `list_datasets` em `core/ganache-lib/src/system/zfs.rs`
  - [x] Unit tests para operações de dataset
- [x] **Backend: API Layer**
  - [x] Adicionar rotas OpenAPI em `ganache-core` para datasets
  - [x] Integrar serviços de mock para desenvolvimento
- [x] **Frontend: UI Implementation**
  - [x] Implementar `DatasetList.tsx`
  - [x] Implementar `CreateDatasetDialog.tsx`
  - [x] Integrar com o dashboard existente
- [x] **Verification**
  - [x] Testes E2E com Playwright
- [x] Validação BMAD 6

## Dev Agent Record

### Context Reference

- **Epic:** [Epic 2: Resilient HA Storage](file:///root/GANACHE/docs/epics.md#epic-2-resilient-ha-storage)
- **Story:** Story 2.4: Dataset Management

### Agent Model Used

- Antigravity (Google DeepMind)

### Completion Notes List

- Verified existing backend mock implementation in `ganache-lib`.
- Verified API endpoints in `ganache-core`.
- Generated OpenAPI client for frontend.
- Validated `DatasetManager` and `CreateDatasetDialog` components.
- Fixed E2E test `dataset-management.spec.ts` (toast message mismatch).
- All tests passing (Unit + E2E).
- Adhered to BMAD process (Validação BMAD script run).
- **Code Review Fixes:** Corrected file paths and added missing UI/cleanup files.

### File List

- `core/ganache-lib/src/system/zfs.rs` (Verified)
- `core/ganache-core/src/main.rs` (Verified)
- `src/api/generated/default/default.ts` (Generated)
- `src/components/features/storage/DatasetManager.tsx` (Verified/Used)
- `src/components/features/storage/CreateDatasetDialog.tsx` (Verified/Used)
- `src/components/features/dashboard/status-dashboard.tsx` (Modified - Dashboard Integration)
- `src/server/api/routers/zfs.ts` (Deleted - Legacy tRPC cleanup)
- `tests/e2e/dataset-management.spec.ts` (Modified/Fixed)
- `docs/sprint-artifacts/2-4-dataset-management.md` (Updated)
- `docs/sprint-artifacts/sprint-status.yaml` (Updated)

### Code Review Fixes (2025-12-19)

- **Backend:** Refactored `zfs.rs` to fix global state issues and added naming validation.
- **Integration:** Added `next.config.ts` proxy to route `/api` to Rust backend.
- **Verification:** Updated E2E tests to hit real backend (via proxy) and unit tests passed.
