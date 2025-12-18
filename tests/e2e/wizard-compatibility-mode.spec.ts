import { expect, test } from '../support/fixtures';

test.describe('Wizard Compatibility Mode', () => {

    test('should block confirmation until "CONFIRM" is typed', async ({ wizard, page }) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // GIVEN: Hardware RAID is detected
        await wizard.mockHardwareDetection({ has_raid: true, controller_name: 'PERC H700' });
        await wizard.goto({ skipWelcome: false });

        // AND: User selects Compatibility Mode
        await page.getByTestId('card-compatibility').click();

        // AND: Click Continue
        await page.getByRole('button', { name: 'Continue Setup' }).click();

        // WHEN: User clicks "I Understand"
        await page.getByRole('button', { name: 'I Understand' }).click();

        // THEN: Confirmation Dialog appears
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Type CONFIRM below')).toBeVisible();

        // AND: Confirm button is disabled initially
        const confirmBtn = page.getByRole('button', { name: 'Confirm Action' });
        await expect(confirmBtn).toBeDisabled();

        // WHEN: User types mismatch
        await page.getByPlaceholder('CONFIRM').fill('confirm'); // Lowercase
        await expect(confirmBtn).toBeDisabled();

        // WHEN: User types correct keyword
        await page.getByPlaceholder('CONFIRM').fill('CONFIRM');

        // THEN: Confirm button becomes enabled
        await expect(confirmBtn).toBeEnabled();

        // WHEN: User clicks Confirm
        // Mock the backend call
        await page.route('**/api/v1/cluster/configure', async (route) => {
            await route.fulfill({
                status: 200,
                json: { state: "syncing", progress: 0.1, message: "Syncing..." }
            });
        });

        await confirmBtn.click();

        // THEN: Visualizer appears
        await expect(page.getByText('Initializing Twin-View Cluster')).toBeVisible();
    });

});
