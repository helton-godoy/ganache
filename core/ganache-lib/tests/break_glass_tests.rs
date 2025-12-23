use anyhow::Result;
use ganache_lib::system::break_glass_service::*;
use ganache_lib::BreakGlassService;

#[test]
fn test_new_service_starts_disabled() {
    let service = BreakGlassService::new();
    let state = service.get_state().unwrap();
    assert_eq!(state, BreakGlassState::Disabled);
}

#[test]
fn test_activate_from_disabled_state() -> Result<()> {
    let service = BreakGlassService::new();

    let event = service.activate(
        "admin1".to_string(),
        Some("192.168.1.100".to_string()),
        Some("AD controller failure".to_string()),
    )?;

    // Verificar que estado mudou
    let state = service.get_state()?;
    assert_eq!(state, BreakGlassState::ActivatedPendingPassword);

    // Verificar que evento de auditoria foi criado
    assert_eq!(
        event.event_type,
        ganache_api::models::security::SecurityEventType::BreakGlassAccess
    );
    assert_eq!(
        event.severity,
        ganache_api::models::security::SeverityLevel::Critical
    );
    assert_eq!(event.user, "admin1");
    assert_eq!(event.source_ip, Some("192.168.1.100".to_string()));
    assert_eq!(event.action, "Emergency admin account activated");

    // Verificar activation_info
    let info = service.get_activation_info()?.unwrap();
    assert_eq!(info.activated_by, "admin1");
    assert_eq!(info.activation_source_ip, Some("192.168.1.100".to_string()));
    assert_eq!(info.reason, Some("AD controller failure".to_string()));

    Ok(())
}

#[test]
fn test_cannot_activate_if_already_activated() {
    let service = BreakGlassService::new();

    // Primeira ativação deve funcionar
    service
        .activate("admin1".to_string(), None, None)
        .expect("First activation should succeed");

    // Segunda ativação deve falhar
    let result = service.activate("admin2".to_string(), None, None);
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("not in Disabled state"));
}

#[test]
fn test_deactivate_from_active_state() -> Result<()> {
    let service = BreakGlassService::new();

    // Primeiro ativar
    service.activate("admin1".to_string(), None, None)?;

    // Depois desativar
    let event = service.deactivate("admin2".to_string())?;

    // Verificar que estado mudou
    let state = service.get_state()?;
    assert_eq!(state, BreakGlassState::Disabled);

    // Verificar evento de auditoria
    assert_eq!(
        event.event_type,
        ganache_api::models::security::SecurityEventType::BreakGlassAccess
    );
    assert_eq!(
        event.severity,
        ganache_api::models::security::SeverityLevel::Warning
    );
    assert_eq!(event.user, "admin2");
    assert_eq!(event.action, "Emergency admin account deactivated");

    // Verificar que activation_info foi limpa
    let info = service.get_activation_info()?;
    assert!(info.is_none());

    Ok(())
}

#[test]
fn test_cannot_deactivate_if_already_disabled() {
    let service = BreakGlassService::new();

    // Desativar sem ativar primeiro deve falhar
    let result = service.deactivate("admin1".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("already Disabled"));
}

#[test]
fn test_password_validation_length() {
    // Senha muito curta
    let result = BreakGlassService::validate_password_complexity("Short1!");
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("at least 12 characters"));

    // Senha com tamanho correto deve passar essa validação
    let result = BreakGlassService::validate_password_complexity("LongPassword1!");
    assert!(result.is_ok());
}

#[test]
fn test_password_validation_uppercase() {
    let result = BreakGlassService::validate_password_complexity("lowercase123!@#");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("uppercase letter"));
}

#[test]
fn test_password_validation_lowercase() {
    let result = BreakGlassService::validate_password_complexity("UPPERCASE123!@#");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("lowercase letter"));
}

#[test]
fn test_password_validation_digit() {
    let result = BreakGlassService::validate_password_complexity("NoDigitsHere!@#");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("digit"));
}

#[test]
fn test_password_validation_symbol() {
    let result = BreakGlassService::validate_password_complexity("NoSymbols1234ABC");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("special symbol"));
}

#[test]
fn test_password_validation_all_requirements() {
    // Senha válida com todos os requisitos
    let result = BreakGlassService::validate_password_complexity("ValidPass123!@#");
    assert!(result.is_ok());

    // Outro exemplo válido
    let result = BreakGlassService::validate_password_complexity("Str0ng!P@ssw0rd");
    assert!(result.is_ok());
}

#[test]
fn test_mark_password_changed() -> Result<()> {
    let service = BreakGlassService::new();

    // Ativar primeiro
    service.activate("admin1".to_string(), None, None)?;

    // Verificar estado antes
    assert_eq!(
        service.get_state()?,
        BreakGlassState::ActivatedPendingPassword
    );

    // Marcar senha alterada
    service.mark_password_changed()?;

    // Verificar estado depois
    assert_eq!(service.get_state()?, BreakGlassState::Active);

    Ok(())
}

#[test]
fn test_cannot_mark_password_changed_if_not_pending() {
    let service = BreakGlassService::new();

    // Tentar marcar sem ativar primeiro
    let result = service.mark_password_changed();
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("not in ActivatedPendingPassword state"));
}
