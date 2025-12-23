use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Requisição de ativação da conta Break-Glass
///
/// # Purpose
/// Payload para ativar a conta emergency_admin em caso de falha do AD
///
/// @ref Story-5.3 AC 5.3.1 - Break-Glass activation request
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BreakGlassActivateRequest {
    /// Nome do usuário que está disparando a ativação
    pub activated_by: String,
    /// Motivo da ativação (obrigatório para auditoria)
    pub reason: String,
    /// IP de origem da requisição (opcional, pode ser inferido do request)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_ip: Option<String>,
}

/// Resposta de ativação da conta Break-Glass
///
/// # Purpose
/// Retorna status da ativação e ID do evento de auditoria gerado
///
/// @ref Story-5.3 AC 5.3.1 - Break-Glass activation response
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BreakGlassActivateResponse {
    /// Indica se a ativação foi bem-sucedida
    pub success: bool,
    /// Mensagem descritiva
    pub message: String,
    /// ID do evento de auditoria gerado
    #[serde(skip_serializing_if = "Option::is_none")]
    pub audit_event_id: Option<String>,
}

/// Requisição de desativação da conta Break-Glass
///
/// # Purpose
/// Payload para desativar a conta emergency_admin após restauração do AD
///
/// @ref Story-5.3 AC 5.3.4 - Break-Glass deactivation request
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BreakGlassDeactivateRequest {
    /// Nome do usuário que está disparando a desativação
    pub deactivated_by: String,
}

/// Resposta de desativação da conta Break-Glass
///
/// # Purpose
/// Retorna status da desativação e ID do evento de auditoria gerado
///
/// @ref Story-5.3 AC 5.3.4 - Break-Glass deactivation response
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BreakGlassDeactivateResponse {
    /// Indica se a desativação foi bem-sucedida
    pub success: bool,
    /// Mensagem descritiva
    pub message: String,
    /// ID do evento de auditoria gerado
    #[serde(skip_serializing_if = "Option::is_none")]
    pub audit_event_id: Option<String>,
}

/// Status atual da conta Break-Glass
///
/// # Purpose
/// Resposta para consulta de status da conta emergency_admin
///
/// @ref Story-5.3 - Break-Glass status query
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BreakGlassStatusResponse {
    /// Estado atual da conta (disabled, activated_pending_password, active)
    pub state: String,
    /// Informações de ativação se a conta estiver ativa
    #[serde(skip_serializing_if = "Option::is_none")]
    pub activation_info: Option<BreakGlassActivationInfo>,
}

/// Informações sobre ativação atual da conta Break-Glass
///
/// @ref Story-5.3 - Break-Glass activation information
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct BreakGlassActivationInfo {
    /// Timestamp de ativação (ISO 8601)
    pub activated_at: String,
    /// Usuário que ativou
    pub activated_by: String,
    /// IP de origem da ativação (se disponível)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub activation_source_ip: Option<String>,
    /// Motivo da ativação (se fornecido)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

/// Requisição de validação de senha
///
/// # Purpose
/// Valida se uma senha atende aos requisitos de complexidade
///
/// @ref Story-5.3 AC 5.3.2 - Password validation
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct PasswordValidationRequest {
    /// Senha a ser validada
    pub password: String,
}

/// Resposta de validação de senha
///
/// @ref Story-5.3 AC 5.3.2 - Password validation response
#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct PasswordValidationResponse {
    /// Indica se a senha é válida
    pub valid: bool,
    /// Mensagem de erro se inválida
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
}
