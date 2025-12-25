# Traceability Matrix

Generated automatically. Do not edit manually.

## Story 3.1

| File | Line | Context |
| --- | --- | --- |
| `core/ganache-core/src/auth.rs` | 28 | Git-backed configuration engine with user attribution |

## Story 3.2

| File | Line | Context |
| --- | --- | --- |
| `src/api/generated/model/gitCommit.ts` | 14 | Implements GitCommit model for configuration audit timeline |
| `src/api/generated/model/gitDiff.ts` | 15 | Implements GitDiff model for visual comparison of configuration changes |
| `src/api/generated/model/gitFileDiff.ts` | 14 | File-level diff details for expandable sections in CommitDiffModal |
| `src/api/generated/default/default.ts` | 807 | Fetch paginated list of configuration commits |
| `src/api/generated/default/default.ts` | 900 | Visual comparison of configuration changes |
| `core/ganache-api/src/models/git_commit.rs` | 9 | Implements GitCommit model for configuration audit timeline |
| `core/ganache-api/src/models/git_commit.rs` | 29 | Implements GitDiff model for visual comparison of configuration changes |
| `core/ganache-api/src/models/git_commit.rs` | 43 | File-level diff details for expandable sections in CommitDiffModal |
| `core/ganache-core/src/main.rs` | 492 | Server-side filtering and pagination for git history |
| `core/ganache-core/src/main.rs` | 593 | Fetch paginated list of configuration commits |
| `core/ganache-core/src/main.rs` | 630 | Visual comparison of configuration changes |
| `core/ganache-core/src/services/git_history_service.rs` | 11 | Git history service for configuration audit timeline |
| `core/ganache-core/src/services/git_history_service.rs` | 34 | Server-side filtering and pagination for commit history |
| `core/ganache-core/src/services/git_history_service.rs` | 143 | Visual comparison of configuration changes |

## Story 3.3

| File | Line | Context |
| --- | --- | --- |
| `src/components/features/history/RollbackButton.tsx` | 24 | Implements one-click config rollback UI |
| `src/api/generated/model/rollbackRequest.ts` | 14 | Implements rollback request model for one-click config rollback |
| `src/api/generated/model/rollbackResponse.ts` | 14 | Rollback success response |
| `src/api/generated/default/default.ts` | 994 | Implements rollback endpoint for configuration time-machine |
| `tests/e2e/rollback.spec.ts` | 5 |  |
| `core/ganache-api/src/models/rollback.rs` | 9 | Implements rollback request model for one-click config rollback |
| `core/ganache-api/src/models/rollback.rs` | 23 | Rollback success response |
| `core/ganache-core/src/main.rs` | 669 | Implements rollback endpoint for configuration time-machine |
| `core/ganache-lib/src/git.rs` | 132 | Implements git-based configuration rollback |
| `core/ganache-lib/src/git.rs` | 148 | Implements git-based configuration rollback with validation |

## Story 4.1

| File | Line | Context |
| --- | --- | --- |
| `src/api/generated/model/adJoinRequest.ts` | 15 | Active Directory domain join request model |
| `src/api/generated/model/adJoinResponse.ts` | 15 | Active Directory domain join response model |
| `src/api/generated/model/adStatus.ts` | 16 | Active Directory status model |
| `src/api/generated/default/default.ts` | 337 | API endpoint for AD domain join |
| `src/api/generated/default/default.ts` | 405 | Leave AD domain functionality |
| `src/api/generated/default/default.ts` | 469 | Query AD join status |
| `tests/e2e/active-directory.spec.ts` | 6 | Active Directory domain join E2E tests |
| `core/ganache-api/src/models/active_directory.rs` | 9 | Active Directory domain join request model |
| `core/ganache-api/src/models/active_directory.rs` | 30 | Active Directory domain join response model |
| `core/ganache-api/src/models/active_directory.rs` | 47 | Active Directory status model |
| `core/ganache-core/src/main.rs` | 742 | API endpoint for AD domain join |
| `core/ganache-core/src/main.rs` | 790 | Query AD join status |
| `core/ganache-core/src/main.rs` | 816 | Leave AD domain functionality |
| `core/ganache-lib/src/system/ad_service.rs` | 11 | Active Directory integration service |
| `core/ganache-lib/src/system/ad_service.rs` | 29 | Implements AD domain join logic |
| `core/ganache-lib/src/system/ad_service.rs` | 77 | Query AD join status |
| `core/ganache-lib/src/system/ad_service.rs` | 123 | Leave AD domain functionality |
| `core/ganache-lib/tests/integration_ad.rs` | 12 | Integration tests for AD domain join functionality |

## Story 4.2

| File | Line | Context |
| --- | --- | --- |
| `src/api/generated/model/aceInheritFlags.ts` | 14 | ACL inheritance spec |
| `src/api/generated/model/acePrincipal.ts` | 16 | ACE principal enum |
| `src/api/generated/model/aceType.ts` | 14 | ACE type enum |
| `src/api/generated/model/adPrincipal.ts` | 16 | ACL principal model |
| `src/api/generated/model/adPrincipalType.ts` | 14 | ACL principal type enum |
| `src/api/generated/model/adSearchRequest.ts` | 16 | ACL search request model |
| `src/api/generated/model/adSearchResponse.ts` | 15 | ACL search response model |
| `src/api/generated/model/getAclResponse.ts` | 16 | ACL get response |
| `src/api/generated/model/nfs4Ace.ts` | 19 | NFSv4 ACE implementation |
| `src/api/generated/model/nfs4Acl.ts` | 15 | NFSv4 ACL container |
| `src/api/generated/model/nfs4Permissions.ts` | 14 | NFSv4 permissions spec |
| `src/api/generated/model/setAclRequest.ts` | 15 | ACL set request |
| `src/api/generated/model/setAclResponse.ts` | 14 | ACL set response |
| `src/api/generated/default/default.ts` | 70 | Searchable AD principal listing endpoint |
| `src/api/generated/default/default.ts` | 163 | ACL retrieval endpoint |
| `src/api/generated/default/default.ts` | 263 | ACL modification endpoint |
| `tests/e2e/acl.spec.ts` | 4 | ACL API endpoints E2E validation |
| `core/ganache-api/src/models/active_directory.rs` | 69 | ACL principal type enum |
| `core/ganache-api/src/models/active_directory.rs` | 84 | ACL principal model |
| `core/ganache-api/src/models/active_directory.rs` | 103 | ACL search request model |
| `core/ganache-api/src/models/active_directory.rs` | 129 | ACL search response model |
| `core/ganache-api/src/models/acl.rs` | 9 | ACE type enum |
| `core/ganache-api/src/models/acl.rs` | 28 | ACE principal enum |
| `core/ganache-api/src/models/acl.rs` | 49 | NFSv4 permissions spec |
| `core/ganache-api/src/models/acl.rs` | 87 | ACL inheritance spec |
| `core/ganache-api/src/models/acl.rs` | 111 | NFSv4 ACE implementation |
| `core/ganache-api/src/models/acl.rs` | 132 | NFSv4 ACL container |
| `core/ganache-api/src/models/acl.rs` | 146 | ACL get request |
| `core/ganache-api/src/models/acl.rs` | 165 | ACL get response |
| `core/ganache-api/src/models/acl.rs` | 180 | ACL set request |
| `core/ganache-api/src/models/acl.rs` | 197 | ACL set response |
| `core/ganache-core/src/main.rs` | 854 | Searchable AD principal listing endpoint |
| `core/ganache-core/src/main.rs` | 905 | ACL retrieval endpoint |
| `core/ganache-core/src/main.rs` | 944 | ACL modification endpoint |
| `core/ganache-lib/src/system/acl_service.rs` | 16 | ACL service implementation |
| `core/ganache-lib/src/system/acl_service.rs` | 36 | Implements searchable AD principal listing with pagination |
| `core/ganache-lib/src/system/acl_service.rs` | 89 | Implements ACL retrieval and parsing |
| `core/ganache-lib/src/system/acl_service.rs` | 435 | ACL validation with owner@ requirement check |
| `core/ganache-lib/tests/acl_integration_tests.rs` | 3 | ACL service integration tests |

## Story 4.3

| File | Line | Context |
| --- | --- | --- |
| `src/api/generated/default/default.ts` | 264 | Added recursive support |
| `core/ganache-core/src/main.rs` | 945 | Added recursive support |
| `core/ganache-lib/src/system/acl_service.rs` | 135 | Implements recursive ACL modification |

## Story 5.1

| File | Line | Context |
| --- | --- | --- |
| `tests/support/factories/security-event.factory.ts` | 8 | Deep SSH Audit Logging |

## Story 5.2

| File | Line | Context |
| --- | --- | --- |
| `src/app/audit/page.tsx` | 11 | Visual audit manager dashboard |
| `src/components/features/security/AuditSearch.tsx` | 18 | Visual audit manager search UI |
| `tests/support/factories/security-event.factory.ts` | 9 | Visual Audit Manager |
| `core/ganache-api/src/models/security.rs` | 182 | Event filtering with filename search |
| `core/ganache-core/src/main.rs` | 1006 | Security events endpoint with filename search |
| `core/ganache-lib/src/system/security_event_service.rs` | 121 | Filtered event queries with filename search |
| `core/ganache-lib/src/system/security_event_service.rs` | 156 | Filename search implementation |
| `core/ganache-lib/src/system/security_event_service.rs` | 537 | File access event collection |
| `core/ganache-lib/tests/audit_search_tests.rs` | 5 | Test audit log search by filename |
| `core/ganache-lib/tests/audit_search_tests.rs` | 85 | Test search combining filename and user filters |
| `core/ganache-lib/tests/audit_search_tests.rs` | 140 | Test search returns all event types for a file |
| `e2e/audit_search.spec.ts` | 5 | Visual Audit Manager |

## Story 5.3

| File | Line | Context |
| --- | --- | --- |
| `tests/support/fixtures/auth.fixture.ts` | 7 | Break-Glass Emergency Admin testing infrastructure |
| `tests/support/fixtures/break-glass.fixture.ts` | 7 | Break-Glass Emergency Admin |
| `tests/support/factories/user.factory.ts` | 7 | Break-Glass Emergency Admin testing |
| `tests/support/factories/security-event.factory.ts` | 7 | Break-Glass Emergency Admin |
| `tests/e2e/break-glass-activation.spec.ts` | 6 | AC 5.3.1 |
| `tests/e2e/break-glass-password.spec.ts` | 6 | AC 5.3.2 |
| `tests/e2e/break-glass-deactivation.spec.ts` | 6 | AC 5.3.4 |
| `tests/api/break-glass.api.spec.ts` | 7 | Break-Glass Emergency Admin |
| `core/ganache-api/src/models/break_glass.rs` | 9 | AC 5.3.1 - Break-Glass activation request |
| `core/ganache-api/src/models/break_glass.rs` | 26 | AC 5.3.1 - Break-Glass activation response |
| `core/ganache-api/src/models/break_glass.rs` | 43 | AC 5.3.4 - Break-Glass deactivation request |
| `core/ganache-api/src/models/break_glass.rs` | 55 | AC 5.3.4 - Break-Glass deactivation response |
| `core/ganache-api/src/models/break_glass.rs` | 72 | Break-Glass status query |
| `core/ganache-api/src/models/break_glass.rs` | 84 | Break-Glass activation information |
| `core/ganache-api/src/models/break_glass.rs` | 104 | AC 5.3.2 - Password validation |
| `core/ganache-api/src/models/break_glass.rs` | 113 | AC 5.3.2 - Password validation response |
| `core/ganache-core/src/break_glass_handlers.rs` | 26 | AC 5.3.1 - Break-Glass activation endpoint |
| `core/ganache-core/src/break_glass_handlers.rs` | 83 | AC 5.3.4 - Break-Glass deactivation endpoint |
| `core/ganache-core/src/break_glass_handlers.rs` | 138 | Break-Glass status query endpoint |
| `core/ganache-core/src/break_glass_handlers.rs` | 179 | AC 5.3.2 - Password validation endpoint |
| `core/ganache-lib/src/system/break_glass_service.rs` | 17 | Break-Glass emergency admin state |
| `core/ganache-lib/src/system/break_glass_service.rs` | 33 | Break-Glass activation tracking |
| `core/ganache-lib/src/system/break_glass_service.rs` | 63 | Break-Glass emergency admin service |
| `core/ganache-lib/src/system/break_glass_service.rs` | 72 | AC 5.3.1 - Carregamento de estado persistente |
| `core/ganache-lib/src/system/break_glass_service.rs` | 199 | AC 5.3.1 - Ativação segura com persistência e OS hook |
| `core/ganache-lib/src/system/break_glass_service.rs` | 256 | AC 5.3.4 - Desativação com persistência e OS hook |
| `core/ganache-lib/src/system/break_glass_service.rs` | 304 | AC 5.3.2 - Complexidade de senha |
| `core/ganache-lib/src/system/break_glass_service.rs` | 341 | AC 5.3.2 - Redefinição de senha obrigatória |

## Story 5.4

| File | Line | Context |
| --- | --- | --- |
| `src/app/security/page.tsx` | 7 | Frontend route for security dashboard |
| `tests/e2e/security-dashboard-filters.spec.ts` | 6 | AC 6 |
| `tests/e2e/security-dashboard-metrics.spec.ts` | 7 | AC 4 |
| `tests/e2e/security-dashboard-timeline.spec.ts` | 6 | AC 3 |
| `tests/api/security-dashboard.api.spec.ts` | 6 | Backend API Endpoints |
| `core/ganache-api/src/models/security.rs` | 9 | Security event type enumeration |
| `core/ganache-api/src/models/security.rs` | 32 | Security severity levels |
| `core/ganache-api/src/models/security.rs` | 60 | Core security event model |
| `core/ganache-api/src/models/security.rs` | 90 | Suspicious IP tracking |
| `core/ganache-api/src/models/security.rs` | 116 | Security metrics aggregation |
| `core/ganache-api/src/models/security.rs` | 147 | Security alert model |
| `core/ganache-core/src/main.rs` | 1081 | Security metrics endpoint |
| `core/ganache-core/src/main.rs` | 1104 | Security alerts endpoint |
| `core/ganache-core/src/main.rs` | 1127 | Alert acknowledgement endpoint |
| `core/ganache-core/src/security_handlers.rs` | 11 | Security events endpoint |
| `core/ganache-core/src/security_handlers.rs` | 78 | Security metrics endpoint |
| `core/ganache-core/src/security_handlers.rs` | 100 | Security alerts endpoint |
| `core/ganache-core/src/websocket_security.rs` | 6 | WebSocket streaming implementation |
| `core/ganache-core/src/websocket_security.rs` | 22 | WebSocket endpoint |
| `core/ganache-core/src/websocket_security.rs` | 43 | WebSocket connection handler |
| `core/ganache-lib/src/system/security_event_service.rs` | 12 | In-memory event cache for 24h retention |
| `core/ganache-lib/src/system/security_event_service.rs` | 52 | Security event collection service |
| `core/ganache-lib/src/system/security_event_service.rs` | 61 | Service initialization |
| `core/ganache-lib/src/system/security_event_service.rs` | 86 | Event insertion |
| `core/ganache-lib/src/system/security_event_service.rs` | 217 | Recent events query |
| `core/ganache-lib/src/system/security_event_service.rs` | 462 | System event collection |
| `core/ganache-lib/src/system/security_event_service.rs` | 569 | SSH log parsing |
| `core/ganache-lib/src/system/security_event_service.rs` | 647 | Git event integration |
| `core/ganache-lib/src/system/security_event_service.rs` | 717 | Automatic cache cleanup |
| `core/ganache-lib/src/system/security_event_service.rs` | 742 | Cache statistics |
| `core/ganache-lib/src/system/security_metrics.rs` | 15 | Security metrics calculation service |

## Story 6.1

| File | Line | Context |
| --- | --- | --- |
| `core/ganache-lib/src/system/security_event_service.rs` | 242 | Robust log parsing improvements |
| `core/ganache-lib/src/system/security_event_service.rs` | 365 | Robust Samba log parsing |

## Story 6.4

| File | Line | Context |
| --- | --- | --- |
| `src/app/page.tsx` | 8 | Converted to Server Component for SSR support |
| `src/app/setup/page.tsx` | 4 | Converted to Server Component for SSR |
| `src/app/security/page.tsx` | 8 | Converted to Server Component for SSR |

## Story 9.9

| File | Line | Context |
| --- | --- | --- |
| `core/ganache-test-trace/src/lib.rs` | 1 | Test Traceability |

