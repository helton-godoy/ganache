use ganache_lib::system::security_event_service::SecurityEventService;

#[test]
fn test_decode_tty_data_invalid_hex() {
    // Hex inválido deve retornar erro descritivo
    let result = SecurityEventService::decode_tty_data("ZZZZ");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("Invalid hex"));
}

#[test]
fn test_decode_tty_data_non_utf8() {
    // Bytes não-UTF8 devem usar lossy conversion
    let result = SecurityEventService::decode_tty_data("FF FE");
    assert!(result.is_ok());
}

#[test]
fn test_decode_tty_data_empty() {
    let result = SecurityEventService::decode_tty_data("");
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("Empty hex"));
}

#[test]
fn test_decode_tty_data_valid() {
    // "Hello" em hex
    let result = SecurityEventService::decode_tty_data("48656C6C6F");
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), "Hello");
}

#[test]
fn test_parse_tty_log_malformed_timestamp() {
    let line = "type=TTY msg=audit(INVALID:123) terminal=pts/1 data=48656C6C6F";
    let result = SecurityEventService::parse_tty_log(line, "testuser");
    assert!(result.is_some()); // Deve usar fallback timestamp
    let event = result.unwrap();
    assert_eq!(event.user, "testuser");
    assert_eq!(event.action, "Hello");
}

#[test]
fn test_parse_tty_log_missing_data_field() {
    let line = "type=TTY msg=audit(1734918247.123:456) terminal=pts/1";
    let result = SecurityEventService::parse_tty_log(line, "testuser");
    assert!(result.is_none());
}

#[test]
fn test_parse_tty_log_empty_command() {
    let line = "type=TTY msg=audit(1734918247.123:456) terminal=pts/1 data=";
    let result = SecurityEventService::parse_tty_log(line, "testuser");
    assert!(result.is_none());
}

#[test]
fn test_parse_samba_log_with_pipes_in_path() {
    let line = "smbd_audit: User alice|192.168.1.10|open|ok|/path/with|pipe.txt";
    let result = SecurityEventService::parse_samba_audit_log(line);
    assert!(result.is_some());
    let event = result.unwrap();
    assert_eq!(event.resource, Some("/path/with|pipe.txt".to_string()));
    assert_eq!(event.user, "alice");
}

#[test]
fn test_parse_samba_log_insufficient_parts() {
    let line = "smbd_audit: User alice|192.168.1.10";
    let result = SecurityEventService::parse_samba_audit_log(line);
    assert!(result.is_none());
}

#[test]
fn test_parse_samba_log_empty_fields() {
    let line = "smbd_audit: ||open|ok|/path/file.txt";
    let result = SecurityEventService::parse_samba_audit_log(line);
    assert!(result.is_none());
}

#[test]
fn test_parse_samba_log_valid() {
    let line = "smbd_audit: User bob|10.0.0.5|write|ok|/shares/data.csv";
    let result = SecurityEventService::parse_samba_audit_log(line);
    assert!(result.is_some());
    let event = result.unwrap();
    assert_eq!(event.user, "bob");
    assert_eq!(event.source_ip, Some("10.0.0.5".to_string()));
    assert_eq!(event.action, "Write File");
}
