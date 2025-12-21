use crate::models::security::{SecurityEvent, SecurityEventType, SeverityLevel, EventFilter};
use anyhow::{Context, Result};
use chrono::Utc;
use serde_json::json;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

/// Cache global de eventos de segurança
///
/// # Purpose
/// Armazena eventos das últimas 24h em memória para acesso rápido
///
/// @ref Story-5.4 - In-memory event cache for 24h retention
static EVENT_CACHE: once_cell::sync::Lazy<Arc<RwLock<Vec<SecurityEvent>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(RwLock::new(Vec::new())));

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
        
        cache.push(event);
        Ok(())
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

    /// Coleta eventos do sistema (SSH logs, Git commits)
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

        tracing::debug!("Collected {} new security events", collected);
        Ok(collected)
    }

    /// Coleta eventos SSH do journald
    ///
    /// @ref Story-5.4 - SSH log parsing
    async fn collect_ssh_events() -> Result<usize> {
        // TODO: Implementar parsing de journalctl
        // Por enquanto, usar stub com eventos simulados
        
        // STUB: Gerar 1-3 eventos SSH aleatórios para teste
        let count = rand::random::<u8>() % 3;
        
        for _ in 0..count {
            let event = SecurityEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().to_rfc3339(),
                event_type: SecurityEventType::SshLogin,
                severity: SeverityLevel::Info,
                user: "admin".to_string(),
                source_ip: Some("192.168.1.100".to_string()),
                action: "SSH login successful".to_string(),
                resource: Some("/ssh".to_string()),
                details: json!({
                    "method": "publickey",
                    "session_id": Uuid::new_v4().to_string()
                }),
            };
            
            Self::add_event(event)?;
        }

        Ok(count as usize)
    }

    /// Coleta eventos de configuração do Git
    ///
    /// @ref Story-5.4 - Git event integration
    async fn collect_git_events() -> Result<usize> {
        // TODO: Integrar com GitService existente
        // Por enquanto, stub sem eventos
        Ok(0)
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
}

#[cfg(test)]
mod tests {
    use super::*;

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
        assert!(results.iter().all(|e| e.event_type == SecurityEventType::ConfigChange));
    }
}
