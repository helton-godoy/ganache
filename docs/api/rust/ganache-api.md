# Documentation: ganache-api

## File: `src/lib.rs`

Hardware detection information for RAID controller identification.

# Purpose

Used to detect legacy RAID hardware (PERC 6/i, H700) and determine
if the system should run in compatibility mode.

@REF Story-1.1 - Detect RAID hardware and recommend mode

```rust
pub struct HardwareInfo
```

---

Configuration for twin-node HA cluster setup.

# Purpose

Defines the cluster topology including node identification, peer networking,
virtual IP configuration, and DRBD replication settings.

@REF Story-2.1 - Twin-node cluster initialization

```rust
pub struct ClusterConfig
```

---

Real-time status of the HA cluster.

# Purpose

Provides current cluster state, synchronization progress, and status messages
for monitoring and UI display.

@REF Story-2.1 - Twin-node cluster initialization

```rust
pub struct ClusterStatus
```

---

System resource metrics including memory and ZFS ARC configuration.

# Purpose

Reports system memory usage and ZFS Adaptive Replacement Cache (ARC) tuning
parameters for auto-tuning and monitoring.

@REF Story-1.3 - System resource auto-tuning

```rust
pub struct SystemResources
```

---

ZFS Boot Environment metadata.

# Purpose

Represents a ZFS boot environment (BE) snapshot, enabling system rollback
to previous known-good states.

@REF Story-1.4 - Boot environment rollback

```rust
pub struct BootEnvironment
```

---

Request to activate a specific boot environment.

# Purpose

Used to request activation of a boot environment for next reboot.

@REF Story-1.4 - Boot environment rollback

```rust
pub struct BootEnvironmentActivation
```

---

Configuration for creating a new ZFS pool.

# Purpose

Specifies the pool name, target device, and compression settings
for ZFS pool creation on DRBD devices.

@REF Story-2.2 - ZFS pool creation on DRBD

```rust
pub struct PoolConfig
```

---

ZFS pool status and capacity information.

# Purpose

Reports pool health, capacity usage, and quota configuration
for monitoring and management UI.

@REF Story-2.2 - ZFS pool creation on DRBD

```rust
pub struct PoolInfo
```

---

Storage device information (DRBD or disk).

# Purpose

Describes available storage devices for pool creation,
distinguishing between DRBD replicated devices and local disks.

@REF Story-2.2 - ZFS pool creation on DRBD

```rust
pub struct StorageDevice
```

---

Configuration for creating a new ZFS dataset.

# Purpose

Specifies dataset name, compression, and quota settings
for creating child datasets within a ZFS pool.

@REF Story-2.2 - ZFS pool creation on DRBD

```rust
pub struct DatasetConfig
```

---

ZFS dataset status and capacity information.

# Purpose

Reports dataset usage, mount point, and configuration
for management UI and monitoring.

@REF Story-2.2 - ZFS pool creation on DRBD

```rust
pub struct DatasetInfo
```

---

## File: `src/models/config_change.rs`

Represents a configuration change event for audit logging.

# Purpose

Tracks all configuration modifications in the git-backed config system,
providing a complete audit trail of who changed what and when.

@REF Story-3.1 - Git-backed configuration engine audit trail

```rust
pub struct ConfigChange
```

---

## File: `src/models/git_commit.rs`

GitCommit represents a single commit in the configuration repository

# Purpose

Provides commit metadata for the configuration timeline UI

@ref Story-3.2 - Implements GitCommit model for configuration audit timeline

```rust
pub struct GitCommit
```

---

GitDiff represents the diff content for a specific commit

# Purpose

Provides unified diff view for commit changes in the UI

@ref Story-3.2 - Implements GitDiff model for visual comparison of configuration changes

```rust
pub struct GitDiff
```

---

GitFileDiff represents changes to a single file

# Purpose

Contains file-level diff metadata and content

@ref Story-3.2 - File-level diff details for expandable sections in CommitDiffModal

```rust
pub struct GitFileDiff
```

---

## File: `src/models/rollback.rs`

Rollback request payload

# Purpose

Request to rollback configuration to a specific git commit

@ref Story-3.3 - Implements rollback request model for one-click config rollback

```rust
pub struct RollbackRequest
```

---

Rollback response payload

# Purpose

Confirmation of successful rollback operation

@ref Story-3.3 - Rollback success response

```rust
pub struct RollbackResponse
```

---

## File: `src/models/active_directory.rs`

Request payload for joining an Active Directory domain

# Purpose

Contains all necessary information to join a Ganache appliance to an AD domain

@ref Story-4.1 - Active Directory domain join request model

```rust
pub struct AdJoinRequest
```

---

Response after joining AD domain

# Purpose

Provides feedback about AD join operation success/failure

@ref Story-4.1 - Active Directory domain join response model

```rust
pub struct AdJoinResponse
```

---

Active Directory status information

# Purpose

Provides current AD join state and service health

@ref Story-4.1 - Active Directory status model

```rust
pub struct AdStatus
```

---

Type of AD principal (user or group)

# Purpose

Distinguishes between user and group principals in ACL management

@ref Story-4.2 - ACL principal type enum

```rust
pub enum AdPrincipalType
```

---

Active Directory user or group principal

# Purpose

Represents an AD principal (user or group) for ACL assignment

@ref Story-4.2 - ACL principal model

```rust
pub struct AdPrincipal
```

---

Request to search/list AD users and groups

# Purpose

Provides filtering and pagination for AD principal searches

@ref Story-4.2 - ACL search request model

```rust
pub struct AdSearchRequest
```

---

Response containing paginated AD principals

# Purpose

Returns search results with pagination metadata

@ref Story-4.2 - ACL search response model

```rust
pub struct AdSearchResponse
```

---

## File: `src/models/acl.rs`

Type of Access Control Entry (ACE)

# Purpose

Defines the action type for an ACE (allow, deny, audit)

@ref Story-4.2 - ACE type enum

```rust
pub enum AceType
```

---

ACE Principal (who receives the permission)

# Purpose

Represents the principal (user/group) that an ACE applies to

@ref Story-4.2 - ACE principal enum

```rust
pub enum AcePrincipal
```

---

NFSv4 ACL permissions bitflags

# Purpose

Represents the 14 standard NFSv4 permissions as a compact bitmask

@ref Story-4.2 - NFSv4 permissions spec

```rust
pub struct Nfs4Permissions
```

---

ACE inheritance flags

# Purpose

Controls how ACEs are inherited by child files and directories

@ref Story-4.2 - ACL inheritance spec

```rust
pub struct AceInheritFlags
```

---

Single Access Control Entry (ACE)

# Purpose

Represents one permission rule in an NFSv4 ACL

@ref Story-4.2 - NFSv4 ACE implementation

```rust
pub struct Nfs4Ace
```

---

Complete ACL for a file or directory

# Purpose

Represents the full ACL (list of ACEs) for a filesystem object

@ref Story-4.2 - NFSv4 ACL container

```rust
pub struct Nfs4Acl
```

---

Request to get ACL for a path

# Purpose

Query parameters for retrieving ACL in different formats

@ref Story-4.2 - ACL get request

```rust
pub struct GetAclRequest
```

---

Response containing ACL information

# Purpose

Returns parsed ACL data in structured format

@ref Story-4.2 - ACL get response

```rust
pub struct GetAclResponse
```

---

Request to set/modify ACL

# Purpose

Applies new ACL to a filesystem path

@ref Story-4.2 - ACL set request

```rust
pub struct SetAclRequest
```

---

Response after setting ACL

# Purpose

Confirms ACL modification success

@ref Story-4.2 - ACL set response

```rust
pub struct SetAclResponse
```

---

## File: `src/models/security.rs`

Tipo de evento de segurança

# Purpose

Classifica eventos de segurança capturados pelo sistema

@ref Story-5.4 - Security event type enumeration

```rust
pub enum SecurityEventType
```

---

Nível de severidade do evento

# Purpose

Indica a criticidade de um evento de segurança

@ref Story-5.4 - Security severity levels

```rust
pub enum SeverityLevel
```

---

Evento de segurança individual

# Purpose

Representa um único evento de segurança capturado pelo sistema

# Fields

- `id` - UUID único do evento
- `timestamp` - Data/hora do evento em formato ISO 8601
- `event_type` - Tipo do evento (SSH, file access, etc.)
- `severity` - Nível de criticidade
- `user` - Nome do usuário que gerou o evento
- `source_ip` - Endereço IP de origem (opcional)
- `action` - Descrição da ação realizada
- `resource` - Recurso afetado (path, serviço, etc.) (opcional)
- `details` - Metadados adicionais em formato JSON

@ref Story-5.4 - Core security event model

```rust
pub struct SecurityEvent
```

---

IP suspeito com métricas de atividade

# Purpose

Representa um endereço IP identificado como suspeito pelo sistema

@ref Story-5.4 - Suspicious IP tracking

```rust
pub struct SuspiciousIp
```

---

Métricas agregadas de segurança

# Purpose

Fornece visão consolidada da atividade de segurança do sistema

# Fields

- `events_per_minute` - Taxa média de eventos por minuto (últimos 5min)
- `total_events_24h` - Total de eventos nas últimas 24 horas
- `active_users` - Lista de usuários ativos nos últimos 15 minutos
- `suspicious_ips` - IPs com atividade suspeita
- `critical_alerts` - Número de alertas críticos ativos
- `failed_logins_1h` - Logins SSH falhados na última hora

@ref Story-5.4 - Security metrics aggregation

```rust
pub struct SecurityMetrics
```

---

Alerta de segurança ativo

# Purpose

Representa um alerta gerado automaticamente pelo sistema de monitoramento

# Fields

- `id` - UUID único do alerta
- `created_at` - Data/hora de criação (ISO 8601)
- `severity` - Nível de criticidade
- `title` - Título resumido do alerta
- `description` - Descrição detalhada do problema
- `related_events` - IDs dos eventos que geraram o alerta
- `acknowledged` - Se o alerta foi reconhecido por um operador

@ref Story-5.4 - Security alert model

```rust
pub struct SecurityAlert
```

---

Filtros para consulta de eventos de segurança

# Purpose

Permite filtrar e paginar consultas de eventos

# Fields

- `event_type` - Filtrar por tipo de evento
- `user` - Filtrar por nome de usuário
- `source_ip` - Filtrar por IP de origem
- `resource` - Filtrar por nome de arquivo ou recurso (busca parcial)
- `severity` - Filtrar por nível de severidade
- `date_from` - Data inicial (ISO 8601)
- `date_to` - Data final (ISO 8601)
- `limit` - Número máximo de resultados (padrão: 100, max: 1000)
- `offset` - Paginação: número de registros a pular

@ref Story-5.2 - Event filtering with filename search

```rust
pub struct EventFilter
```

---

## File: `src/models/break_glass.rs`

Requisição de ativação da conta Break-Glass

# Purpose

Payload para ativar a conta emergency_admin em caso de falha do AD

@ref Story-5.3 AC 5.3.1 - Break-Glass activation request

```rust
pub struct BreakGlassActivateRequest
```

---

Resposta de ativação da conta Break-Glass

# Purpose

Retorna status da ativação e ID do evento de auditoria gerado

@ref Story-5.3 AC 5.3.1 - Break-Glass activation response

```rust
pub struct BreakGlassActivateResponse
```

---

Requisição de desativação da conta Break-Glass

# Purpose

Payload para desativar a conta emergency_admin após restauração do AD

@ref Story-5.3 AC 5.3.4 - Break-Glass deactivation request

```rust
pub struct BreakGlassDeactivateRequest
```

---

Resposta de desativação da conta Break-Glass

# Purpose

Retorna status da desativação e ID do evento de auditoria gerado

@ref Story-5.3 AC 5.3.4 - Break-Glass deactivation response

```rust
pub struct BreakGlassDeactivateResponse
```

---

Status atual da conta Break-Glass

# Purpose

Resposta para consulta de status da conta emergency_admin

@ref Story-5.3 - Break-Glass status query

```rust
pub struct BreakGlassStatusResponse
```

---

Informações sobre ativação atual da conta Break-Glass

@ref Story-5.3 - Break-Glass activation information

```rust
pub struct BreakGlassActivationInfo
```

---

Requisição de validação de senha

# Purpose

Valida se uma senha atende aos requisitos de complexidade

@ref Story-5.3 AC 5.3.2 - Password validation

```rust
pub struct PasswordValidationRequest
```

---

Resposta de validação de senha

@ref Story-5.3 AC 5.3.2 - Password validation response

```rust
pub struct PasswordValidationResponse
```

---
