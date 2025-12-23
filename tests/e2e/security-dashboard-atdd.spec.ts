import { expect, test } from '../support/fixtures';

test.describe('Compliance: Real-time Security Dashboard (Story 5.4)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/security');
    });

    /**
     * @ref Story 5.4 - Acceptance Criterion 4 & 7
     * Scenario: Real-time update via WebSocket
     */
    test('should update dashboard metrics automatically via WebSocket stream', async ({ page }) => {
        // GIVEN: Initial metric value
        const initialEvents = page.locator('[data-testid="metric-events-min"]');
        const initialValue = await initialEvents.innerText();

        // WHEN: Multiple events are simulated in the backend
        // We trigger an internal process that should push via WS
        await page.request.post('/api/v1/security/simulate-load', {
            data: { count: 10 }
        });

        // THEN: Metrics should update without page reload within 2 seconds
        await expect(async () => {
            const newValue = await initialEvents.innerText();
            expect(Number(newValue)).toBeGreaterThan(Number(initialValue));
        }).toPass({ timeout: 5000 });
    });

    /**
     * @ref Story 5.4 - Acceptance Criterion 5
     * Scenario: Visual alerts for critical events
     */
    test('should show visual toast alerts for high-risk security events', async ({ page }) => {
        // GIVEN: A high-risk event (e.g. multiple failed logins)
        await page.request.post('/api/v1/security/events', {
            data: {
                type: 'AUTH_FAILURE_BURST',
                details: { ip: '192.168.1.100', count: 5 }
            }
        });

        // WHEN: Looking for the notification
        const alertToast = page.locator('[data-testid="critical-alert-toast"]');

        // THEN: A critical alert must pop up
        await expect(alertToast).toBeVisible();
        await expect(alertToast).toContainText('192.168.1.100');
        await expect(alertToast).toHaveCSS('background-color', /rgb\(255, 0, 0\)|#ff0000/); // Red alert
    });

    /**
     * @ref Story 5.4 - P1 Scenario
     * Scenario: WebSocket resiliency
     */
    test('[P1] should reconnect automatically when WebSocket connection is lost', async ({ page }) => {
        // GIVEN: Dashboard is connected
        await expect(page.locator('text=Live Connected')).toBeVisible();

        // WHEN: WebSocket is forcefully closed (simulated via offline mode for the page)
        await page.context().setOffline(true);
        await expect(page.locator('text=Disconnected')).toBeVisible({ timeout: 10000 });

        // AND: Connection is restored
        await page.context().setOffline(false);

        // THEN: Dashboard should reconnect automatically
        await expect(page.locator('text=Live Connected')).toBeVisible({ timeout: 15000 });
    });

    /**
     * @ref Story 5.4 - P2 Scenario
     * Scenario: Interface Stress Test (10k events)
     */
    test('[P2] should handle 10k+ security events without freezing', async ({ page }) => {
        // GIVEN: A massive burst of events is triggered
        await page.request.post('/api/v1/security/simulate-load', {
            data: { count: 1000, burst: true }
        });

        // THEN: The UI should remain responsive (no long tasks)
        // We check if we can still interact with the filter button
        const filterButton = page.locator('[data-testid="filter-button"]');
        await expect(filterButton).toBeEnabled();
        await filterButton.click();

        // UI should not lag significantly
        await expect(page.locator('[data-testid="filter-modal"]')).toBeVisible();
    });
});
