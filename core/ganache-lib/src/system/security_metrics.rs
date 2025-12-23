use crate::system::security_event_service::SecurityEventService;
use anyhow::Result;
use chrono::Utc;
use ganache_api::models::security::{
    SecurityAlert, SecurityEventType, SecurityMetrics, SeverityLevel, SuspiciousIp,
};
use std::collections::HashMap;
use uuid::Uuid;

/// Serviço de cálculo de métricas de segurança
///
/// # Purpose
/// Calcula métricas agregadas em tempo real a partir dos eventos de segurança
///
/// @ref Story-5.4 - Security metrics calculation service
pub struct SecurityMetricsService;

static ALERT_CACHE: once_cell::sync::Lazy<std::sync::Arc<std::sync::RwLock<Vec<SecurityAlert>>>> =
    once_cell::sync::Lazy::new(|| std::sync::Arc::new(std::sync::RwLock::new(Vec::new())));

impl SecurityMetricsService {
    /// Calcula métricas de segurança em tempo real
    pub fn calculate_metrics() -> Result<SecurityMetrics> {
        // Gera/Atualiza alertas antes de calcular métricas finais
        let _ = Self::refresh_alerts();

        // Taxa de eventos por minuto (média móvel de 5min)
        let events_per_minute = Self::calculate_events_per_minute()?;

        // Total de eventos nas últimas 24h
        let total_events_24h = SecurityEventService::get_total_events()? as u64;

        // Usuários ativos nos últimos 15min
        let active_users = Self::get_active_users(15)?;

        // IPs suspeitos
        let suspicious_ips = Self::detect_suspicious_ips()?;

        // Alertas críticos
        let critical_alerts = Self::count_critical_alerts()?;

        // Logins falhados na última hora
        let failed_logins_1h = Self::count_failed_logins(60)?;

        Ok(SecurityMetrics {
            events_per_minute,
            total_events_24h,
            active_users,
            suspicious_ips,
            critical_alerts,
            failed_logins_1h,
        })
    }

    /// Atualiza o cache de alertas (Stateful)
    pub fn refresh_alerts() -> Result<()> {
        let mut active_alerts = Vec::new();

        // Alerta 1: IPs suspeitos
        let suspicious_ips = Self::detect_suspicious_ips()?;
        for ip_info in suspicious_ips {
            if ip_info.failed_attempts >= 10 {
                // Geração de ID determinístico para estabilidade
                let alert_id = Uuid::new_v5(
                    &Uuid::NAMESPACE_OID,
                    format!("suspicious_ip:{}", ip_info.ip).as_bytes(),
                )
                .to_string();

                active_alerts.push(SecurityAlert {
                    id: alert_id,
                    created_at: Utc::now().to_rfc3339(), // Em sistema real, preservaria o original se já existisse
                    severity: SeverityLevel::Critical,
                    title: format!("Brute force attack detected from {}", ip_info.ip),
                    description: format!(
                        "{} failed login attempts detected from IP {} in the last 10 minutes. This may indicate a brute force attack.",
                        ip_info.failed_attempts, ip_info.ip
                    ),
                    related_events: vec![],
                    acknowledged: false,
                });
            }
        }

        // Alerta 2: Comandos suspeitos
        let recent_events = SecurityEventService::get_recent_events(60)?;
        for event in recent_events {
            if event.event_type == SecurityEventType::SshCommand {
                let action_lower = event.action.to_lowercase();
                let dangerous_patterns = [
                    "rm -rf /",
                    "chmod 777",
                    "mkfs.",
                    "dd if=",
                    "> /dev/sda",
                    "passwd -d",
                    "userdel",
                    "chown -r",
                ];

                if dangerous_patterns
                    .iter()
                    .any(|pattern| action_lower.contains(pattern))
                {
                    // ID determinístico baseado no evento
                    let alert_id =
                        Uuid::new_v5(&Uuid::NAMESPACE_OID, format!("cmd:{}", event.id).as_bytes())
                            .to_string();

                    active_alerts.push(SecurityAlert {
                        id: alert_id,
                        created_at: event.timestamp.clone(),
                        severity: SeverityLevel::Warning,
                        title: "Sensitive command detected".to_string(),
                        description: format!(
                            "User {} executed a highly sensitive or dangerous command: {}",
                            event.user, event.action
                        ),
                        related_events: vec![event.id],
                        acknowledged: false,
                    });
                }
            }
        }

        // Sincronizar com cache existente (preservar estado 'acknowledged')
        let mut cache = ALERT_CACHE
            .write()
            .map_err(|e| anyhow::anyhow!("Lock fail: {}", e))?;

        for new_alert in active_alerts {
            // Se já existe, atualiza mas mantém status acknowledged
            if let Some(existing) = cache.iter_mut().find(|a| a.id == new_alert.id) {
                // Preserva o status de acknowledged e timestamp de criação original
                // Só atualiza contadores ou descrição se necessário
            } else {
                // Novo alerta
                cache.push(new_alert);
            }
        }

        // Opcional: Remover alertas que não são mais ativos?
        // Por enquanto, mantemos histórico em memória até restart para persistir ACKs visíveis

        Ok(())
    }

    pub fn get_alerts() -> Result<Vec<SecurityAlert>> {
        // Garante refresh antes de ler
        Self::refresh_alerts()?;
        let cache = ALERT_CACHE
            .read()
            .map_err(|e| anyhow::anyhow!("Lock fail: {}", e))?;
        Ok(cache.clone())
    }

    pub fn acknowledge_alert(id: &str) -> Result<bool> {
        let mut cache = ALERT_CACHE
            .write()
            .map_err(|e| anyhow::anyhow!("Lock fail: {}", e))?;
        if let Some(alert) = cache.iter_mut().find(|a| a.id == id) {
            alert.acknowledged = true;
            return Ok(true);
        }
        Ok(false)
    }

    fn calculate_events_per_minute() -> Result<f32> {
        let events = SecurityEventService::get_recent_events(5)?;
        let count = events.len() as f32;
        let rate = count / 5.0;
        Ok(rate)
    }

    fn get_active_users(minutes: u32) -> Result<Vec<String>> {
        let events = SecurityEventService::get_recent_events(minutes)?;
        let mut users = std::collections::HashSet::new();
        for event in events {
            users.insert(event.user);
        }
        let mut user_list: Vec<String> = users.into_iter().collect();
        user_list.sort();
        Ok(user_list)
    }

    pub fn detect_suspicious_ips() -> Result<Vec<SuspiciousIp>> {
        let events = SecurityEventService::get_recent_events(10)?;
        let mut ip_failures: HashMap<String, Vec<String>> = HashMap::new();

        for event in events {
            if event.event_type == SecurityEventType::SshLogin
                && event.severity != SeverityLevel::Info
            {
                if let Some(ip) = event.source_ip {
                    ip_failures.entry(ip).or_default().push(event.timestamp);
                }
            }
        }

        let mut suspicious: Vec<SuspiciousIp> = Vec::new();
        for (ip, timestamps) in ip_failures {
            if timestamps.len() >= 5 {
                let last_attempt = timestamps.last().unwrap().clone();
                suspicious.push(SuspiciousIp {
                    ip: ip.clone(),
                    failed_attempts: timestamps.len() as u32,
                    last_attempt,
                    reason: format!("{} failed login attempts in 10 minutes", timestamps.len()),
                });
            }
        }
        Ok(suspicious)
    }

    fn count_critical_alerts() -> Result<u32> {
        let cache = ALERT_CACHE
            .read()
            .map_err(|e| anyhow::anyhow!("Lock fail: {}", e))?;
        Ok(cache
            .iter()
            .filter(|a| a.severity == SeverityLevel::Critical && !a.acknowledged)
            .count() as u32)
    }

    fn count_failed_logins(minutes: u32) -> Result<u32> {
        let events = SecurityEventService::get_recent_events(minutes)?;
        Ok(events
            .iter()
            .filter(|e| {
                e.event_type == SecurityEventType::SshLogin && e.severity != SeverityLevel::Info
            })
            .count() as u32)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_calculate_metrics() {
        // Adicionar alguns eventos de teste
        for i in 0..10 {
            let event = SecurityEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().to_rfc3339(),
                event_type: SecurityEventType::SshLogin,
                severity: if i % 2 == 0 {
                    SeverityLevel::Info
                } else {
                    SeverityLevel::Warning
                },
                user: format!("user{}", i % 3),
                source_ip: Some(format!("192.168.1.{}", i)),
                action: "login".to_string(),
                resource: None,
                details: json!({}),
            };
            SecurityEventService::add_event(event).unwrap();
        }

        let metrics = SecurityMetricsService::calculate_metrics().unwrap();
        assert!(metrics.events_per_minute >= 0.0);
        assert!(metrics.active_users.len() > 0);
    }

    #[test]
    fn test_detect_suspicious_ips() {
        // Adicionar 6 falhas do mesmo IP
        for _i in 0..6 {
            let event = SecurityEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().to_rfc3339(),
                event_type: SecurityEventType::SshLogin,
                severity: SeverityLevel::Warning,
                user: "attacker".to_string(),
                source_ip: Some("10.0.0.1".to_string()),
                action: "failed login".to_string(),
                resource: None,
                details: json!({}),
            };
            SecurityEventService::add_event(event).unwrap();
        }

        let suspicious = SecurityMetricsService::detect_suspicious_ips().unwrap();
        assert!(suspicious.iter().any(|ip| ip.ip == "10.0.0.1"));
    }
}
