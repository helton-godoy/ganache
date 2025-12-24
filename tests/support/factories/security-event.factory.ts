/**
 * Security Event Factory
 * 
 * Generates test security event data matching Rust backend models.
 * Used for validating event logging and audit trail functionality.
 * 
 * @ref Story-5.3 - Break-Glass Emergency Admin
 * @ref Story-5.1 - Deep SSH Audit Logging
 * @ref Story-5.2 - Visual Audit Manager
 */

import { faker } from '@faker-js/faker';

/**
 * Security event types (matching Rust enum SecurityEventType)
 */
export type SecurityEventType =
    | 'BreakGlassAccess'
    | 'BreakGlassActivation'
    | 'BreakGlassDeactivation'
    | 'SshCommand'
    | 'ConfigChange'
    | 'LoginAttempt'
    | 'PermissionChange';

/**
 * Security event severity levels
 */
export type SecuritySeverity = 'Critical' | 'High' | 'Medium' | 'Low';

/**
 * Security event interface (matching backend SecurityEvent model)
 */
export interface SecurityEvent {
    event_type: SecurityEventType;
    severity: SecuritySeverity;
    user: string;
    source_ip: string;
    timestamp: string;
    details: Record<string, any>;
}

/**
 * Create a generic security event
 * 
 * @param overrides - Partial event data to override defaults
 * @returns SecurityEvent with generated or overridden values
 */
export const createSecurityEvent = (
    overrides: Partial<SecurityEvent> = {}
): SecurityEvent => ({
    event_type: 'SshCommand',
    severity: 'Medium',
    user: faker.internet.username(),
    source_ip: faker.internet.ipv4(),
    timestamp: faker.date.recent().toISOString(),
    details: {},
    ...overrides,
});

/**
 * Create a Break-Glass activation event
 * 
 * @param overrides - Partial event data to override defaults
 * @returns SecurityEvent for break-glass activation
 */
export const createBreakGlassActivationEvent = (
    overrides: Partial<SecurityEvent> = {}
): SecurityEvent =>
    createSecurityEvent({
        event_type: 'BreakGlassActivation',
        severity: 'Critical',
        details: {
            reason: faker.lorem.sentence(),
            activated_by: faker.internet.email(),
        },
        ...overrides,
    });

/**
 * Create a Break-Glass access event
 * 
 * @param overrides - Partial event data to override defaults
 * @returns SecurityEvent for break-glass access
 */
export const createBreakGlassAccessEvent = (
    overrides: Partial<SecurityEvent> = {}
): SecurityEvent =>
    createSecurityEvent({
        event_type: 'BreakGlassAccess',
        severity: 'Critical',
        user: 'emergency_admin',
        details: {
            action: faker.helpers.arrayElement(['sudo', 'config_change', 'user_mod']),
            command: faker.system.fileName(),
        },
        ...overrides,
    });

/**
 * Create a Break-Glass deactivation event
 * 
 * @param overrides - Partial event data to override defaults
 * @returns SecurityEvent for break-glass deactivation
 */
export const createBreakGlassDeactivationEvent = (
    overrides: Partial<SecurityEvent> = {}
): SecurityEvent =>
    createSecurityEvent({
        event_type: 'BreakGlassDeactivation',
        severity: 'High',
        details: {
            deactivated_by: faker.internet.email(),
            duration_seconds: faker.number.int({ min: 60, max: 3600 }),
        },
        ...overrides,
    });

/**
 * Create an SSH command event
 * 
 * @param overrides - Partial event data to override defaults
 * @returns SecurityEvent for SSH command
 */
export const createSshCommandEvent = (
    overrides: Partial<SecurityEvent> = {}
): SecurityEvent =>
    createSecurityEvent({
        event_type: 'SshCommand',
        severity: 'Low',
        details: {
            command: faker.helpers.arrayElement(['ls', 'cd', 'cat', 'vim', 'sudo rm -rf']),
            tty: faker.helpers.arrayElement(['/dev/pts/0', '/dev/pts/1']),
        },
        ...overrides,
    });

/**
 * Create a config change event
 * 
 * @param overrides - Partial event data to override defaults
 * @returns SecurityEvent for configuration change
 */
export const createConfigChangeEvent = (
    overrides: Partial<SecurityEvent> = {}
): SecurityEvent =>
    createSecurityEvent({
        event_type: 'ConfigChange',
        severity: 'Medium',
        details: {
            file: `/etc/ganache/${faker.system.fileName()}`,
            commit_hash: faker.git.commitSha(),
        },
        ...overrides,
    });
