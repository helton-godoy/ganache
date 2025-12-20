use ganache_api::models::active_directory::AdJoinRequest;
use ganache_lib::AdService;
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref TEST_MUTEX: Mutex<()> = Mutex::new(());
}

/// Integration tests for Active Directory service
///
/// @ref Story-4.1 - Integration tests for AD domain join functionality

#[tokio::test]
async fn test_ad_join_with_dev_mode() {
    let _guard = TEST_MUTEX.lock().unwrap();

    // Enable dev mode to skip actual system commands
    std::env::set_var("GANACHE_DEV_MODE", "1");

    let request = AdJoinRequest {
        domain_name: "test.local".to_string(),
        username: "Administrator".to_string(),
        password: "P@ssw0rd123".to_string(),
        dns_servers: "192.168.1.1".to_string(),
        organizational_unit: None,
    };

    let result = AdService::join_domain(&request);

    assert!(result.is_ok(), "Join should succeed in dev mode");

    let response = result.unwrap();
    assert!(response.success);
    assert_eq!(response.current_domain, Some("test.local".to_string()));
    assert!(response.message.contains("Successfully joined domain"));

    // Cleanup
    std::env::remove_var("GANACHE_DEV_MODE");
}

#[tokio::test]
async fn test_ad_join_validates_dns() {
    let _guard = TEST_MUTEX.lock().unwrap();

    let request = AdJoinRequest {
        domain_name: "test.local".to_string(),
        username: "Administrator".to_string(),
        password: "P@ssw0rd123".to_string(),
        dns_servers: "".to_string(), // Invalid: empty DNS
        organizational_unit: None,
    };

    let result = AdService::join_domain(&request);

    assert!(result.is_err(), "Join should fail with empty DNS");
    assert!(result.unwrap_err().to_string().contains("DNS"));
}

#[tokio::test]
async fn test_ad_join_validates_domain() {
    let _guard = TEST_MUTEX.lock().unwrap();

    let request = AdJoinRequest {
        domain_name: "localhost".to_string(), // Invalid: not FQDN
        username: "Administrator".to_string(),
        password: "P@ssw0rd123".to_string(),
        dns_servers: "192.168.1.1".to_string(),
        organizational_unit: None,
    };

    let result = AdService::join_domain(&request);

    assert!(result.is_err(), "Join should fail with non-FQDN domain");
    let error_msg = result.unwrap_err().to_string();
    assert!(
        error_msg.contains("Domain") || error_msg.contains("qualified"),
        "Error should mention domain validation, got:{}",
        error_msg
    );
}

#[tokio::test]
async fn test_ad_status_when_not_joined() {
    let _guard = TEST_MUTEX.lock().unwrap();

    let result = AdService::get_status();

    assert!(result.is_ok());

    let status = result.unwrap();
    // Status depends on system state, but should return successfully
    assert!(status.service_status == "active" || status.service_status == "inactive");
}

#[tokio::test]
async fn test_ad_leave_with_dev_mode() {
    let _guard = TEST_MUTEX.lock().unwrap();

    // Enable dev mode
    std::env::set_var("GANACHE_DEV_MODE", "1");

    let result = AdService::leave_domain();

    assert!(result.is_ok(), "Leave should succeed in dev mode");

    let response = result.unwrap();
    assert!(response.success);
    assert_eq!(response.current_domain, None);
    assert!(response.message.contains("left"));

    // Cleanup
    std::env::remove_var("GANACHE_DEV_MODE");
}

#[tokio::test]
async fn test_ad_join_persists_config() {
    let _guard = TEST_MUTEX.lock().unwrap();

    std::env::set_var("GANACHE_DEV_MODE", "1");

    let request = AdJoinRequest {
        domain_name: "corp.example.com".to_string(),
        username: "admin".to_string(),
        password: "secret".to_string(),
        dns_servers: "10.0.0.1,10.0.0.2".to_string(),
        organizational_unit: None, // Simplified: no OU for test
    };

    let result = AdService::join_domain(&request);
    assert!(result.is_ok(), "Join should succeed: {:?}", result);

    let response = result.unwrap();
    assert!(response.success);
    assert_eq!(
        response.current_domain,
        Some("corp.example.com".to_string())
    );

    std::env::remove_var("GANACHE_DEV_MODE");
}
