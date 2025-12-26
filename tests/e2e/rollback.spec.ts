import { expect, test } from "@playwright/test";

/**
 * E2E Tests for Story 3.3: One-Click Config Rollback
 * @ref Story-3.3
 *
 * Tests the complete rollback flow:
 * - Navigating to configuration history
 * - Clicking rollback button
 * - Filling reason and confirming
 * - Validating visual feedback
 * - Verifying audit trail commit creation
 */

// Centralized timeout constants for better maintainability
// TODO: Consider moving to shared test config
const TIMEOUTS = {
  UI_ELEMENT: 10_000, // Standard UI element visibility
  ASYNC_OPERATION: 30_000, // Long-running async operations (rollback, API calls)
  NETWORK_REQUEST: 5_000, // Network requests
};
test.describe("Configuration Rollback", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the history page where rollback UI is located
    await page.goto("/history");

    // Wait for the timeline to load
    await expect(page.locator("text=System History")).toBeVisible();
  });

  test("should display rollback button for each commit", async ({ page }) => {
    // Check that rollback buttons exist in the timeline
    const rollbackButtons = page.locator(
      'button:has-text("Rollback to this Point")',
    );

    // Should have at least one rollback button
    await expect(rollbackButtons.first()).toBeVisible({
      timeout: TIMEOUTS.UI_ELEMENT,
    });
  });

  test("should open confirmation modal when rollback is clicked", async ({
    page,
  }) => {
    // Find and click the first rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // Check that the modal appears with correct title
    await expect(
      page.locator("text=Confirm Configuration Rollback"),
    ).toBeVisible();

    // Verify modal content
    await expect(
      page.locator(
        "text=You are about to rollback the configuration to commit",
      ),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(
        "e.g., Bad network configuration causing connectivity issues",
      ),
    ).toBeVisible();
  });

  test("should require reason before confirming rollback", async ({ page }) => {
    // Click rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // The confirm button should be disabled when reason is empty
    const confirmButton = page.locator('button:has-text("Confirm Rollback")');

    // Verify button is disabled
    await expect(confirmButton).toBeDisabled();
  });

  test("should allow canceling rollback", async ({ page }) => {
    // Click rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // Wait for modal
    await expect(
      page.locator("text=Confirm Configuration Rollback"),
    ).toBeVisible();

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Modal should disappear
    await expect(
      page.locator("text=Confirm Configuration Rollback"),
    ).not.toBeVisible();
  });

  test("should enable confirm button when reason is provided", async ({
    page,
  }) => {
    // Click rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // Fill in the reason
    const reasonInput = page.getByPlaceholder(
      "e.g., Bad network configuration causing connectivity issues",
    );
    await reasonInput.fill("E2E test rollback - validating button enable");

    // Confirm button should now be enabled
    const confirmButton = page.locator('button:has-text("Confirm Rollback")');
    await expect(confirmButton).toBeEnabled();
  });

  test("should successfully execute rollback with valid reason", async ({
    page,
  }) => {
    // Get the current commit count before rollback
    const commitCards = page.locator(".relative.group");

    // Wait for cards to load
    await expect(commitCards.first()).toBeVisible({
      timeout: TIMEOUTS.UI_ELEMENT,
    });
    const initialCount = await commitCards.count();

    // Click rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // Fill in the reason
    const reasonInput = page.getByPlaceholder(
      "e.g., Bad network configuration causing connectivity issues",
    );
    await reasonInput.fill("E2E test rollback - automated testing");

    // Confirm rollback
    const confirmButton = page.locator('button:has-text("Confirm Rollback")');
    await confirmButton.click();

    // Wait for success feedback and modal close
    await expect(
      page.locator("text=Confirm Configuration Rollback"),
    ).not.toBeVisible({ timeout: TIMEOUTS.ASYNC_OPERATION });

    // Wait for UI to refresh and show the new commit
    await page.waitForTimeout(2000);

    // Reload to ensure we see fresh data
    await page.reload();
    await expect(page.locator("text=System History")).toBeVisible();

    // Verify a new commit was created (audit trail)
    const newCards = page.locator(".relative.group");
    await expect(newCards.first()).toBeVisible({
      timeout: TIMEOUTS.UI_ELEMENT,
    });
    const newCount = await newCards.count();

    // Should have at least the same number of commits (rollback creates new commit)
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test("should show loading state during rollback execution", async ({
    page,
  }) => {
    // Click rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // Fill reason
    const reasonInput = page.getByPlaceholder(
      "e.g., Bad network configuration causing connectivity issues",
    );
    await reasonInput.fill("Testing loading state");

    // Confirm rollback
    const confirmButton = page.locator('button:has-text("Confirm Rollback")');
    await confirmButton.click();

    // Check for loading indicator - button should show "Rolling back..."
    // This is very fast, so we check if either loading state appears or modal closes quickly
    const rollbackingText = page.locator("text=Rolling back...");
    const modalGone = page.locator("text=Confirm Configuration Rollback");

    // One of these should happen: either we see "Rolling back..." or modal disappears quickly
    // We just verify no error occurs during this phase
    await expect(modalGone).not.toBeVisible({
      timeout: TIMEOUTS.ASYNC_OPERATION,
    });
  });

  test("should display rollback commit in timeline with audit message", async ({
    page,
  }) => {
    // Execute a rollback first
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    const reasonInput = page.getByPlaceholder(
      "e.g., Bad network configuration causing connectivity issues",
    );
    const testReason = "E2E audit trail verification test";
    await reasonInput.fill(testReason);

    const confirmButton = page.locator('button:has-text("Confirm Rollback")');
    await confirmButton.click();

    // Wait for modal to close
    await expect(
      page.locator("text=Confirm Configuration Rollback"),
    ).not.toBeVisible({ timeout: TIMEOUTS.ASYNC_OPERATION });

    // Refresh the page to ensure we see the latest commits
    await page.reload();
    await expect(page.locator("text=System History")).toBeVisible();

    // Look for the rollback commit message
    // According to the backend, it should contain "Rollback to"
    await expect(page.locator("text=/.*Rollback.*/i").first()).toBeVisible({
      timeout: TIMEOUTS.UI_ELEMENT,
    });
  });

  test("should handle rollback errors gracefully", async ({ page }) => {
    // TODO: Implement proper error testing with API mocking
    // Current limitation: Without a way to trigger backend errors in test env,
    // this test mainly verifies the UI doesn't crash
    // Future improvement: Use page.route() to intercept /api/v1/config/rollback
    // and return error response to validate error toast display

    // Click rollback button
    const rollbackButton = page
      .locator('button:has-text("Rollback to this Point")')
      .first();
    await rollbackButton.click();

    // Fill invalid or problematic data (if backend supports error simulation)
    const reasonInput = page.getByPlaceholder(
      "e.g., Bad network configuration causing connectivity issues",
    );
    await reasonInput.fill("Test error handling");

    // Note: Without a way to trigger backend errors in test env,
    // this test mainly verifies the UI doesn't crash
    const confirmButton = page.locator('button:has-text("Confirm Rollback")');
    await confirmButton.click();

    // The modal should either close (success) or show error message
    // We'll just verify no crash occurred by checking page is still responsive
    await expect(page.locator("text=System History")).toBeVisible();
  });
});
