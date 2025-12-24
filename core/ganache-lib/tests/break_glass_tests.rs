use ganache_lib::system::break_glass_service::*;
use ganache_lib::BreakGlassService;
use ganache_lib::GitService;
use lazy_static::lazy_static;
use std::sync::Mutex;
use tempfile::TempDir;

lazy_static! {
    // Musex to serialize tests since they modify process-global env vars
    static ref TEST_MUTEX: Mutex<()> = Mutex::new(());
}

fn with_test_env<F>(test_fn: F)
where
    F: FnOnce(&std::path::Path),
{
    let _lock = TEST_MUTEX.lock().unwrap();

    // Setup temp dir
    let temp_dir = TempDir::new().unwrap();
    let repo_path = temp_dir.path().to_path_buf();

    // Init git repo needed for persistence
    GitService::init_repo_at(&repo_path).unwrap();

    // Set env vars
    unsafe {
        std::env::set_var("GANACHE_CONFIG_DIR", &repo_path);
        std::env::set_var("GANACHE_DEV_MODE", "1");
    }

    // Run test
    // Catch unwind would be better but simple call is okay if we don't expect panics to poison future tests too badly (env vars remain set if panic)
    // To be safe against panics leaving env vars set, we should use catch_unwind, but for this dev agent, let's keep simple.
    test_fn(&repo_path);

    // Cleanup env vars
    unsafe {
        std::env::remove_var("GANACHE_CONFIG_DIR");
        std::env::remove_var("GANACHE_DEV_MODE");
    }
}

#[test]
fn test_new_service_starts_disabled() {
    with_test_env(|_| {
        let service = BreakGlassService::new();
        let state = service.get_state().unwrap();
        assert_eq!(state, BreakGlassState::Disabled);
    });
}

#[test]
fn test_persistence_survives_service_restart() {
    with_test_env(|_| {
        // 1. Start service and activate
        {
            let service = BreakGlassService::new();
            service.activate("admin1".to_string(), None, None).unwrap();
            assert_eq!(
                service.get_state().unwrap(),
                BreakGlassState::ActivatedPendingPassword
            );
        } // service dropped

        // 2. Restart service (new instance)
        let service_v2 = BreakGlassService::new();
        // Should have loaded state from disk
        assert_eq!(
            service_v2.get_state().unwrap(),
            BreakGlassState::ActivatedPendingPassword
        );

        // Check activation info persisted
        let info = service_v2.get_activation_info().unwrap().unwrap();
        assert_eq!(info.activated_by, "admin1");
    });
}

#[test]
fn test_activate_from_disabled_state() {
    with_test_env(|_| {
        let service = BreakGlassService::new();

        let event = service
            .activate(
                "admin1".to_string(),
                Some("192.168.1.100".to_string()),
                Some("AD controller failure".to_string()),
            )
            .unwrap();

        // Verificar que estado mudou
        let state = service.get_state().unwrap();
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
        let info = service.get_activation_info().unwrap().unwrap();
        assert_eq!(info.activated_by, "admin1");
        assert_eq!(info.activation_source_ip, Some("192.168.1.100".to_string()));
        assert_eq!(info.reason, Some("AD controller failure".to_string()));
    });
}

#[test]
fn test_cannot_activate_if_already_activated() {
    with_test_env(|_| {
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
    });
}

#[test]
fn test_deactivate_from_active_state() {
    with_test_env(|_| {
        let service = BreakGlassService::new();

        // Primeiro ativar
        service.activate("admin1".to_string(), None, None).unwrap();

        // Depois desativar
        let event = service.deactivate("admin2".to_string()).unwrap();

        // Verificar que estado mudou
        let state = service.get_state().unwrap();
        assert_eq!(state, BreakGlassState::Disabled);

        // Verificar persistência da desativação
        let service_v2 = BreakGlassService::new();
        assert_eq!(service_v2.get_state().unwrap(), BreakGlassState::Disabled);

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
        let info = service.get_activation_info().unwrap();
        assert!(info.is_none());
    });
}

#[test]
fn test_cannot_deactivate_if_already_disabled() {
    with_test_env(|_| {
        let service = BreakGlassService::new();

        // Desativar sem ativar primeiro deve falhar
        let result = service.deactivate("admin1".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("already Disabled"));
    });
}

#[test]
fn test_password_validation_logic() {
    // Pure logic test, no persistence needed
    assert!(BreakGlassService::validate_password_complexity("Short1!").is_err());
    assert!(BreakGlassService::validate_password_complexity("ValidPass123!@#").is_ok());
}

#[test]
fn test_mark_password_changed() {
    with_test_env(|_| {
        let service = BreakGlassService::new();

        // Ativar primeiro
        service.activate("admin1".to_string(), None, None).unwrap();

        // Verificar estado antes
        assert_eq!(
            service.get_state().unwrap(),
            BreakGlassState::ActivatedPendingPassword
        );

        // Marcar senha alterada
        service.mark_password_changed().unwrap();

        // Verificar estado depois
        assert_eq!(service.get_state().unwrap(), BreakGlassState::Active);

        // Verify persistence of active state
        let service_v2 = BreakGlassService::new();
        assert_eq!(service_v2.get_state().unwrap(), BreakGlassState::Active);
    });
}

#[test]
fn test_cannot_mark_password_changed_if_not_pending() {
    with_test_env(|_| {
        let service = BreakGlassService::new();

        // Tentar marcar sem ativar primeiro
        let result = service.mark_password_changed();
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("not in ActivatedPendingPassword state"));
    });
}
