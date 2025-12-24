// Story 5.3: Break-Glass Emergency Admin Endpoints

use axum::{extract::Json, http::StatusCode};
use ganache_api::models::break_glass::{
    BreakGlassActivateRequest, BreakGlassActivateResponse, BreakGlassActivationInfo,
    BreakGlassDeactivateRequest, BreakGlassDeactivateResponse, BreakGlassStatusResponse,
    PasswordValidationRequest, PasswordValidationResponse,
};
use ganache_lib::{BreakGlassService, SecurityEventService};
use std::sync::{Arc, Mutex};
use tracing::{info, warn};

use crate::auth::AuthenticatedUser;

// Instância global do serviço Break-Glass
lazy_static::lazy_static! {
    static ref BREAK_GLASS_SERVICE: Arc<Mutex<BreakGlassService>> =
        Arc::new(Mutex::new(BreakGlassService::new()));
}

/// Ativa a conta emergency_admin
///
/// # Purpose
/// Endpoint para ativar conta de emergência quando AD está inacessível
///
/// @ref Story-5.3 AC 5.3.1 - Break-Glass activation endpoint
#[utoipa::path(
    post,
    path = "/api/v1/security/break-glass/activate",
    request_body = BreakGlassActivateRequest,
    responses(
        (status = 200, description = "Conta ativada com sucesso", body = BreakGlassActivateResponse),
        (status = 400, description = "Conta já está ativada ou parâmetros inválidos"),
        (status = 500, description = "Erro interno ao ativar conta")
    )
)]
pub async fn activate_break_glass(
    _user: AuthenticatedUser,
    Json(payload): Json<BreakGlassActivateRequest>,
) -> Result<Json<BreakGlassActivateResponse>, (StatusCode, String)> {
    let service = BREAK_GLASS_SERVICE
        .lock()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    match service.activate(
        payload.activated_by.clone(),
        payload.source_ip.clone(),
        Some(payload.reason.clone()),
    ) {
        Ok(event) => {
            // Persist audit event
            if let Err(e) = SecurityEventService::add_event(event.clone()) {
                warn!(
                    "Failed to persist break-glass activation audit event: {}",
                    e
                );
            } else {
                info!("Break-glass activation audit event persisted: {}", event.id);
            }

            // TODO: Real notification implementation (SMS/Email)
            // For now, we log a CRITICAL warning which should be picked up by log monitoring
            warn!(
                "CRITICAL: Break-Glass account activated by {}! Reason: {}",
                payload.activated_by, payload.reason
            );

            Ok(Json(BreakGlassActivateResponse {
                success: true,
                message: "Emergency admin account activated successfully".to_string(),
                audit_event_id: Some(event.id),
            }))
        }
        Err(e) => Err((StatusCode::BAD_REQUEST, e.to_string())),
    }
}

/// Desativa a conta emergency_admin
///
/// # Purpose
/// Endpoint para desativar conta de emergência quando AD estiver restaurado
///
/// @ref Story-5.3 AC 5.3.4 - Break-Glass deactivation endpoint
#[utoipa::path(
    post,
    path = "/api/v1/security/break-glass/deactivate",
    request_body = BreakGlassDeactivateRequest,
    responses(
        (status = 200, description = "Conta desativada com sucesso", body = BreakGlassDeactivateResponse),
        (status = 400, description = "Conta já está desativada"),
        (status = 500, description = "Erro interno ao desativar conta")
    )
)]
pub async fn deactivate_break_glass(
    _user: AuthenticatedUser,
    Json(payload): Json<BreakGlassDeactivateRequest>,
) -> Result<Json<BreakGlassDeactivateResponse>, (StatusCode, String)> {
    let service = BREAK_GLASS_SERVICE
        .lock()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    match service.deactivate(payload.deactivated_by.clone()) {
        Ok(event) => {
            // Persist audit event
            if let Err(e) = SecurityEventService::add_event(event.clone()) {
                warn!(
                    "Failed to persist break-glass deactivation audit event: {}",
                    e
                );
            } else {
                info!(
                    "Break-glass deactivation audit event persisted: {}",
                    event.id
                );
            }

            // TODO: Real notification implementation
            info!(
                "Break-Glass account deactivated by {}",
                payload.deactivated_by
            );

            Ok(Json(BreakGlassDeactivateResponse {
                success: true,
                message: "Emergency admin account deactivated successfully".to_string(),
                audit_event_id: Some(event.id),
            }))
        }
        Err(e) => Err((StatusCode::BAD_REQUEST, e.to_string())),
    }
}

/// Consulta o status da conta emergency_admin
///
/// # Purpose
/// Retorna estado atual e informações de ativação (se houver)
///
/// @ref Story-5.3 - Break-Glass status query endpoint
#[utoipa::path(
    get,
    path = "/api/v1/security/break-glass/status",
    responses(
        (status = 200, description = "Status da conta Break-Glass", body = BreakGlassStatusResponse),
        (status = 500, description = "Erro ao consultar status")
    )
)]
pub async fn get_break_glass_status(
    _user: AuthenticatedUser,
) -> Result<Json<BreakGlassStatusResponse>, (StatusCode, String)> {
    let service = BREAK_GLASS_SERVICE
        .lock()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let state = service
        .get_state()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let activation_info = service
        .get_activation_info()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .map(|info| BreakGlassActivationInfo {
            activated_at: info.activated_at,
            activated_by: info.activated_by,
            activation_source_ip: info.activation_source_ip,
            reason: info.reason,
        });

    Ok(Json(BreakGlassStatusResponse {
        state: format!("{:?}", state).to_lowercase(),
        activation_info,
    }))
}

/// Valida complexidade de senha
///
/// # Purpose
/// Endpoint para validar se senha atende requisitos antes de salvar
///
/// @ref Story-5.3 AC 5.3.2 - Password validation endpoint
#[utoipa::path(
    post,
    path = "/api/v1/security/break-glass/validate-password",
    request_body = PasswordValidationRequest,
    responses(
        (status = 200, description = "Resultado da validação", body = PasswordValidationResponse)
    )
)]
pub async fn validate_password(
    _user: AuthenticatedUser,
    Json(payload): Json<PasswordValidationRequest>,
) -> Result<Json<PasswordValidationResponse>, (StatusCode, String)> {
    match BreakGlassService::validate_password_complexity(&payload.password) {
        Ok(_) => Ok(Json(PasswordValidationResponse {
            valid: true,
            error_message: None,
        })),
        Err(e) => Ok(Json(PasswordValidationResponse {
            valid: false,
            error_message: Some(e.to_string()),
        })),
    }
}
