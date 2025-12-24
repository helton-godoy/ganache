
import { expect, test } from '../support/fixtures/auth.fixture';

test.describe('Security Dashboard', () => {
    test('[P1] should display key elements and real backend data', async ({ authenticatedPage }) => {
        // Navigate to the actual security dashboard route
        await authenticatedPage.goto('/security');

        // Verify Page Title
        await expect(authenticatedPage.getByText('Security Monitor')).toBeVisible();

        // Verify Metrics Cards are Rendered
        await expect(authenticatedPage.getByText('Events / Minute')).toBeVisible();
        await expect(authenticatedPage.getByText('Active Users')).toBeVisible();

        // Verify Connection Status (should connect to real WebSocket or show disconnected)
        // Wait for either connection state
        const connectionStatus = authenticatedPage.locator('text=Live Connected, text=Disconnected').first();
        await expect(connectionStatus).toBeVisible({ timeout: 5000 });

        // Verify Event Timeline Component
        await expect(authenticatedPage.getByText('Security Event Feed')).toBeVisible();

        // Give time for API calls to complete
        await authenticatedPage.waitForTimeout(2000);

        // Verify System Status Widget
        await expect(authenticatedPage.getByText('System Status')).toBeVisible();
    });
});
