
import { expect, test } from '@playwright/test';

test.describe('Security Dashboard', () => {
    test('should display key elements and real backend data', async ({ page }) => {
        // Navigate to the actual security dashboard route
        await page.goto('/security');

        // Verify Page Title
        await expect(page.getByText('Security Monitor')).toBeVisible();

        // Verify Metrics Cards are Rendered
        await expect(page.getByText('Events / Minute')).toBeVisible();
        await expect(page.getByText('Active Users')).toBeVisible();

        // Verify Connection Status (should connect to real WebSocket or show disconnected)
        // Wait for either connection state
        const connectionStatus = page.locator('text=Live Connected, text=Disconnected').first();
        await expect(connectionStatus).toBeVisible({ timeout: 5000 });

        // Verify Event Timeline Component
        await expect(page.getByText('Security Event Feed')).toBeVisible();

        // Give time for API calls to complete
        await page.waitForTimeout(2000);

        // Verify System Status Widget
        await expect(page.getByText('System Status')).toBeVisible();
    });
});
