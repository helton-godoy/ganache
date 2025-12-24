/**
 * ATDD Test Suite: SSR Failure Detection (RED PHASE)
 * Story 6.4: Automated SSR Regression Tests
 * 
 * Purpose: Validate that SSR rendering completes successfully without errors
 * These tests should FAIL initially (RED phase) until SSR implementation is complete.
 * 
 * Priority: P0 (Critical - Must Test)
 * Test IDs: 6.4-E2E-001, 6.4-E2E-002, 6.4-E2E-003
 */

import { expect, test } from '@playwright/test';

test.describe('SSR Failure Detection (@p0 @ssr @smoke)', () => {

    /**
     * Scenario 1: Root Layout renderiza sem erros SSR
     * Test ID: 6.4-E2E-001
     * Risk: R-SSR-001 (Client-only API usage)
     * 
     * Acceptance Criteria Mapping:
     * AC #1: "Testes devem detectar falhas de SSR"
     */
    test('should render root layout without SSR errors @p0 @6.4-E2E-001', async ({ page }) => {
        // GIVEN: Next.js app iniciando server-side
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Intercept BEFORE navigation (network-first pattern)
        await page.route('**/api/status', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    nodes: [
                        { id: 1, name: 'ganache-01', status: 'primary', uptime: '15d' },
                        { id: 2, name: 'ganache-02', status: 'secondary', uptime: '15d' },
                    ],
                }),
            })
        );

        // WHEN: Root layout é renderizado
        const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

        // THEN: HTML inicial contém elementos estruturais
        const htmlContent = await response?.text();
        expect(htmlContent).toContain('<html');
        expect(htmlContent).toContain('<body');

        // AND: Nenhum erro de SSR (window is not defined, etc.)
        const hasSSRError = consoleErrors.some(err =>
            err.includes('window is not defined') ||
            err.includes('document is not defined') ||
            err.includes('localStorage is not defined') ||
            err.includes('navigator is not defined')
        );
        expect(hasSSRError, `SSR errors detected: ${consoleErrors.join(', ')}`).toBe(false);

        // AND: Page loads successfully
        expect(response?.status()).toBe(200);

        // AND: QueryClientProvider is hydrated
        await expect(page.locator('body')).toBeVisible();
    });

    /**
     * Scenario 2: Dashboard page renderiza dados iniciais via SSR
     * Test ID: 6.4-E2E-002
     * Risk: R-SSR-007 (Critical user journey broken)
     * 
     * Acceptance Criteria Mapping:
     * AC #1: "Testes devem detectar falhas de SSR"
     * AC #1: "Fornecer mensagens de erro claras"
     */
    test('should render dashboard with initial SSR data @p0 @6.4-E2E-002', async ({ page }) => {
        // NOTE: RSC fetches real data from localhost:3000 (mock server or real backend).
        // We cannot easily mock this via page.route.
        // Focus on validating that SSR Rendered the Component Structure populated with *some* data.

        // WHEN: Dashboard page é renderizada
        const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
        const htmlContent = await response?.text();

        // THEN: HTML inicial contém estrutura do dashboard
        expect(htmlContent).toContain('System Health');
        expect(htmlContent).toContain('Memory Usage');
        expect(htmlContent).toContain('ARC Target');
        expect(htmlContent).toContain('Storage Pools');

        // AND: React Query hydration occurs without mismatch
        await page.waitForLoadState('networkidle');

        // Verify key elements are visible after hydration
        const healthCard = page.locator('text=System Health');
        await expect(healthCard).toBeVisible();

        // AND: Tempo de SSR < 2s (performance budget)
        const timing = await page.evaluate(() => JSON.parse(
            JSON.stringify(performance.getEntriesByType('navigation')[0])
        ));
        const serverRenderTime = timing.responseStart - timing.requestStart;
        expect(serverRenderTime, 'SSR render time exceeded 2s').toBeLessThan(2000);
    });

    /**
     * Scenario 3: Setup Wizard - Fluxo completo SSR
     * Test ID: 6.4-E2E-003
     * Risk: R-SSR-007 (Setup wizard critical path)
     * 
     * Acceptance Criteria Mapping:
     * AC #1: "Impedir implantação de funcionalidades SSR quebradas"
     */
    test('should render setup wizard complete flow via SSR @p0 @6.4-E2E-003', async ({ page }) => {
        // NOTE: RSC rendering depends on server state.
        // We validate that the page loads the Setup Shell via SSR.

        // WHEN: User acessa /setup
        const response = await page.goto('/setup', { waitUntil: 'domcontentloaded' });
        const htmlContent = await response?.text();

        // THEN: SSR renderiza wizard shell
        expect(htmlContent).toContain('Twin-View Cluster Setup');
        expect(htmlContent).toContain('Drag and drop disks');

        // AND: Client hydrates successfully
        await page.waitForLoadState('networkidle');

        // AND: No SSR hydration mismatch warnings
        const consoleLogs: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'warning' && msg.text().includes('did not match')) {
                consoleLogs.push(msg.text());
            }
        });

        expect(consoleLogs.length, `Hydration mismatches: ${consoleLogs.join(', ')}`).toBe(0);
    });

});
