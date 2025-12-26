import { expect, test } from "@playwright/test";

test.describe("Boot Environment Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show the boot environment badge", async ({ page }) => {
    const badge = page.getByText(/Booted from:/);
    await expect(badge).toBeVisible();
  });

  test("should open the boot environment list dialog", async ({ page }) => {
    const badge = page.getByText(/Booted from:/);
    await badge.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Boot Environments")).toBeVisible();

    // Check for mock data
    await expect(dialog.getByText("pre-update-2024-12")).toBeVisible();
    await expect(dialog.getByText("initial-install")).toBeVisible();
  });

  test("should activate a boot environment", async ({ page }) => {
    const badge = page.getByText(/Booted from:/);
    await badge.click();

    const dialog = page.getByRole("dialog");
    const row = dialog.locator("tr").filter({ hasText: "initial-install" });
    const activateBtn = row.getByRole("button", { name: /Activate/i });

    await expect(activateBtn).toBeVisible();
    await activateBtn.click();

    // Check for toast notification (Sonner)
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible();
    await expect(toast.getByText("Boot Environment Activated")).toBeVisible();
  });
});
