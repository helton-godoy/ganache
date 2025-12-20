import { expect, test } from '@playwright/test';

test.describe('Automated Failover System', () => {
    test.beforeEach(async ({ request }) => {
        // Reset state before test (configure cluster)
        await request.post('/api/v1/cluster/configure', {
            data: {
                mode: 'compatibility',
                node_id: 1,
                peer_ip: '10.0.0.2',
                vip_address: '10.0.0.100',
                network_interface: 'eth0'
            }
        });
    });

    // REPLACED BY INTEGRATION TEST (core/ganache-lib/tests/integration_failover.rs)
    // This E2E test mocked the API response and did not verify real backend logic.
    // It is preserved here for manual UI verification reference only.
    test('should detect failure and initiate failover sequence', async ({ page, request }) => {
        // 1. Visit Cluster Dashboard
        // Verify API state explicitly
        const statusRes = await request.get('/api/v1/cluster/status');
        const statusData = await statusRes.json();
        console.log('Setup Status:', statusData);
        expect(statusData.state).toBe('syncing');

        // 1. Visit Cluster Dashboard
        await page.goto('/cluster');

        // Allow time for initial fetch and state update
        await page.waitForTimeout(3000);

        // Check if stuck on Step 1
        if (await page.getByPlaceholder('e.g. 10.0.0.2').isVisible()) {
            console.log('Stuck on Step 1. Trying to force join...');
            await page.getByPlaceholder('e.g. 10.0.0.2').fill('10.0.0.2');
            await page.getByRole('button', { name: /Connect to Peer Node/i }).click();
            await page.waitForTimeout(2000);
        }

        // Check initial state (should be syncing or ready)
        // Wait longer for hydration/polling
        await expect(page.getByText('HA LINK ACTIVE').or(page.getByText('Synchronizing Block Device'))).toBeVisible({ timeout: 15000 });

        // 2. Wait for Automatic Failover (Heartbeat Timeout > 5s)
        console.log('Waiting for heartbeat timeout (approx 6s)...');
        // We do NOT call simulate-failure. We let the monitor loop detect the stale heartbeat.

        // 3. Verify UI updates to "Failover initiated" or "Complete"
        // The monitor sets state to "failover", then "active".
        // Poll for either state.

        await expect(async () => {
            const status = await request.get('/api/v1/cluster/status').then(r => r.json());
            console.log('Status Poll:', status);
            expect(status.state).toBe('active');
        }).toPass({ timeout: 15000 });

        // UI Verification
        // It might flash "Failover" then go to "Active".
        await expect(page.locator('body')).toContainText(/Failover|Primary/i);
    });
});
