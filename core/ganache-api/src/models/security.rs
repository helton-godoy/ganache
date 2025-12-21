use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Tipo de evento de segurança
///
/// # Purpose
/// Classifica eventos de segurança capturados pelo sistema
///
/// @ref Story-5.4 - Security event type enumeration
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum SecurityEventType {
    /// Login SSH (sucesso ou falha)
    SshLogin,
    /// Comando executado via SSH
    SshCommand,
    /// Acesso a arquivo compartilhado
    FileAccess,
    /// Mudança de configuração (via Git)
    ConfigChange,
    /// Acesso via conta Break-Glass
    BreakGlassAccess,
    /// Mudança de ACL/permissões
    PermissionChange,
}

/// Nível de severidade do evento
///
/// # Purpose
/// Indica a criticidade de um evento de segurança
///
/// @ref Story-5.4 - Security severity levels
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum SeverityLevel {
    /// Evento informativo normal
    Info,
    /// Evento suspeito que requer atenção
    Warning,
    /// Evento crítico que requer ação imediata
    Critical,
}

/// Evento de segurança individual
///
/// # Purpose
/// Representa um único evento de segurança capturado pelo sistema
///
/// # Fields
/// * `id` - UUID único do evento
/// * `timestamp` - Data/hora do evento em formato ISO 8601
/// * `event_type` - Tipo do evento (SSH, file access, etc.)
/// * `severity` - Nível de criticidade
/// * `user` - Nome do usuário que gerou o evento
/// * `source_ip` - Endereço IP de origem (opcional)
/// * `action` - Descrição da ação realizada
/// * `resource` - Recurso afetado (path, serviço, etc.) (opcional)
/// * `details` - Metadados adicionais em formato JSON
///
/// @ref Story-5.4 - Core security event model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SecurityEvent {
    /// UUID único do evento
    pub id: String,
    /// Timestamp do evento (ISO 8601)
    pub timestamp: String,
    /// Tipo do evento
    pub event_type: SecurityEventType,
    /// Nível de severidade
    pub severity: SeverityLevel,
    /// Usuário que gerou o evento
    pub user: String,
    /// IP de origem (opcional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_ip: Option<String>,
    /// Descrição da ação
    pub action: String,
    /// Recurso afetado (opcional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resource: Option<String>,
    /// Metadados adicionais
    pub details: serde_json::Value,
}

/// IP suspeito com métricas de atividade
///
/// # Purpose
/// Representa um endereço IP identificado como suspeito pelo sistema
///
/// @ref Story-5.4 - Suspicious IP tracking
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SuspiciousIp {
    /// Endereço IP
    pub ip: String,
    /// Número de tentativas falhadas
    pub failed_attempts: u32,
    /// Timestamp da última tentativa (ISO 8601)
    pub last_attempt: String,
    /// Descrição do motivo da suspeita
    pub reason: String,
}

/// Métricas agregadas de segurança
///
/// # Purpose
/// Fornece visão consolidada da atividade de segurança do sistema
///
/// # Fields
/// * `events_per_minute` - Taxa média de eventos por minuto (últimos 5min)
/// * `total_events_24h` - Total de eventos nas últimas 24 horas
/// * `active_users` - Lista de usuários ativos nos últimos 15 minutos
/// * `suspicious_ips` - IPs com atividade suspeita
/// * `critical_alerts` - Número de alertas críticos ativos
/// * `failed_logins_1h` - Logins SSH falhados na última hora
///
/// @ref Story-5.4 - Security metrics aggregation
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SecurityMetrics {
    /// Taxa de eventos por minuto (média móvel 5min)
    pub events_per_minute: f32,
    /// Total de eventos nas últimas 24h
    pub total_events_24h: u64,
    /// Usuários ativos (últimos 15min)
    pub active_users: Vec<String>,
    /// IPs com atividade suspeita
    pub suspicious_ips: Vec<SuspiciousIp>,
    /// Número de alertas críticos
    pub critical_alerts: u32,
    /// Logins falhados na última hora
    pub failed_logins_1h: u32,
}

/// Alerta de segurança ativo
///
/// # Purpose
/// Representa um alerta gerado automaticamente pelo sistema de monitoramento
///
/// # Fields
/// * `id` - UUID único do alerta
/// * `created_at` - Data/hora de criação (ISO 8601)
/// * `severity` - Nível de criticidade
/// * `title` - Título resumido do alerta
/// * `description` - Descrição detalhada do problema
/// * `related_events` - IDs dos eventos que geraram o alerta
/// * `acknowledged` - Se o alerta foi reconhecido por um operador
///
/// @ref Story-5.4 - Security alert model
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct SecurityAlert {
    /// UUID único do alerta
    pub id: String,
    /// Timestamp de criação (ISO 8601)
    pub created_at: String,
    /// Nível de severidade
    pub severity: SeverityLevel,
    /// Título do alerta
    pub title: String,
    /// Descrição detalhada
    pub description: String,
    /// IDs dos eventos relacionados
    pub related_events: Vec<String>,
    /// Se foi reconhecido pelo operador
    pub acknowledged: bool,
}

/// Filtros para consulta de eventos de segurança
///
/// # Purpose
/// Permite filtrar e paginar consultas de eventos
///
/// # Fields
/// * `event_type` - Filtrar por tipo de evento
/// * `user` - Filtrar por nome de usuário
/// * `source_ip` - Filtrar por IP de origem
/// * `severity` - Filtrar por nível de severidade
/// * `date_from` - Data inicial (ISO 8601)
/// * `date_to` - Data final (ISO 8601)
/// * `limit` - Número máximo de resultados (padrão: 100, max: 1000)
/// * `offset` - Paginação: número de registros a pular
///
/// @ref Story-5.4 - Event filtering and pagination
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct EventFilter {
    /// Filtrar por tipo de evento
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_type: Option<SecurityEventType>,
    /// Filtrar por usuário
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>,
    /// Filtrar por IP de origem
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_ip: Option<String>,
    /// Filtrar por severidade
    #[serde(skip_serializing_if = "Option::is_none")]
    pub severity: Option<SeverityLevel>,
    /// Data inicial (ISO 8601)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date_from: Option<String>,
    /// Data final (ISO 8601)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date_to: Option<String>,
    /// Limite de resultados (padrão: 100, max: 1000)
    #[serde(default = "default_limit")]
    pub limit: u32,
    /// Offset para paginação
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u32 {
    100
}

impl Default for EventFilter {
    fn default() -> Self {
        Self {
            event_type: None,
            user: None,
            source_ip: None,
            severity: None,
            date_from: None,
            date_to: None,
            limit: 100,
            offset: 0,
        }
    }
}
