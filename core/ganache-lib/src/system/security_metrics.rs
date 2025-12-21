use ganache_api::models::security::{SecurityEvent, SecurityEventType, SeverityLevel, SecurityMetrics, SecurityAlert, SuspiciousIp};
use crate::system::security_event_service::SecurityEventService;
use anyhow::Result;
use chrono::Utc;
use std::collections::HashMap;
use uuid::Uuid;

/// Serviço de cálculo de métricas de segurança
///
/// # Purpose
/// Calcula métricas agregadas em tempo real a partir dos eventos de segurança
///
/// @ref Story-5.4 - Security metrics calculation service
pub struct SecurityMetricsService;

impl SecurityMetricsService {
    /// Calcula métricas de segurança em tempo real
    ///
    /// # Returns
    /// Estrutura SecurityMetrics com todas as métricas agregadas
    ///
    /// # Purpose
    /// Fornece visão consolidada da atividade de segurança
    ///
    /// @ref Story-5.4 - Real-time metrics calculation
    pub fn calculate_metrics() -> Result<SecurityMetrics> {
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

    /// Calcula a taxa de eventos por minuto (média móvel de 5min)
    ///
    /// @ref Story-5.4 - Events per minute calculation
    fn calculate_events_per_minute() -> Result<f32> {
        let events = SecurityEventService::get_recent_events(5)?;
        let count = events.len() as f32;
        let rate = count / 5.0; // média sobre 5 minutos
        Ok(rate)
    }

    /// Retorna lista de usuários ativos nos últimos N minutos
    ///
    /// @ref Story-5.4 - Active users tracking
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

    /// Detecta IPs com atividade suspeita
    ///
    /// # Purpose
    /// Identifica IPs com múltiplas tentativas de login falhadas
    ///
    /// # Algorithm
    /// - Threshold: 5 falhas em 10 minutos = IP suspeito
    /// - Rastreia últimas tentativas por IP
    ///
    /// @ref Story-5.4 - Suspicious IP detection
    pub fn detect_suspicious_ips() -> Result<Vec<SuspiciousIp>> {
        let events = SecurityEventService::get_recent_events(10)?;
        
        let mut ip_failures: HashMap<String, Vec<String>> = HashMap::new();

        // Contar falhas por IP
        for event in events {
            if event.event_type == SecurityEventType::SshLogin && 
               event.severity != SeverityLevel::Info {
                if let Some(ip) = event.source_ip {
                    ip_failures.entry(ip).or_insert_with(Vec::new).push(event.timestamp);
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

    /// Gera alertas baseados em anomalias detectadas
    ///
    /// # Purpose
    /// Cria alertas automáticos para eventos críticos
    ///
    /// # Alert Triggers
    /// - Múltiplas falhas de login do mesmo IP
    /// - Comandos sudo suspeitos
    /// - Acessos fora do horário (futuro)
    ///
    /// @ref Story-5.4 - Alert generation
    pub fn generate_alerts() -> Result<Vec<SecurityAlert>> {
        let mut alerts = Vec::new();

        // Alerta 1: IPs suspeitos
        let suspicious_ips = Self::detect_suspicious_ips()?;
        for ip_info in suspicious_ips {
            if ip_info.failed_attempts >= 10 {
                alerts.push(SecurityAlert {
                    id: Uuid::new_v4().to_string(),
                    created_at: Utc::now().to_rfc3339(),
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
                if action_lower.contains("rm -rf") || 
                   action_lower.contains("chmod 777") ||
                   action_lower.contains("mkfs") {
                    alerts.push(SecurityAlert {
                        id: Uuid::new_v4().to_string(),
                        created_at: Utc::now().to_rfc3339(),
                        severity: SeverityLevel::Warning,
                        title: "Suspicious command executed".to_string(),
                        description: format!(
                            "User {} executed potentially dangerous command: {}",
                            event.user, event.action
                        ),
                        related_events: vec![event.id],
                        acknowledged: false,
                    });
                }
            }
        }

        Ok(alerts)
    }

    /// Conta alertas críticos ativos
    ///
    /// @ref Story-5.4 - Critical alert counting
    fn count_critical_alerts() -> Result<u32> {
        let alerts = Self::generate_alerts()?;
        let critical_count = alerts.iter()
            .filter(|a| a.severity == SeverityLevel::Critical && !a.acknowledged)
            .count() as u32;
        Ok(critical_count)
    }

    /// Conta logins SSH falhados nos últimos N minutos
    ///
    /// @ref Story-5.4 - Failed login tracking
    fn count_failed_logins(minutes: u32) -> Result<u32> {
        let events = SecurityEventService::get_recent_events(minutes)?;
        
        let failed_count = events.iter()
            .filter(|e| {
                e.event_type == SecurityEventType::SshLogin && 
                e.severity != SeverityLevel::Info
            })
            .count() as u32;

        Ok(failed_count)
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
                severity: if i % 2 == 0 { SeverityLevel::Info } else { SeverityLevel::Warning },
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
