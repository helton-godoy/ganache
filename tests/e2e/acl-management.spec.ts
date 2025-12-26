import { expect, test } from "@playwright/test";

test.describe("ACL Management - Real Integration Tests", () => {
  const TEST_PATH = "tank1/test-dataset";

  test.beforeEach(async ({ page }) => {
    // Navigate to ACL test page
    await page.goto("/test-acl");

    // Wait for initial ACL load from backend
    await page.waitForLoadState("networkidle");
  });

  test("should load ACL editor and display initial ACEs from backend", async ({
    page,
  }) => {
    // Verify page loaded
    await expect(page.getByText("Access Control List (ACL)")).toBeVisible();
    await expect(page.getByText("Add Entry")).toBeVisible();

    // Verify mock data from backend is displayed (dev mode returns owner@, group@, everyone@)
    await expect(page.getByText("OWNER@")).toBeVisible();
    await expect(page.getByText("GROUP@")).toBeVisible();
    await expect(page.getByText("EVERYONE@")).toBeVisible();

    // Verify table structure
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("Principal")).toBeVisible();
    await expect(page.getByText("Permissions")).toBeVisible();
  });

  test("should add a new ACE and save to backend", async ({ page }) => {
    // Add an ACE
    await page.getByText("Add Entry").click();
    await expect(page.getByText("Edit Access Control Entry")).toBeVisible();

    // Dialog defaults to special identity "owner", change it to "everyone"
    // (Shadcn Select requires clicking trigger then item)
    const identitySelect = page
      .locator('label:has-text("Identity")')
      .locator("..")
      .getByRole("combobox");
    await identitySelect.click();
    await page.getByRole("option", { name: "Everyone (everyone@)" }).click();

    // Set type to Allow (should be default)
    // Apply the ACE
    await page.getByRole("button", { name: "Apply" }).click();

    // Verify ACE was added to the table
    const aceRows = page.getByRole("table").getByRole("row");
    await expect(aceRows).toHaveCount(5); // Header + 3 initial + 1 new

    // Verify "Save Changes" button is enabled (isDirty = true)
    await expect(
      page.getByRole("button", { name: "Save Changes" }),
    ).toBeEnabled();

    // Save changes (non-recursive)
    await page.getByRole("button", { name: "Save Changes" }).click();

    // Wait for API call to complete and verify success toast
    await expect(page.getByText("ACL saved successfully")).toBeVisible({
      timeout: 5000,
    });

    // Verify "Save Changes" button is disabled again (isDirty = false)
    await expect(
      page.getByRole("button", { name: "Save Changes" }),
    ).toBeDisabled();
  });

  test("should apply ACL recursively with confirmation", async ({ page }) => {
    // Enable recursive checkbox
    await page.getByLabel("Apply Recursively").check();

    // Make a change to enable save button
    await page.getByText("Add Entry").click();
    await page.getByRole("button", { name: "Apply" }).click();

    // Click Save Changes
    await page.getByRole("button", { name: "Save Changes" }).click();

    // Should see recursive confirmation dialog
    await expect(
      page.getByText("Apply Permissions Recursively?"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "This will apply ACL changes to all files and subdirectories",
      ),
    ).toBeVisible();

    // Confirm recursive application
    await page.getByRole("button", { name: "Apply Recursively" }).click();

    // Verify success
    await expect(page.getByText("ACL saved successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should edit existing ACE and validate changes", async ({ page }) => {
    // Click edit on first ACE (owner@)
    const firstEditButton = page
      .getByRole("table")
      .getByRole("row")
      .nth(1)
      .getByRole("button")
      .first();
    await firstEditButton.click();

    // Verify edit dialog opened with existing ACE data
    await expect(page.getByText("Edit Access Control Entry")).toBeVisible();

    // Modify permissions - disable write
    await page
      .getByText("Write Data")
      .locator("..")
      .getByRole("checkbox")
      .uncheck();

    // Apply changes
    await page.getByRole("button", { name: "Apply" }).click();

    // Verify save button enabled
    await expect(
      page.getByRole("button", { name: "Save Changes" }),
    ).toBeEnabled();
  });

  test("should delete ACE and reflect changes", async ({ page }) => {
    // Count initial rows
    const initialRows = await page.getByRole("table").getByRole("row").count();

    // Delete last ACE (everyone@)
    const lastDeleteButton = page
      .getByRole("table")
      .getByRole("row")
      .last()
      .getByRole("button", { name: "" })
      .last();
    await lastDeleteButton.click();

    // Verify row count decreased
    const newRows = await page.getByRole("table").getByRole("row").count();
    expect(newRows).toBe(initialRows - 1);

    // Verify save button enabled
    await expect(
      page.getByRole("button", { name: "Save Changes" }),
    ).toBeEnabled();
  });

  test("should reset ACL to backend state", async ({ page }) => {
    // Make a change
    await page.getByText("Add Entry").click();
    await page.getByRole("button", { name: "Apply" }).click();

    // Verify save button enabled
    await expect(
      page.getByRole("button", { name: "Save Changes" }),
    ).toBeEnabled();

    // Click Reset
    await page.getByRole("button", { name: "Reset" }).click();

    // Wait for refetch
    await page.waitForLoadState("networkidle");

    // Verify save button disabled (changes reverted)
    await expect(
      page.getByRole("button", { name: "Save Changes" }),
    ).toBeDisabled();
  });
});
