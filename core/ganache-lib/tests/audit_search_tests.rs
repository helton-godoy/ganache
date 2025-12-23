use ganache_api::models::security::{EventFilter, SecurityEvent, SecurityEventType, SeverityLevel};
use ganache_lib::SecurityEventService;
use uuid::Uuid;

/// @ref Story-5.2 - Test audit log search by filename
#[test]
fn test_search_by_filename() {
    SecurityEventService::init().unwrap();

    // Clear cache to ensure test isolation
    // Note: In production code, we'd use a proper test fixture
    // For now, we accept that tests may see events from other tests

    let test_id_prefix = uuid::Uuid::new_v4().to_string();

    // Create test events with different file accesses
    let event1 = SecurityEvent {
        id: format!("{}-1", test_id_prefix),
        timestamp: chrono::Utc::now().to_rfc3339(),
        event_type: SecurityEventType::FileAccess,
        severity: SeverityLevel::Info,
        user: "alice".to_string(),
        source_ip: Some("192.168.1.10".to_string()),
        action: "Read".to_string(),
        resource: Some("/shares/sensitive/patient_records.xls".to_string()),
        details: serde_json::json!({"operation": "open", "test_id": test_id_prefix}),
    };

    let event2 = SecurityEvent {
        id: format!("{}-2", test_id_prefix),
        timestamp: chrono::Utc::now().to_rfc3339(),
        event_type: SecurityEventType::FileAccess,
        severity: SeverityLevel::Info,
        user: "bob".to_string(),
        source_ip: Some("192.168.1.20".to_string()),
        action: "Write".to_string(),
        resource: Some("/shares/sensitive/patient_records.xls".to_string()),
        details: serde_json::json!({"operation": "modify", "test_id": test_id_prefix}),
    };

    let event3 = SecurityEvent {
        id: format!("{}-3", test_id_prefix),
        timestamp: chrono::Utc::now().to_rfc3339(),
        event_type: SecurityEventType::FileAccess,
        severity: SeverityLevel::Info,
        user: "charlie".to_string(),
        source_ip: Some("192.168.1.30".to_string()),
        action: "Read".to_string(),
        resource: Some("/shares/public/readme.txt".to_string()),
        details: serde_json::json!({"operation": "open", "test_id": test_id_prefix}),
    };

    SecurityEventService::add_event(event1).unwrap();
    SecurityEventService::add_event(event2).unwrap();
    SecurityEventService::add_event(event3).unwrap();

    // Search for specific filename
    let filter = EventFilter {
        resource: Some("patient_records.xls".to_string()),
        ..Default::default()
    };

    let results = SecurityEventService::get_events(&filter).unwrap();

    // Should return at least our 2 events for patient_records.xls
    // (may have more from other tests due to shared cache)
    let our_results: Vec<_> = results
        .iter()
        .filter(|e| e.details.get("test_id").and_then(|v| v.as_str()) == Some(&test_id_prefix))
        .collect();

    assert_eq!(our_results.len(), 2);
    assert!(our_results.iter().all(|e| e
        .resource
        .as_ref()
        .unwrap()
        .contains("patient_records.xls")));

    // Verify both users are in results
    let users: Vec<&str> = our_results.iter().map(|e| e.user.as_str()).collect();
    assert!(users.contains(&"alice"));
    assert!(users.contains(&"bob"));
}

/// @ref Story-5.2 - Test search combining filename and user filters
#[test]
fn test_search_by_filename_and_user() {
    SecurityEventService::init().unwrap();

    let test_id_prefix = uuid::Uuid::new_v4().to_string();

    let event1 = SecurityEvent {
        id: format!("{}-1", test_id_prefix),
        timestamp: chrono::Utc::now().to_rfc3339(),
        event_type: SecurityEventType::FileAccess,
        severity: SeverityLevel::Info,
        user: "alice".to_string(),
        source_ip: Some("192.168.1.10".to_string()),
        action: "Delete".to_string(),
        resource: Some("/shares/sensitive/patient_records.xls".to_string()),
        details: serde_json::json!({"operation": "delete", "test_id": test_id_prefix}),
    };

    let event2 = SecurityEvent {
        id: format!("{}-2", test_id_prefix),
        timestamp: chrono::Utc::now().to_rfc3339(),
        event_type: SecurityEventType::FileAccess,
        severity: SeverityLevel::Info,
        user: "bob".to_string(),
        source_ip: Some("192.168.1.20".to_string()),
        action: "Write".to_string(),
        resource: Some("/shares/sensitive/patient_records.xls".to_string()),
        details: serde_json::json!({"operation": "modify", "test_id": test_id_prefix}),
    };

    SecurityEventService::add_event(event1).unwrap();
    SecurityEventService::add_event(event2).unwrap();

    // Search for specific filename AND user
    let filter = EventFilter {
        resource: Some("patient_records.xls".to_string()),
        user: Some("alice".to_string()),
        ..Default::default()
    };

    let results = SecurityEventService::get_events(&filter).unwrap();

    // Filter to only our test events
    let our_results: Vec<_> = results
        .iter()
        .filter(|e| e.details.get("test_id").and_then(|v| v.as_str()) == Some(&test_id_prefix))
        .collect();

    // Should return only Alice's event
    assert_eq!(our_results.len(), 1);
    assert_eq!(our_results[0].user, "alice");
    assert_eq!(our_results[0].action, "Delete");
}

/// @ref Story-5.2 - Test search returns all event types for a file
#[test]
fn test_search_returns_all_operations() {
    SecurityEventService::init().unwrap();

    let operations = vec!["Open", "Read", "Write", "Delete"];

    for op in &operations {
        let event = SecurityEvent {
            id: Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            event_type: SecurityEventType::FileAccess,
            severity: SeverityLevel::Info,
            user: "testuser".to_string(),
            source_ip: Some("192.168.1.100".to_string()),
            action: op.to_string(),
            resource: Some("/shares/test/document.pdf".to_string()),
            details: serde_json::json!({"operation": op.to_lowercase()}),
        };
        SecurityEventService::add_event(event).unwrap();
    }

    let filter = EventFilter {
        resource: Some("document.pdf".to_string()),
        ..Default::default()
    };

    let results = SecurityEventService::get_events(&filter).unwrap();

    // Should return all 4 operations
    assert_eq!(results.len(), 4);

    let actions: Vec<&str> = results.iter().map(|e| e.action.as_str()).collect();
    for op in &operations {
        assert!(actions.contains(&op.as_ref()));
    }
}
