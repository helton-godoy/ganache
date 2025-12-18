import { expect, test } from '@playwright/test';
import { mockBootEnvironments, mockDatasets, mockPools, mockSystemResources, setupMockApi } from './fixtures/api-mocks';

test.describe('Dataset Management', () => {
    test.beforeEach(async ({ page }) => {
        // Setup API mocks
        await setupMockApi(page);
        await mockSystemResources(page);
        await mockPools(page);
        await mockDatasets(page);
        await mockBootEnvironments(page);

        await mockBootEnvironments(page);

        await page.goto('/');

        // Check if loading
        if (await page.locator('.animate-pulse').count() > 0) {
            console.log("Dashboard is in loading state (skeletons visible)");
        }

        // Verification: Ensure dashboard loaded
        await expect(page.getByText("System Health")).toBeVisible({ timeout: 10000 });
    });

    test('should allow creating a new dataset', async ({ page }) => {
        // 1. Expand the accordion for the first pool
        const accordionTrigger = page.getByRole('button', { name: 'Manage Datasets & Shares' }).first();
        await expect(accordionTrigger).toBeVisible();
        await accordionTrigger.click();

        // 2. Click "New Share"
        const newShareBtn = page.getByRole('button', { name: 'New Share' });
        await expect(newShareBtn).toBeVisible();
        await newShareBtn.click();

        // 3. Fill form
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await page.getByLabel('Dataset Name').fill('Finance');

        // 4. Submit
        await page.getByRole('button', { name: 'Create Dataset' }).click();

        // 5. Verify success toast
        await expect(page.getByText("Dataset 'Finance' created successfully")).toBeVisible();
    });

    test('should allow deleting a dataset', async ({ page }) => {
        // 1. Expand
        await page.getByRole('button', { name: 'Manage Datasets & Shares' }).first().click();

        // 2. Find a delete button (assuming mock data exists)
        // We use a more specific selector to find the trash icon button
        const deleteBtn = page.locator('button:has(.lucide-trash-2)').first();
        await expect(deleteBtn).toBeVisible();

        // 3. Click delete
        await deleteBtn.click();

        // 4. Confirm dialog
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();

        // Type "CONFIRM"
        await page.getByPlaceholder('CONFIRM').fill('CONFIRM');

        // Click delete
        await page.getByRole('button', { name: 'Delete Permanently' }).click();

        // 5. Verify toast
        await expect(page.getByText("Dataset 'Marketing' deleted")).toBeVisible();
    });
});
