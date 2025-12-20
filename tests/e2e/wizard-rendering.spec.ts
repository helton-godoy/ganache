import { expect, test } from '@playwright/test';

test.describe('Setup Wizard Rendering', () => {
    test('should render the setup wizard component', async ({ page }) => {
        await page.goto('/setup/wizard');
        await expect(page.getByText('Ganache Setup Wizard')).toBeVisible();
    });
});
