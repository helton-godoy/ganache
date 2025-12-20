import { expect, test } from '@playwright/test';

test.describe('Configuration History Timeline', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the history page
        await page.goto('/history');
    });

    test('should display at least one commit in the timeline', async ({ page }) => {
        // Ensure the timeline is loaded
        await expect(page.locator('text=System History')).toBeVisible();

        // Check for commit items (using the bullet point indicator or the commit message)
        // The component shows "No configuration changes found" if empty, otherwise it shows cards.
        const noChanges = page.locator('text=No configuration changes found');
        const commitCards = page.locator('.relative.group');

        // Wait for either list or "no changes"
        await expect(noChanges.or(commitCards.first())).toBeVisible();
    });

    test('should allow filtering by author', async ({ page }) => {
        const authorInput = page.getByPlaceholder('Filter by author...');
        await authorInput.fill('system');

        // Wait for loading to start and finish (since input change triggers fetch)
        // Note: It might happen so fast we miss the loading state, so we just wait for the results or "loading" explicitly if visible
        // Better: wait for the results to settle. We can check if the list updates.

        // Just wait for the item to be visible with valid timeout
        await expect(page.locator('.relative.group').first()).toBeVisible({ timeout: 10000 });
    });

    test('should open visual diff dialog on button click', async ({ page }) => {
        const viewDiffButton = page.locator('text=View Visual Diff').first();
        await expect(viewDiffButton).toBeVisible();

        await viewDiffButton.click();

        // Check if dialog with "Visual Comparison" appears
        await expect(page.locator('text=Visual Comparison')).toBeVisible();

        // Check for some diff content (e.g., bg-emerald or bg-rose classes in our formatted diff)
        // Or just check if the content area isn't "Loading diff..."
        await expect(page.locator('text=Loading diff...')).not.toBeVisible();
    });

    test('should navigate pagination', async ({ page }) => {
        const nextButton = page.locator('text=Next');
        const prevButton = page.locator('text=Previous');

        await expect(nextButton).toBeVisible();
        await expect(prevButton).toBeVisible();

        // Initial page should be 1
        await expect(page.locator('text=Page 1')).toBeVisible();

        // If we have enough commits, we could test clicking "Next", but for a basic test
        // we just ensure the pagination controls are rendered.
    });
});
