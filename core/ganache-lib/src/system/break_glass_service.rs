use anyhow::Result;
use ganache_api::models::security::{SecurityEvent, SecurityEventType, SeverityLevel};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, RwLock};

/// Estado da conta Break-Glass emergency_admin
///
/// # Purpose
/// Controla o estado de ativação da conta de emergência local
///
/// @ref Story-5.3 - Break-Glass emergency admin state
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum BreakGlassState {
    /// Conta desativada (estado padrão seguro)
    Disabled,
    /// Conta ativada e aguardando primeiro login
    ActivatedPendingPassword,
    /// Conta ativa e senha foi alterada
    Active,
}

/// Informações de ativação Break-Glass
///
/// # Purpose
/// Armazena metadados de quem ativou e quando
///
/// @ref Story-5.3 - Break-Glass activation tracking
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BreakGlassActivation {
    /// Timestamp de ativação (ISO 8601)
    pub activated_at: String,
    /// Usuário que disparou a ativação
    pub activated_by: String,
    /// IP de origem da ativação
    pub activation_source_ip: Option<String>,
    /// Motivo da ativação (fornecido pelo admin)
    pub reason: Option<String>,
}

/// Serviço de gerenciamento da conta Break-Glass
///
/// # Purpose
/// Gerencia o ciclo de vida da conta emergency_admin incluindo:
/// - Ativação/desativação segura
/// - Auditoria completa de atividades
/// - Integração com sistema de notificação
/// - Validação de complexidade de senha
///
/// @ref Story-5.3 - Break-Glass emergency admin service
pub struct BreakGlassService {
    /// Estado atual da conta
    state: Arc<RwLock<BreakGlassState>>,
    /// Informações da ativação atual (se ativada)
    activation_info: Arc<RwLock<Option<BreakGlassActivation>>>,
}

impl BreakGlassService {
    /// Cria nova instância do serviço com conta desativada
    ///
    /// @ref Story-5.3 AC 5.3.1 - Conta desativada por padrão
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(BreakGlassState::Disabled)),
            activation_info: Arc::new(RwLock::new(None)),
        }
    }

    /// Retorna o estado atual da conta
    pub fn get_state(&self) -> Result<BreakGlassState> {
        Ok(self
            .state
            .read()
            .map_err(|e| anyhow::anyhow!("Failed to read state: {}", e))?
            .clone())
    }

    /// Ativa a conta emergency_admin
    ///
    /// # Arguments
    /// * `activated_by` - Nome do usuário que disparou a ativação
    /// * `source_ip` - IP de origem (opcional)
    /// * `reason` - Motivo da ativação (opcional)
    ///
    /// # Returns
    /// SecurityEvent de auditoria da ativação
    ///
    /// @ref Story-5.3 AC 5.3.1 - Ativação segura com auditoria
    pub fn activate(
        &self,
        activated_by: String,
        source_ip: Option<String>,
        reason: Option<String>,
    ) -> Result<SecurityEvent> {
        let mut state = self
            .state
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to write state: {}", e))?;

        if *state != BreakGlassState::Disabled {
            return Err(anyhow::anyhow!(
                "Cannot activate: account is not in Disabled state"
            ));
        }

        *state = BreakGlassState::ActivatedPendingPassword;

        let activation = BreakGlassActivation {
            activated_at: chrono::Utc::now().to_rfc3339(),
            activated_by: activated_by.clone(),
            activation_source_ip: source_ip.clone(),
            reason: reason.clone(),
        };

        *self
            .activation_info
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to write activation info: {}", e))? =
            Some(activation);

        // TODO: Executar comando useradd/passwd para habilitar conta real
        // TODO: Enviar notificações via sistema existente

        // Criar evento de auditoria
        Ok(SecurityEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            event_type: SecurityEventType::BreakGlassAccess,
            severity: SeverityLevel::Critical,
            user: activated_by,
            source_ip,
            action: "Emergency admin account activated".to_string(),
            resource: Some("emergency_admin".to_string()),
            details: serde_json::json!({
                "reason": reason,
                "state_transition": "Disabled -> ActivatedPendingPassword"
            }),
        })
    }

    /// Desativa a conta emergency_admin
    ///
    /// # Arguments
    /// * `deactivated_by` - Nome do usuário que disparou a desativação
    ///
    /// # Returns
    /// SecurityEvent de auditoria da desativação
    ///
    /// @ref Story-5.3 AC 5.3.4 - Desativação automática
    pub fn deactivate(&self, deactivated_by: String) -> Result<SecurityEvent> {
        let mut state = self
            .state
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to write state: {}", e))?;

        if *state == BreakGlassState::Disabled {
            return Err(anyhow::anyhow!(
                "Cannot deactivate: account is already Disabled"
            ));
        }

        let previous_state = state.clone();
        *state = BreakGlassState::Disabled;

        *self
            .activation_info
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to reset activation info: {}", e))? = None;

        // TODO: Executar comando passwd -l para desativar conta real
        // TODO: Enviar notificações de desativação

        // Criar evento de auditoria
        Ok(SecurityEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            event_type: SecurityEventType::BreakGlassAccess,
            severity: SeverityLevel::Warning,
            user: deactivated_by.clone(),
            source_ip: None,
            action: "Emergency admin account deactivated".to_string(),
            resource: Some("emergency_admin".to_string()),
            details: serde_json::json!({
                "deactivated_by": deactivated_by,
                "state_transition": format!("{:?} -> Disabled", previous_state)
            }),
        })
    }

    /// Valida complexidade de senha
    ///
    /// # Arguments
    /// * `password` - Senha a ser validada
    ///
    /// # Returns
    /// Ok(()) se válida, Err com mensagem descritiva se inválida
    ///
    /// @ref Story-5.3 AC 5.3.2 - Complexidade de senha
    pub fn validate_password_complexity(password: &str) -> Result<()> {
        if password.len() < 12 {
            return Err(anyhow::anyhow!(
                "Password must be at least 12 characters long"
            ));
        }

        let has_uppercase = password.chars().any(|c| c.is_uppercase());
        let has_lowercase = password.chars().any(|c| c.is_lowercase());
        let has_digit = password.chars().any(|c| c.is_numeric());
        let has_symbol = password.chars().any(|c| !c.is_alphanumeric());

        if !has_uppercase {
            return Err(anyhow::anyhow!(
                "Password must contain at least one uppercase letter"
            ));
        }

        if !has_lowercase {
            return Err(anyhow::anyhow!(
                "Password must contain at least one lowercase letter"
            ));
        }

        if !has_digit {
            return Err(anyhow::anyhow!("Password must contain at least one digit"));
        }

        if !has_symbol {
            return Err(anyhow::anyhow!(
                "Password must contain at least one special symbol"
            ));
        }

        Ok(())
    }

    /// Marca que a senha foi alterada no primeiro login
    ///
    /// @ref Story-5.3 AC 5.3.2 - Redefinição de senha obrigatória
    pub fn mark_password_changed(&self) -> Result<()> {
        let mut state = self
            .state
            .write()
            .map_err(|e| anyhow::anyhow!("Failed to write state: {}", e))?;

        if *state != BreakGlassState::ActivatedPendingPassword {
            return Err(anyhow::anyhow!(
                "Cannot mark password changed: account is not in ActivatedPendingPassword state"
            ));
        }

        *state = BreakGlassState::Active;
        Ok(())
    }

    /// Retorna informações da ativação atual
    pub fn get_activation_info(&self) -> Result<Option<BreakGlassActivation>> {
        Ok(self
            .activation_info
            .read()
            .map_err(|e| anyhow::anyhow!("Failed to read activation info: {}", e))?
            .clone())
    }
}

impl Default for BreakGlassService {
    fn default() -> Self {
        Self::new()
    }
}
