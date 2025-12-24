/**
 * Authentication Fixtures
 * 
 * Provides pre-authenticated browser contexts for E2E tests.
 * Auto-cleanup ensures tests don't leak state between runs.
 * 
 * @ref Story-5.3 - Break-Glass Emergency Admin testing infrastructure
 */

import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
    authenticatedPage: Page;
};

/**
 * Authenticated page fixture
 * 
 * Setup: Logs in via UI (simulating real user flow)
 * Teardown: Automatically logs out to clean state
 * 
 * Usage:
 * ```typescript
 * test('should access protected page', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/admin');
 *   // User is already logged in
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
    authenticatedPage: async ({ page }, use) => {
        // Setup: Authenticate as admin user
        await page.goto('/login');

        // Fill login form (data-testid selectors for stability)
        await page.fill('[data-testid="username"]', 'admin');
        await page.fill('[data-testid="password"]', 'Admin123!@#');
        await page.click('[data-testid="login-submit"]');

        // Wait for successful login (dashboard redirect)
        await page.waitForURL('/dashboard', { timeout: 10000 });

        // Provide authenticated page to test
        await use(page);

        // Cleanup: Logout to prevent state leakage
        await page.goto('/logout').catch(() => {
            // Ignore logout errors (page might be closed)
        });
    },
});

export { expect } from '@playwright/test';
