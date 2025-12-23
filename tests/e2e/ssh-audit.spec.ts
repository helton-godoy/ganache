import { expect, test } from '../support/fixtures';

test.describe('Compliance: Deep SSH Audit Logging (Story 5.1)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/security');
    });

    /**
     * @ref Story 5.1 - Acceptance Criterion 1
     * Scenario: Capture standard command execution
     */
    test('should record standard shell commands in the security feed', async ({ page }) => {
        // GIVEN: A simulated SSH command execution (Mocked via API trigger for testability)
        // In a real environment, this might be triggered by a SSH library or system call
        const testCommand = `ls -la /etc/ganache`;

        // Simular a captura do evento via POST (o que o PAM/Daemon faria)
        // Isso valida se o backend processa e expõe o evento corretamente
        await page.request.post('/api/v1/security/events', {
            data: {
                type: 'SSH_COMMAND',
                details: {
                    command: testCommand,
                    user: 'admin',
                    ip: '127.0.0.1'
                }
            }
        });

        // WHEN: Waiting for the event to appear in the dashboard
        const eventRow = page.locator('[data-testid="event-timeline"] >> text=' + testCommand);

        // THEN: The command must be visible in the timeline
        await expect(eventRow).toBeVisible({ timeout: 10000 });
        await expect(eventRow).toContainText('admin');
    });

    /**
     * @ref Story 5.1 - Acceptance Criterion 2
     * Scenario: Detect sub-shell / nested commands
     */
    test('should capture commands executed within sub-shells', async ({ page }) => {
        // GIVEN: A nested command string following PAM TTY hex patterns
        const nestedCommand = 'sh -c "echo breach > /tmp/test"';

        await page.request.post('/api/v1/security/events', {
            data: {
                type: 'SSH_COMMAND',
                details: {
                    command: nestedCommand,
                    user: 'root',
                    is_subshell: true
                }
            }
        });

        // WHEN: Checking for critical audit logs
        const criticalLog = page.locator('[data-testid="event-timeline"] >> text=' + nestedCommand);

        // THEN: The nested command must be identified and displayed
        await expect(criticalLog).toBeVisible();
        await expect(criticalLog).toHaveAttribute('data-security-level', 'CRITICAL');
    });
});
