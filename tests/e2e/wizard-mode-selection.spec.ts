import { expect, test } from '../support/fixtures';

test.describe('Wizard Mode Selection', () => {

    test('should recommend Compatibility Mode when hardware RAID is detected', async ({ wizard, page }) => {
        // GIVEN: Hardware RAID is detected
        await wizard.mockHardwareDetection({ has_raid: true, controller_name: 'PERC H700' });

        // WHEN: We visit the wizard (don't skip welcome)
        await wizard.goto({ skipWelcome: false });

        // THEN: "Hardware Detected" badge is visible
        await expect(page.getByText('Hardware Detected: PERC H700')).toBeVisible();

        // AND: Compatibility Mode is selected by default
        const compatibilityCard = page.getByTestId('card-compatibility');
        await expect(compatibilityCard).toHaveClass(/border-primary/);
        await expect(compatibilityCard).toHaveClass(/shadow-lg/);
    });

    test('should show safety gate warning when selecting Standard Mode with RAID present', async ({ wizard, page }) => {
        // GIVEN: Hardware RAID is detected
        await wizard.mockHardwareDetection({ has_raid: true, controller_name: 'PERC H700' });
        await wizard.goto({ skipWelcome: false });

        // WHEN: User clicks "Standard Mode"
        await page.getByTestId('card-standard').click();

        // THEN: A warning dialog appears
        const warningDialog = page.getByRole('alertdialog');
        await expect(warningDialog).toBeVisible();
        await expect(warningDialog).toContainText('Hardware RAID Detected');

        // WHEN: User cancels
        await page.getByRole('button', { name: 'Cancel' }).click();

        // THEN: Compatibility Mode determines to remain selected (Standard NOT selected)
        const standardCard = page.getByTestId('card-standard');
        await expect(standardCard).not.toHaveClass(/shadow-lg/);
    });

    test('should allow bypassing safety gate', async ({ wizard, page }) => {
        // GIVEN: Hardware RAID is detected & Safety Gate is open
        await wizard.mockHardwareDetection({ has_raid: true, controller_name: 'PERC H700' });
        await wizard.goto({ skipWelcome: false });
        await page.getByTestId('card-standard').click();

        // WHEN: User confirms "Proceed Anyway"
        await page.getByRole('button', { name: 'Proceed Anyway' }).click();

        // THEN: Standard Mode is selected
        const standardCard = page.getByTestId('card-standard');
        await expect(standardCard).toHaveClass(/border-primary/);
    });
});

