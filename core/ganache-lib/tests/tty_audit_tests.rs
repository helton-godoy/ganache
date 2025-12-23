use ganache_api::models::security::SecurityEventType;
use ganache_lib::SecurityEventService;

#[test]
fn test_decode_tty_hex() {
    let hex = "6C73202D6C610D"; // "ls -la\r"
    let decoded = SecurityEventService::decode_tty_data(hex).unwrap();
    assert_eq!(decoded, "ls -la");
}

#[test]
fn test_parse_tty_log_line() {
    let log_line =
        "type=TTY msg=audit(1734918247.123:456): terminal=pts/1 res=1 data=6C73202D6C610D";
    let event = SecurityEventService::parse_tty_log(log_line, "root").unwrap();

    assert_eq!(event.event_type, SecurityEventType::SshCommand);
    assert_eq!(event.user, "root");
    assert_eq!(event.action, "ls -la");
    assert!(event.details.get("terminal").is_some());
}

#[test]
fn test_parse_tty_log_subshell_script() {
    // Simula log gerado por execução dentro de script (uid=1000)
    let log_line = "type=TTY msg=audit(1734918250.999:789): terminal=pts/2 res=1 uid=1000 data=7375646F207669202F6574632F736861646F77"; // "sudo vi /etc/shadow"

    // O parser deve extrair o UID se passado, mas nossa função atual recebe 'default_user'.
    // Vamos testar se o decode funciona para comandos perigosos.
    let user = "admin"; // Simulado
    let event = SecurityEventService::parse_tty_log(log_line, user).unwrap();

    assert_eq!(event.action, "sudo vi /etc/shadow");
    assert_eq!(event.user, "admin");
}

#[test]
fn test_parse_tty_log_malformed_hex() {
    let log_line = "type=TTY msg=audit(1): terminal=? res=1 data=ZZZZZZ"; // Hex inválido
    let event = SecurityEventService::parse_tty_log(log_line, "root");
    assert!(event.is_none(), "Should fail gracefully on invalid hex");
}
