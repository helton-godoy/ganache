# Documentation: ganache-lib

## File: `src/lib.rs`

Detects if the system is running on Legacy RAID hardware (PERC 6/i, H700, etc)
This implementation calls `lspci` and parses the output.

```rust
pub fn detect_raid_controller() -> Result<HardwareInfo>
```

---

## File: `src/git.rs`

Get the current repository path (respects GANACHE_CONFIG_DIR env var)

```rust
pub fn get_repo_path() -> std::path::PathBuf
```

---

Initialize git repository at the default path if not exists

```rust
pub fn init_repo() -> Result<()>
```

---

Initialize git repository at the specified path if not exists

```rust
pub fn init_repo_at<P: AsRef<Path>>(repo_path: P) -> Result<()>
```

---

Commit changes using default repository path

```rust
pub fn commit_changes(username: &str, action: &str, resource: &str) -> Result<()>
```

---

Commit changes with username and message at specific path

```rust
pub fn commit_changes_at<P: AsRef<Path>>(
```

---

Rollback configuration to a specific commit using default repository path

# Purpose
One-click rollback of configuration to a previous state

@ref Story-3.3 - Implements git-based configuration rollback

```rust
pub fn rollback_config(commit_id: &str, username: &str, reason: &str) -> Result<String>
```

---

Rollback configuration to a specific commit at a specific path

# Purpose
One-click rollback of configuration to a previous state with audit trail

# Arguments
* `repo_path` - Path to git repository
* `commit_id` - Commit ID to rollback to
* `username` - User performing the rollback
* `reason` - Reason for rollback (audit trail)

@ref Story-3.3 - Implements git-based configuration rollback with validation

```rust
pub fn rollback_config_to<P: AsRef<Path>>(
```

---

## File: `src/system/memory.rs`

Calculate the target ZFS ARC size based on system RAM rules.

Policies:
1. RAM < 32GB: ARC = 50% of RAM
2. RAM >= 32GB: ARC = RAM - 2GB
3. Safety Constraint: Ensure at least 4GB is reserved for OS + Middleware.

```rust
pub fn calculate_arc_target(total_ram_bytes: u64) -> u64
```

---

## File: `src/system/boot.rs`

Lists available ZFS Boot Environments
In a real system, would parse `zfs list` or `beadm list`.
Here we return a mock list.

```rust
pub fn list_boot_environments() -> Result<Vec<BootEnvironment>>
```

---

Activates a Boot Environment for next reboot
In real system: `grub-reboot` or zfs properties

```rust
pub fn activate_boot_environment(name: &str) -> Result<String>
```

---

## File: `src/system/cluster.rs`

Abstract system command execution for testability

```rust
pub trait CommandExecutor
```

---

## File: `src/system/zfs.rs`

Calcula o alvo ARC (Adaptive Replacement Cache) baseado na RAM do sistema

```rust
pub fn calculate_arc_target(system_ram_bytes: u64) -> u64
```

---

Calcula 90% do tamanho total (raw) para quota

```rust
pub fn calculate_90_percent(size_str: &str) -> Result<String>
```

---

## File: `src/system/config_db.rs`

Save configuration to a JSON file in the git-backed directory and commit

```rust
pub fn save_and_commit<T: Serialize>(
```

---

Delete a configuration file and commit

```rust
pub fn delete_and_commit(
```

---

## File: `src/system/ad_service.rs`

Service for managing Active Directory domain operations

# Purpose
Provides secure domain join/leave functionality and status monitoring

@ref Story-4.1 - Active Directory integration service

```rust
pub struct AdService;
```

---

Join the Ganache appliance to an Active Directory domain

# Purpose
Executes the full AD join sequence: DNS configuration, Samba setup, and domain join

# Arguments
* `request` - AD join configuration containing domain, credentials, and DNS settings

# Returns
Result containing join response with success status and current domain

# Errors
Returns error if DNS validation fails, Samba configuration fails, or join command fails

@ref Story-4.1 - Implements AD domain join logic

```rust
pub fn join_domain(request: &AdJoinRequest) -> Result<AdJoinResponse>
```

---

Get current AD join status

# Purpose
Checks if the system is currently joined to an AD domain

# Returns
Result containing AD status with join state and domain information

@ref Story-4.1 - Query AD join status

```rust
pub fn get_status() -> Result<AdStatus>
```

---

Leave the current AD domain

# Purpose
Removes the system from the AD domain and resets Samba configuration

# Returns
Result containing leave response with success status

@ref Story-4.1 - Leave AD domain functionality

```rust
pub fn leave_domain() -> Result<AdJoinResponse>
```

---

## File: `src/system/acl_service.rs`

Service for managing NFSv4 ACLs and AD principal searches

# Purpose
Provides ACL management via nfs4xdr-acl-tools and LDAP searches for user/group lookup

@ref Story-4.2 - ACL service implementation

```rust
pub struct AclService;
```

---

Search Active Directory for users and groups

# Purpose
Performs LDAP query with pagination to list AD principals for ACL assignment

# Arguments
* `request` - Search parameters (query, type filter, pagination)

# Returns
Paginated list of AD principals matching the search criteria

# Errors
Returns error if AD is not joined, LDAP query fails, or parsing fails

@ref Story-4.2 - Implements searchable AD principal listing with pagination

```rust
pub fn search_principals(request: &AdSearchRequest) -> Result<AdSearchResponse>
```

---

Get ACL for a filesystem path

# Purpose
Retrieves and parses ACL using nfs4xdr_getfacl

# Arguments
* `path` - Filesystem path to query
* `format` - Output format ("compact" or "verbose")

# Returns
Structured ACL data

# Errors
Returns error if path doesn't exist or nfs4xdr_getfacl fails

@ref Story-4.2 - Implements ACL retrieval and parsing

```rust
pub fn get_acl(path: &str, format: &str) -> Result<GetAclResponse>
```

---

Set ACL for a filesystem path

# Purpose
Applies ACL using nfs4xdr_setfacl

# Arguments
* `path` - Filesystem path to modify
* `acl` - ACL to apply

# Returns
Success status

# Errors
Returns error if validation fails or nfs4xdr_setfacl fails

@ref Story-4.3 - Implements recursive ACL modification

```rust
pub fn set_acl(path: &str, acl: &Nfs4Acl, recursive: bool) -> Result<SetAclResponse>
```

---

## File: `src/system/security_event_service.rs`

Serviço de coleta e gerenciamento de eventos de segurança

# Purpose
Agrega eventos de múltiplas fontes (SSH, Git, arquivos) e fornece
API para consulta com filtros

@ref Story-5.4 - Security event collection service

```rust
pub struct SecurityEventService;
```

---

Inicializa o serviço

# Purpose
Prepara o cache e inicia thread de limpeza automática

@ref Story-5.4 - Service initialization

```rust
pub fn init() -> Result<()>
```

---

Adiciona um evento ao cache

# Arguments
* `event` - Evento de segurança a ser adicionado

# Purpose
Armazena evento no cache em memória e dispara broadcast para WebSocket

@ref Story-5.4 - Event insertion

```rust
pub fn add_event(event: SecurityEvent) -> Result<()>
```

---

Retorna um receiver para o canal de broadcast

```rust
pub fn subscribe() -> tokio::sync::broadcast::Receiver<SecurityEvent>
```

---

Busca eventos com filtros aplicados

# Arguments
* `filter` - Critérios de filtro e paginação

# Returns
Lista de eventos que correspondem aos filtros

# Purpose
Permite consultas flexíveis com filtros REST API

@ref Story-5.2 - Filtered event queries with filename search

```rust
pub fn get_events(filter: &EventFilter) -> Result<Vec<SecurityEvent>>
```

---

Retorna eventos recentes (últimos N minutos)

# Arguments
* `minutes` - Janela de tempo em minutos

@ref Story-5.4 - Recent events query

```rust
pub fn get_recent_events(minutes: u32) -> Result<Vec<SecurityEvent>>
```

---

Decodifica dados hexadecimal de logs TTY com tratamento robusto de erros

# Arguments
* `hex_data` - String hexadecimal (pode conter espaços)

# Returns
String decodificada ou erro descritivo

# Purpose
Trata edge cases: hex inválido, dados vazios, bytes não-UTF8

@ref Story-6.1 - Robust log parsing improvements

```rust
pub fn decode_tty_data(hex_data: &str) -> Result<String>
```

---

Processa uma linha de log TTY e converte em SecurityEvent

```rust
pub fn parse_tty_log(line: &str, default_user: &str) -> Option<SecurityEvent>
```

---

Processa uma linha de log de auditoria do Samba e converte em SecurityEvent

# Purpose
Parsing robusto com validação de estrutura e campos

@ref Story-6.1 - Robust Samba log parsing

```rust
pub fn parse_samba_audit_log(line: &str) -> Option<SecurityEvent>
```

---

Retorna total de eventos no cache

@ref Story-5.4 - Cache statistics

```rust
pub fn get_total_events() -> Result<usize>
```

---

Verifica se um evento já existe no cache

```rust
pub fn event_exists(id: &str) -> bool
```

---

## File: `src/system/security_metrics.rs`

Serviço de cálculo de métricas de segurança

# Purpose
Calcula métricas agregadas em tempo real a partir dos eventos de segurança

@ref Story-5.4 - Security metrics calculation service

```rust
pub struct SecurityMetricsService;
```

---

Calcula métricas de segurança em tempo real

```rust
pub fn calculate_metrics() -> Result<SecurityMetrics>
```

---

Atualiza o cache de alertas (Stateful)

```rust
pub fn refresh_alerts() -> Result<()>
```

---

## File: `src/system/break_glass_service.rs`

Estado da conta Break-Glass emergency_admin

# Purpose
Controla o estado de ativação da conta de emergência local

@ref Story-5.3 - Break-Glass emergency admin state

```rust
pub enum BreakGlassState
```

---

Informações de ativação Break-Glass

# Purpose
Armazena metadados de quem ativou e quando

@ref Story-5.3 - Break-Glass activation tracking

```rust
pub struct BreakGlassActivation
```

---

Serviço de gerenciamento da conta Break-Glass

# Purpose
Gerencia o ciclo de vida da conta emergency_admin incluindo:
- Ativação/desativação segura
- Auditoria completa de atividades
- Integração com sistema de notificação
- Validação de complexidade de senha
- Persistência de estado e ativação real de usuário no OS

@ref Story-5.3 - Break-Glass emergency admin service

```rust
pub struct BreakGlassService
```

---

Cria nova instância do serviço e carrega estado persistido

@ref Story-5.3 AC 5.3.1 - Carregamento de estado persistente

```rust
pub fn new() -> Self
```

---

Retorna o estado atual da conta

```rust
pub fn get_state(&self) -> Result<BreakGlassState>
```

---

Ativa a conta emergency_admin

@ref Story-5.3 AC 5.3.1 - Ativação segura com persistência e OS hook

```rust
pub fn activate(
```

---

Desativa a conta emergency_admin

@ref Story-5.3 AC 5.3.4 - Desativação com persistência e OS hook

```rust
pub fn deactivate(&self, deactivated_by: String) -> Result<SecurityEvent>
```

---

Valida complexidade de senha

@ref Story-5.3 AC 5.3.2 - Complexidade de senha

```rust
pub fn validate_password_complexity(password: &str) -> Result<()>
```

---

Marca que a senha foi alterada no primeiro login

@ref Story-5.3 AC 5.3.2 - Redefinição de senha obrigatória

```rust
pub fn mark_password_changed(&self) -> Result<()>
```

---

Retorna informações da ativação atual

```rust
pub fn get_activation_info(&self) -> Result<Option<BreakGlassActivation>>
```

---

