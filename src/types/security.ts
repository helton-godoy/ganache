export enum SecurityEventType {
  SSH_LOGIN = "ssh_login",
  FILE_ACCESS = "file_access",
  CONFIG_CHANGE = "config_change",
  AUTH_FAILURE = "auth_failure",
  SUDO_COMMAND = "sudo_command",
  SYSTEM_ERROR = "system_error",
}

export enum SecuritySeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
}

export interface SecurityEvent {
  id: string;
  timestamp: string; // ISO 8601
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  user: string;
  source_ip?: string;
  action: string;
  resource?: string;
  details?: Record<string, unknown>;
}

export interface SecurityMetrics {
  events_per_minute: number;
  total_events_24h: number;
  active_users: string[];
  suspicious_ips: Array<{
    ip: string;
    failed_attempts: number;
    last_attempt: string;
    reason: string;
  }>;
  critical_alerts: number;
  failed_logins_1h: number;
}

export interface SecurityAlert {
  id: string;
  created_at: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  related_events: string[];
  acknowledged: boolean;
}

export interface SecurityState {
  events: SecurityEvent[];
  metrics: SecurityMetrics;
  alerts: SecurityAlert[];
  isConnected: boolean;
}
