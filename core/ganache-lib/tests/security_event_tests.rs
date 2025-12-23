use chrono::Utc;
use ganache_api::models::security::{EventFilter, SecurityEvent, SecurityEventType, SeverityLevel};
use ganache_lib::SecurityEventService;
use serde_json::json;
use uuid::Uuid;

#[tokio::test]
async fn test_event_broadcaster() {
    let mut rx = SecurityEventService::subscribe();

    let event = SecurityEvent {
        id: Uuid::new_v4().to_string(),
        timestamp: Utc::now().to_rfc3339(),
        event_type: SecurityEventType::SshLogin,
        severity: SeverityLevel::Info,
        user: "test_broadcaster".to_string(),
        source_ip: None,
        action: "test broadcast".to_string(),
        resource: None,
        details: json!({}),
    };

    SecurityEventService::add_event(event.clone()).unwrap();

    // Loop to ignore events from other tests running in parallel
    loop {
        let received = rx.recv().await.unwrap();
        if received.user == "test_broadcaster" {
            assert_eq!(received.id, event.id);
            break;
        }
    }
}

#[tokio::test]
async fn test_event_persistence_in_cache() {
    let username = format!("user_{}", Uuid::new_v4());
    let event = SecurityEvent {
        id: Uuid::new_v4().to_string(),
        timestamp: Utc::now().to_rfc3339(),
        event_type: SecurityEventType::ConfigChange,
        severity: SeverityLevel::Warning,
        user: username.clone(),
        source_ip: None,
        action: "config update".to_string(),
        resource: Some("cluster.json".to_string()),
        details: json!({}),
    };

    SecurityEventService::add_event(event).unwrap();

    let filter = EventFilter {
        user: Some(username),
        ..Default::default()
    };

    let events = SecurityEventService::get_events(&filter).unwrap();
    assert!(!events.is_empty());
    assert_eq!(events[0].action, "config update");
}
