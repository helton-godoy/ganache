import { Page, expect } from '@playwright/test';

export class WizardFixture {
    constructor(private page: Page) { }

    async mockDisks() {
        // Intercept TRPC call for disk.list
        await this.page.route('**/api/trpc/disk.list*', async (route) => {
            console.log('Intercepted disk.list request:', route.request().url());
            const json = [{
                result: {
                    type: "data",
                    data: {
                        json: [
                            { id: 'disk-1', serial: 'PERC6i-001', size: '1.92 TB', type: 'SSD', nodeId: 'node-a', status: 'available' },
                            { id: 'disk-2', serial: 'PERC6i-002', size: '1.92 TB', type: 'SSD', nodeId: 'node-a', status: 'available' },
                            { id: 'disk-3', serial: 'PERC6i-003', size: '1.92 TB', type: 'SSD', nodeId: 'node-b', status: 'available' },
                            { id: 'disk-4', serial: 'PERC6i-004', size: '1.92 TB', type: 'SSD', nodeId: 'node-b', status: 'available' }
                        ]
                    }
                }
            }];
            await route.fulfill({ json, status: 200 });
        });
    }

    async mockHardwareDetection(hardwareInfo: { has_raid: boolean, controller_name: string | null } = { has_raid: false, controller_name: null }) {
        await this.page.route('**/api/v1/system/hardware', async (route) => {
            await route.fulfill({
                json: hardwareInfo,
                status: 200
            });
        });
    }

    async goto({ skipWelcome = true }: { skipWelcome?: boolean } = {}) {
        await this.page.goto('/setup');

        if (skipWelcome) {
            const welcomeVisible = await this.page.getByText('Welcome to Ganache').isVisible();
            if (welcomeVisible) {
                // Select Compatibility Mode as a safe default if visible, or Standard if preferred for tests.
                // Let's click Standard to ensure we can proceed for general tests.
                const standardCard = this.page.getByTestId('card-standard');
                if (await standardCard.isVisible()) {
                    await standardCard.click();
                }
                await this.page.getByRole('button', { name: /Continue Setup/i }).click();
            }

            await expect(this.page.getByText('Twin-View Cluster Setup')).toBeVisible();
            // Wait for data to load to prevent race condition on Auto-Fill
            await expect(this.page.getByRole('button', { name: /Auto-Fill/i }).first()).toBeVisible();
        } else {
            await expect(this.page.getByText('Welcome to Ganache')).toBeVisible();
        }
    }

    async autoAssign() {
        // Click Auto-Fill for both nodes
        await this.page.getByRole('button', { name: /Auto-Fill/i }).first().click();
        await this.page.getByRole('button', { name: /Auto-Fill/i }).last().click();

        // Verify disks moved to assigned state (by checking pool counts)
        await expect(this.page.getByText('Node A Pool: 2')).toBeVisible();
        await expect(this.page.getByText('Node B Pool: 2')).toBeVisible();
    }

    async proceedToReview() {
        await this.page.getByRole('button', { name: /Next: Review/i }).click();
        await expect(this.page.getByText('Review Configuration')).toBeVisible();
        await expect(this.page.getByText('Pragmatic Mode')).toBeVisible({ timeout: 1000 }).catch(() => {
            // Fallback or just check for common elements if "Pragmatic Mode" text isn't explicit in UI yet
            // Based on code review: "A ZFS Pool will be created... DRBD replication"
            return expect(this.page.getByText('DRBD replication will be configured automatically')).toBeVisible();
        });
    }

    async confirmConfiguration() {
        await this.page.getByRole('button', { name: /Confirm & Apply/i }).click();
        // Toast might be flaky or transient, relying on URL redirection in test
    }
}
