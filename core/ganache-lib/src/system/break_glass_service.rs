use crate::ConfigDb;
use anyhow::{Context, Result};
use ganache_api::models::security::{SecurityEvent, SecurityEventType, SeverityLevel};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::{Arc, RwLock};
use tracing::{error, info};

const CONFIG_FILE: &str = "break_glass_config.json";
const EMERGENCY_USER: &str = "emergency_admin";

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

/// Estrutura para persistência do estado
#[derive(Serialize, Deserialize, Clone, Debug)]
struct BreakGlassPersistedState {
    state: BreakGlassState,
    activation_info: Option<BreakGlassActivation>,
}

/// Serviço de gerenciamento da conta Break-Glass
///
/// # Purpose
/// Gerencia o ciclo de vida da conta emergency_admin incluindo:
/// - Ativação/desativação segura
/// - Auditoria completa de atividades
/// - Integração com sistema de notificação
/// - Validação de complexidade de senha
/// - Persistência de estado e ativação real de usuário no OS
///
/// @ref Story-5.3 - Break-Glass emergency admin service
pub struct BreakGlassService {
    /// Estado atual persistido
    data: Arc<RwLock<BreakGlassPersistedState>>,
}

impl BreakGlassService {
    /// Cria nova instância do serviço e carrega estado persistido
    ///
    /// @ref Story-5.3 AC 5.3.1 - Carregamento de estado persistente
    pub fn new() -> Self {
        let default_state = BreakGlassPersistedState {
            state: BreakGlassState::Disabled,
            activation_info: None,
        };

        // Tentar carregar estado do disco
        let loaded_state = match Self::load_state() {
            Ok(Some(s)) => {
                info!("Loaded persisted break-glass state: {:?}", s.state);
                s
            }
            Ok(None) => default_state,
            Err(e) => {
                error!("Failed to load break-glass state: {}", e);
                default_state
            }
        };

        Self {
            data: Arc::new(RwLock::new(loaded_state)),
        }
    }

    /// Carrega o estado do ConfigDb (sistema de arquivos git-backed)
    fn load_state() -> Result<Option<BreakGlassPersistedState>> {
        let root = crate::GitService::get_repo_path();
        let file_path = root.join("db").join(CONFIG_FILE);

        if file_path.exists() {
            let content = std::fs::read_to_string(file_path)?;
            let state = serde_json::from_str(&content)?;
            Ok(Some(state))
        } else {
            Ok(None)
        }
    }

    /// Salva o estado atual no ConfigDb
    fn save_state(&self, user: &str, action: &str) -> Result<()> {
        let data = self.data.read().unwrap().clone();
        ConfigDb::save_and_commit(
            CONFIG_FILE,
            &data,
            user,
            action,
            "break-glass configuration",
        )
    }

    /// Retorna o estado atual da conta
    pub fn get_state(&self) -> Result<BreakGlassState> {
        Ok(self.data.read().unwrap().state.clone())
    }

    /// Executa comando de ativação real no SO
    fn activate_os_user() -> Result<()> {
        if std::env::var("GANACHE_DEV_MODE").is_ok() {
            info!("[DEV] Mocking user activation (usermod -U)");
            return Ok(());
        }

        // Verifica se usuário existe
        let check_user = Command::new("id").arg(EMERGENCY_USER).output()?;

        if !check_user.status.success() {
            // Cria usuário se não existir (sem acesso a shell por enquanto)
            info!("Creating emergency user: {}", EMERGENCY_USER);
            Command::new("useradd")
                .args(["-m", "-s", "/bin/bash", EMERGENCY_USER])
                .output()
                .context("Failed to create emergency user")?;
        }

        // Desbloqueia a conta (remove ! do shadow)
        info!("Unlocking emergency user: {}", EMERGENCY_USER);
        let output = Command::new("usermod")
            .args(["-U", EMERGENCY_USER])
            .output()
            .context("Failed to unlock emergency user")?;

        if !output.status.success() {
            let err = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow::anyhow!("Failed to activate execution: {}", err));
        }

        // Força expiração de senha para exigir troca no login
        // chage -d 0 forces password change on next login
        Command::new("chage")
            .args(["-d", "0", EMERGENCY_USER])
            .output()
            .context("Failed to force password change")?;

        Ok(())
    }

    /// Executa comando de desativação real no SO
    fn deactivate_os_user() -> Result<()> {
        if std::env::var("GANACHE_DEV_MODE").is_ok() {
            info!("[DEV] Mocking user deactivation (usermod -L)");
            return Ok(());
        }

        // Bloqueia a conta (adiciona ! no shadow)
        info!("Locking emergency user: {}", EMERGENCY_USER);
        let output = Command::new("usermod")
            .args(["-L", EMERGENCY_USER])
            .output()
            .context("Failed to lock emergency user")?;

        if !output.status.success() {
            let err = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow::anyhow!("Failed to deactivate execution: {}", err));
        }

        // Mata processos do usuário
        Command::new("pkill")
            .args(["-u", EMERGENCY_USER])
            .output()
            .ok(); // Ignora erro se não houver processos

        Ok(())
    }

    /// Ativa a conta emergency_admin
    ///
    /// @ref Story-5.3 AC 5.3.1 - Ativação segura com persistência e OS hook
    pub fn activate(
        &self,
        activated_by: String,
        source_ip: Option<String>,
        reason: Option<String>,
    ) -> Result<SecurityEvent> {
        // Scope para write lock
        {
            let mut data = self.data.write().unwrap();

            if data.state != BreakGlassState::Disabled {
                return Err(anyhow::anyhow!(
                    "Cannot activate: account is not in Disabled state"
                ));
            }

            // Tenta ativar no OS primeiro
            if let Err(e) = Self::activate_os_user() {
                error!("Failed to activate OS user: {}", e);
                return Err(anyhow::anyhow!("OS activation failed: {}", e));
            }

            data.state = BreakGlassState::ActivatedPendingPassword;
            data.activation_info = Some(BreakGlassActivation {
                activated_at: chrono::Utc::now().to_rfc3339(),
                activated_by: activated_by.clone(),
                activation_source_ip: source_ip.clone(),
                reason: reason.clone(),
            });
        } // Drop lock antes de salvar (save pega read lock -> deadlock potential if inside)

        // Persistir (pega read lock internamente)
        if let Err(e) = self.save_state(&activated_by, "activate") {
            error!("Failed to persist activation state: {}", e);
            // Non-fatal? Talvez fatal para manter consistência
        }

        // Criar evento de auditoria
        Ok(SecurityEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            event_type: SecurityEventType::BreakGlassAccess,
            severity: SeverityLevel::Critical,
            user: activated_by,
            source_ip,
            action: "Emergency admin account activated".to_string(),
            resource: Some(EMERGENCY_USER.to_string()),
            details: serde_json::json!({
                "reason": reason,
                "state_transition": "Disabled -> ActivatedPendingPassword"
            }),
        })
    }

    /// Desativa a conta emergency_admin
    ///
    /// @ref Story-5.3 AC 5.3.4 - Desativação com persistência e OS hook
    pub fn deactivate(&self, deactivated_by: String) -> Result<SecurityEvent> {
        let previous_state;

        {
            let mut data = self.data.write().unwrap();

            if data.state == BreakGlassState::Disabled {
                return Err(anyhow::anyhow!(
                    "Cannot deactivate: account is already Disabled"
                ));
            }

            // Desativa no OS
            if let Err(e) = Self::deactivate_os_user() {
                error!("Failed to deactivate OS user: {}", e);
                // Continue anyway to ensure system state is consistent regarding disabled status?
                // Lets return error to be safe
                return Err(anyhow::anyhow!("OS deactivation failed: {}", e));
            }

            previous_state = data.state.clone();
            data.state = BreakGlassState::Disabled;
            data.activation_info = None;
        }

        if let Err(e) = self.save_state(&deactivated_by, "deactivate") {
            error!("Failed to persist deactivation state: {}", e);
        }

        Ok(SecurityEvent {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            event_type: SecurityEventType::BreakGlassAccess,
            severity: SeverityLevel::Warning,
            user: deactivated_by.clone(),
            source_ip: None,
            action: "Emergency admin account deactivated".to_string(),
            resource: Some(EMERGENCY_USER.to_string()),
            details: serde_json::json!({
                "deactivated_by": deactivated_by,
                "state_transition": format!("{:?} -> Disabled", previous_state)
            }),
        })
    }

    /// Valida complexidade de senha
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
        {
            let mut data = self.data.write().unwrap();

            if data.state != BreakGlassState::ActivatedPendingPassword {
                return Err(anyhow::anyhow!("Cannot mark password changed: account is not in ActivatedPendingPassword state"));
            }

            data.state = BreakGlassState::Active;
        }

        // Persistir a mudança de estado
        self.save_state_system("system-password-change")?;

        Ok(())
    }

    // Helper para salvar como sistema
    fn save_state_system(&self, action: &str) -> Result<()> {
        let data = self.data.read().unwrap().clone();
        ConfigDb::save_and_commit(
            CONFIG_FILE,
            &data,
            "system",
            action,
            "break-glass state update",
        )
    }

    /// Retorna informações da ativação atual
    pub fn get_activation_info(&self) -> Result<Option<BreakGlassActivation>> {
        Ok(self.data.read().unwrap().activation_info.clone())
    }
}

impl Default for BreakGlassService {
    fn default() -> Self {
        Self::new()
    }
}
