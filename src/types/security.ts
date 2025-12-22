export enum SecurityEventType {
    SSH_LOGIN = 'ssh_login',
    FILE_ACCESS = 'file_access',
    CONFIG_CHANGE = 'config_change',
    AUTH_FAILURE = 'auth_failure',
    SUDO_COMMAND = 'sudo_command',
    SYSTEM_ERROR = 'system_error',
}

export enum SecuritySeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical',
}

export interface SecurityEvent {
    id: string;
    timestamp: string; // ISO 8601
    type: SecurityEventType;
    severity: SecuritySeverity;
    message: string;
    source_ip?: string;
    user?: string;
    details?: Record<string, unknown>;
}

export interface SecurityMetrics {
    events_per_minute: number;
    active_users: number;
    suspicious_ips: number;
    critical_events_count: number;
}

export interface SecurityAlert {
    id: string;
    timestamp: string;
    severity: SecuritySeverity;
    message: string;
    acknowledged: boolean;
}

export interface SecurityState {
    events: SecurityEvent[];
    metrics: SecurityMetrics;
    alerts: SecurityAlert[];
    isConnected: boolean;
}
