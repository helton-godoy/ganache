/**
 * Break-Glass Fixtures
 * 
 * Specialized fixtures for testing Break-Glass Emergency Admin scenarios.
 * Handles complex setup/teardown of emergency account activation.
 * 
 * @ref Story-5.3 - Break-Glass Emergency Admin
 */

import { Page } from '@playwright/test';
import { test as authTest, expect } from './auth.fixture';

const BREAK_GLASS_API_BASE = process.env.BASE_URL || 'http://localhost:3000';

type BreakGlassFixtures = {
    breakGlassActivated: Page;
};

/**
 * Break-Glass activated fixture
 * 
 * Setup: Activates emergency_admin account via API
 * Teardown: Automatically deactivates account to clean state
 * 
 * Usage:
 * ```typescript
 * test('should access with emergency account', async ({ breakGlassActivated }) => {
 *   // Account is already activated
 *   await breakGlassActivated.goto('/security');
 * });
 * ```
 */
export const test = authTest.extend<BreakGlassFixtures>({
    breakGlassActivated: async ({ authenticatedPage, request }, use) => {
        // Setup: Activate break-glass via API
        const activationResponse = await request.post(
            `${BREAK_GLASS_API_BASE}/api/v1/security/break-glass/activate`,
            {
                data: {
                    reason: 'E2E Test Scenario - Automated Testing',
                    activated_by: 'test-admin',
                    source_ip: '127.0.0.1',
                },
            }
        );

        // Validate activation succeeded
        expect(
            activationResponse.status(),
            'Break-glass activation should succeed'
        ).toBe(200);

        const activationBody = await activationResponse.json();
        expect(
            activationBody.status,
            'Break-glass should be in ActivatedPendingPassword state'
        ).toBe('ActivatedPendingPassword');

        // Provide authenticated page with break-glass activated
        await use(authenticatedPage);

        // Cleanup: Deactivate break-glass
        await request
            .post(`${BREAK_GLASS_API_BASE}/api/v1/security/break-glass/deactivate`)
            .catch((error) => {
                console.warn('Break-glass deactivation cleanup failed:', error.message);
                // Don't fail test on cleanup errors
            });
    },
});

export { expect } from '@playwright/test';
