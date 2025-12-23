use anyhow::Result;
use chrono::Utc;
use ganache_api::models::security::{EventFilter, SecurityEvent, SecurityEventType, SeverityLevel};
use serde_json::json;
use std::sync::{Arc, RwLock};

/// Cache global de eventos de segurança
///
/// # Purpose
/// Armazena eventos das últimas 24h em memória para acesso rápido
///
/// @ref Story-5.4 - In-memory event cache for 24h retention
static EVENT_CACHE: once_cell::sync::Lazy<Arc<RwLock<Vec<SecurityEvent>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(RwLock::new(Vec::new())));

/// Cursor de tempo para evitar perda de logs
static LAST_TTY_CHECK: once_cell::sync::Lazy<Arc<RwLock<chrono::DateTime<Utc>>>> =
    once_cell::sync::Lazy::new(|| {
        Arc::new(RwLock::new(Utc::now() - chrono::Duration::seconds(60)))
    });

static LAST_SSH_CHECK: once_cell::sync::Lazy<Arc<RwLock<chrono::DateTime<Utc>>>> =
    once_cell::sync::Lazy::new(|| {
        Arc::new(RwLock::new(Utc::now() - chrono::Duration::seconds(60)))
    });

/// Broadcaster para eventos em tempo real
static EVENT_BROADCASTER: once_cell::sync::Lazy<tokio::sync::broadcast::Sender<SecurityEvent>> =
    once_cell::sync::Lazy::new(|| {
        let (tx, _) = tokio::sync::broadcast::channel(1024);
        tx
    });

/// Serviço de coleta e gerenciamento de eventos de segurança
///
/// # Purpose
/// Agrega eventos de múltiplas fontes (SSH, Git, arquivos) e fornece
/// API para consulta com filtros
///
/// @ref Story-5.4 - Security event collection service
pub struct SecurityEventService;

impl SecurityEventService {
    /// Inicializa o serviço
    ///
    /// # Purpose
    /// Prepara o cache e inicia thread de limpeza automática
    ///
    /// @ref Story-5.4 - Service initialization
    pub fn init() -> Result<()> {
        tracing::info!("Initializing Security Event Service");

        // Thread de limpeza automática (executa a cada 1 hora)
        std::thread::spawn(|| {
            loop {
                std::thread::sleep(std::time::Duration::from_secs(3600)); // 1h
                if let Err(e) = Self::cleanup_old_events() {
                    tracing::warn!("Failed to cleanup old events: {}", e);
                }
            }
        });

        Ok(())
    }

    /// Adiciona um evento ao cache
    ///
    /// # Arguments
    /// * `event` - Evento de segurança a ser adicionado
    ///
    /// # Purpose
    /// Armazena evento no cache em memória e dispara broadcast para WebSocket
    ///
    /// @ref Story-5.4 - Event insertion
    pub fn add_event(event: SecurityEvent) -> Result<()> {
        let mut cache = EVENT_CACHE
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to acquire write lock: {}", e))?;

        tracing::debug!(
            event_type = ?event.event_type,
            user = %event.user,
            "Adding security event"
        );

        // Broadcast do evento ANTES do push (ou depois, não importa muito)
        let _ = EVENT_BROADCASTER.send(event.clone());

        cache.push(event);
        Ok(())
    }

    /// Retorna um receiver para o canal de broadcast
    pub fn subscribe() -> tokio::sync::broadcast::Receiver<SecurityEvent> {
        EVENT_BROADCASTER.subscribe()
    }

    /// Busca eventos com filtros aplicados
    ///
    /// # Arguments
    /// * `filter` - Critérios de filtro e paginação
    ///
    /// # Returns
    /// Lista de eventos que correspondem aos filtros
    ///
    /// # Purpose
    /// Permite consultas flexíveis com filtros REST API
    ///
    /// @ref Story-5.4 - Filtered event queries
    pub fn get_events(filter: &EventFilter) -> Result<Vec<SecurityEvent>> {
        let cache = EVENT_CACHE
            .read()
            .map_err(|e| anyhow::anyhow!("Failed to acquire read lock: {}", e))?;

        let mut events: Vec<SecurityEvent> = cache
            .iter()
            .filter(|e| {
                // Filtro por tipo
                if let Some(ref event_type) = filter.event_type {
                    if &e.event_type != event_type {
                        return false;
                    }
                }

                // Filtro por usuário
                if let Some(ref user) = filter.user {
                    if !e.user.contains(user) {
                        return false;
                    }
                }

                // Filtro por IP
                if let Some(ref ip) = filter.source_ip {
                    if let Some(ref event_ip) = e.source_ip {
                        if !event_ip.contains(ip) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                // Filtro por severidade
                if let Some(ref severity) = filter.severity {
                    if &e.severity != severity {
                        return false;
                    }
                }

                // Filtro por data (simplificado - assume ISO 8601)
                if let Some(ref date_from) = filter.date_from {
                    if e.timestamp < *date_from {
                        return false;
                    }
                }

                if let Some(ref date_to) = filter.date_to {
                    if e.timestamp > *date_to {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect();

        // Ordenar por timestamp desc (mais recentes primeiro)
        events.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        // Aplicar paginação
        let start = filter.offset as usize;
        let end = (start + filter.limit as usize).min(events.len());

        if start >= events.len() {
            return Ok(Vec::new());
        }

        Ok(events[start..end].to_vec())
    }

    /// Retorna eventos recentes (últimos N minutos)
    ///
    /// # Arguments
    /// * `minutes` - Janela de tempo em minutos
    ///
    /// @ref Story-5.4 - Recent events query
    pub fn get_recent_events(minutes: u32) -> Result<Vec<SecurityEvent>> {
        let cutoff = Utc::now() - chrono::Duration::minutes(minutes as i64);
        let cutoff_str = cutoff.to_rfc3339();

        let filter = EventFilter {
            date_from: Some(cutoff_str),
            limit: 1000,
            ..Default::default()
        };

        Self::get_events(&filter)
    }

    /// Decodifica dados hexadecimal de logs TTY
    pub fn decode_tty_data(hex_data: &str) -> Result<String> {
        let clean_hex = hex_data.replace(' ', "");
        let bytes = hex::decode(clean_hex)?;
        let mut decoded = String::from_utf8(bytes)?;

        // Remover caracteres de controle (como \r ou \n) e limpar o comando
        decoded = decoded.replace('\r', "").replace('\n', "");
        Ok(decoded)
    }

    /// Processa uma linha de log TTY e converte em SecurityEvent
    pub fn parse_tty_log(line: &str, default_user: &str) -> Option<SecurityEvent> {
        if !line.contains("type=TTY") {
            return None;
        }

        // Tenta extrair timestamp do formato msg=audit(1734918247.123:456)
        let timestamp = if let Some(start) = line.find("msg=audit(") {
            let rest = &line[start + 10..];
            if let Some(end) = rest.find(':') {
                let ts_str = &rest[..end];
                if let Ok(ts_float) = ts_str.parse::<f64>() {
                    let secs = ts_float as i64;
                    let nsecs = ((ts_float - secs as f64) * 1_000_000_000.0) as u32;
                    if let Some(dt) = chrono::DateTime::from_timestamp(secs, nsecs) {
                        Some(dt.to_rfc3339())
                    } else {
                        None
                    }
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
        .unwrap_or_else(|| Utc::now().to_rfc3339()); // Fallback para agora se falhar

        // Extrair campos (ex: terminal=pts/1 res=1 data=...)
        let terminal = line
            .split("terminal=")
            .nth(1)
            .and_then(|s| s.split_whitespace().next());
        let data = line
            .split("data=")
            .nth(1)
            .and_then(|s| s.split_whitespace().next());

        if let Some(hex_data) = data {
            if let Ok(command) = Self::decode_tty_data(hex_data) {
                if command.is_empty() {
                    return None;
                }

                let event_id =
                    uuid::Uuid::new_v5(&uuid::Uuid::NAMESPACE_OID, line.as_bytes()).to_string();

                return Some(SecurityEvent {
                    id: event_id,
                    timestamp, // Usar timestamp extraído
                    event_type: SecurityEventType::SshCommand,
                    severity: SeverityLevel::Info,
                    user: default_user.to_string(), // O audit log nem sempre traz o usuário de forma fácil
                    source_ip: None,
                    action: command.clone(),
                    resource: terminal.map(|t| format!("/dev/{}", t)),
                    details: json!({
                        "raw_log": line,
                        "command": command,
                        "terminal": terminal
                    }),
                });
            }
        }

        None
    }

    /// Coleta eventos de sistema (SSH logs, Git commits, Audi TTY)
    ///
    /// # Returns
    /// Número de eventos coletados
    ///
    /// # Purpose
    /// Processa logs do journald e Git para gerar SecurityEvents
    ///
    /// @ref Story-5.4 - System event collection
    pub async fn collect_system_events() -> Result<usize> {
        let mut collected = 0;

        // Coletar eventos SSH via journalctl
        collected += Self::collect_ssh_events().await?;

        // Coletar eventos de configuração via Git
        collected += Self::collect_git_events().await?;

        // Coletar eventos TTY via audit logs (História 5.1)
        collected += Self::collect_tty_audit_events().await?;

        tracing::debug!("Collected {} new security events", collected);
        Ok(collected)
    }

    /// Coleta eventos de auditoria TTY
    async fn collect_tty_audit_events() -> Result<usize> {
        let mut collected = 0;

        // Calcular janela de tempo baseada na última verificação
        let last_check = *LAST_TTY_CHECK.read().unwrap();
        let now = Utc::now();

        // Atualizar cursor IMEDIATAMENTE antes de rodar o comando para evitar gap se o comando demorar
        // Mas existe risco de perder logs que chegam ENQUANTO o comando roda se usarmos 'now'.
        // O journalctl aceita --since "YYYY-MM-DD HH:MM:SS".

        let since_arg = last_check.format("%Y-%m-%d %H:%M:%S").to_string();

        // Executar journalctl para buscar mensagens de auditoria TTY
        let output = std::process::Command::new("journalctl")
            .args(&["_TRANSPORT=audit", "--since", &since_arg, "--no-pager"])
            .output();

        // Atualizar o checkpoint apenas se sucesso
        if output.is_ok() {
            *LAST_TTY_CHECK.write().unwrap() = now;
        }

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                // Tentar capturar o usuário do log de auditoria se disponível
                let user = line
                    .split("uid=")
                    .nth(1)
                    .and_then(|s| s.split_whitespace().next())
                    .unwrap_or("unknown");

                if let Some(event) = Self::parse_tty_log(line, user) {
                    let mut event = event;
                    // Tenta resolver UIDs comuns para nomes mais amigáveis se o audit log trouxe apenas números
                    if event.user == "0" {
                        event.user = "root".to_string();
                    } else if event.user == "1000" {
                        event.user = "admin".to_string(); // Default admin user in appliance
                    }

                    if !Self::event_exists(&event.id) {
                        Self::add_event(event)?;
                        collected += 1;
                    }
                }
            }
        }
        Ok(collected)
    }

    /// Coleta eventos SSH do journald
    ///
    /// @ref Story-5.4 - SSH log parsing
    async fn collect_ssh_events() -> Result<usize> {
        let mut collected = 0;

        // Calcular janela de tempo ssh
        let last_check = *LAST_SSH_CHECK.read().unwrap();
        let now = Utc::now();
        let since_arg = last_check.format("%Y-%m-%d %H:%M:%S").to_string();

        // Executar journalctl para buscar falhas de login SSH
        let output = std::process::Command::new("journalctl")
            .args(&["-u", "ssh", "--since", &since_arg, "--no-pager"])
            .output();

        if output.is_ok() {
            *LAST_SSH_CHECK.write().unwrap() = now;
        }

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if line.contains("Failed password")
                    || line.contains("Accepted password")
                    || line.contains("Accepted publickey")
                {
                    let is_failure = line.contains("Failed password");
                    let user = line
                        .split("for ")
                        .nth(1)
                        .and_then(|s| s.split_whitespace().next())
                        .unwrap_or("unknown");
                    let ip = line
                        .split("from ")
                        .nth(1)
                        .and_then(|s| s.split_whitespace().next())
                        .unwrap_or("unknown");

                    // Use the log line itself for the deterministic ID to ensure stability across polls.
                    // journalctl output includes timestamp and PID, making it unique enough.
                    let event_id =
                        uuid::Uuid::new_v5(&uuid::Uuid::NAMESPACE_OID, line.as_bytes()).to_string();

                    let event = SecurityEvent {
                        id: event_id,
                        timestamp: Utc::now().to_rfc3339(), // Use collection time as model timestamp
                        event_type: SecurityEventType::SshLogin,
                        severity: if is_failure {
                            SeverityLevel::Warning
                        } else {
                            SeverityLevel::Info
                        },
                        user: user.to_string(),
                        source_ip: Some(ip.to_string()),
                        action: if is_failure {
                            "Failed SSH login attempt".to_string()
                        } else {
                            "Successful SSH login".to_string()
                        },
                        resource: Some("/ssh".to_string()),
                        details: json!({
                            "raw_log": line,
                            "is_failure": is_failure
                        }),
                    };

                    // Check if event with this ID already exists in cache
                    if !Self::event_exists(&event.id) {
                        Self::add_event(event)?;
                        collected += 1;
                    }
                }
            }
        }
        Ok(collected)
    }

    /// Coleta eventos de configuração do Git
    ///
    /// @ref Story-5.4 - Git event integration
    async fn collect_git_events() -> Result<usize> {
        let mut collected = 0;
        let repo_path = "/etc/ganache";

        // Executar git log para buscar commits nos últimos 10 segundos
        let output = std::process::Command::new("git")
            .arg("-C")
            .arg(repo_path)
            .args(&[
                "log",
                "--since=10 seconds ago",
                "--pretty=format:%H|%an|%s|%ai",
            ])
            .output();

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split('|').collect();
                if parts.len() >= 4 {
                    let commit_hash = parts[0];
                    let author = parts[1];
                    let message = parts[2];
                    // Parse the commit timestamp (format %ai is like 2025-12-23 01:23:45 +0000)
                    let commit_time = parts[3];
                    let event_id = commit_hash.to_string();

                    let event = SecurityEvent {
                        id: event_id,
                        timestamp: commit_time.to_string(),
                        event_type: SecurityEventType::ConfigChange,
                        severity: SeverityLevel::Info,
                        user: author.to_string(),
                        source_ip: None,
                        action: format!("Configuration change: {}", message),
                        resource: Some("/etc/ganache".to_string()),
                        details: json!({
                            "commit_message": message,
                            "repository": repo_path
                        }),
                    };

                    // Check if event with this ID already exists in cache to avoid duplication
                    if !Self::event_exists(&event.id) {
                        Self::add_event(event)?;
                        collected += 1;
                    }
                }
            }
        }

        Ok(collected)
    }

    /// Remove eventos com mais de 24 horas
    ///
    /// # Purpose
    /// Mantém o cache dentro do limite de memória
    ///
    /// @ref Story-5.4 - Automatic cache cleanup
    fn cleanup_old_events() -> Result<()> {
        let cutoff = Utc::now() - chrono::Duration::hours(24);
        let cutoff_str = cutoff.to_rfc3339();

        let mut cache = EVENT_CACHE
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to acquire write lock: {}", e))?;

        let before = cache.len();
        cache.retain(|e| e.timestamp >= cutoff_str);
        let after = cache.len();

        if before > after {
            tracing::info!(
                "Cleaned up {} old security events (24h retention)",
                before - after
            );
        }

        Ok(())
    }

    /// Retorna total de eventos no cache
    ///
    /// @ref Story-5.4 - Cache statistics
    pub fn get_total_events() -> Result<usize> {
        let cache = EVENT_CACHE
            .read()
            .map_err(|e| anyhow::anyhow!("Failed to acquire read lock: {}", e))?;
        Ok(cache.len())
    }

    /// Verifica se um evento já existe no cache
    pub fn event_exists(id: &str) -> bool {
        if let Ok(cache) = EVENT_CACHE.read() {
            cache.iter().any(|e| e.id == id)
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_add_and_get_events() {
        let event = SecurityEvent {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now().to_rfc3339(),
            event_type: SecurityEventType::SshLogin,
            severity: SeverityLevel::Info,
            user: "testuser".to_string(),
            source_ip: Some("10.0.0.1".to_string()),
            action: "test action".to_string(),
            resource: None,
            details: json!({}),
        };

        SecurityEventService::add_event(event.clone()).unwrap();

        let filter = EventFilter {
            user: Some("testuser".to_string()),
            ..Default::default()
        };

        let results = SecurityEventService::get_events(&filter).unwrap();
        assert!(!results.is_empty());
        assert_eq!(results[0].user, "testuser");
    }

    #[test]
    fn test_event_filtering_by_type() {
        let event1 = SecurityEvent {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now().to_rfc3339(),
            event_type: SecurityEventType::SshLogin,
            severity: SeverityLevel::Info,
            user: "user1".to_string(),
            source_ip: None,
            action: "test".to_string(),
            resource: None,
            details: json!({}),
        };

        let event2 = SecurityEvent {
            event_type: SecurityEventType::ConfigChange,
            ..event1.clone()
        };

        SecurityEventService::add_event(event1).unwrap();
        SecurityEventService::add_event(event2).unwrap();

        let filter = EventFilter {
            event_type: Some(SecurityEventType::ConfigChange),
            ..Default::default()
        };

        let results = SecurityEventService::get_events(&filter).unwrap();
        assert!(results
            .iter()
            .all(|e| e.event_type == SecurityEventType::ConfigChange));
    }
}
