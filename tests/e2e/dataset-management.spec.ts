import { expect, test } from "@playwright/test";
import {
  mockBootEnvironments,
  mockSystemResources,
  setupMockApi,
} from "./fixtures/api-mocks";

test.describe("Dataset Management", () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks
    await setupMockApi(page);
    await mockSystemResources(page);
    // await mockPools(page); // Let's rely on backend mock for pools too if possible, or keep it if backend is empty.
    // Actually, zfs.rs mock has "pool" and "boot-pool". So we can trust the backend.
    // Removing mockPools(page) assumes the frontend implementation of getPools calls the backend.

    // Remove mockDatasets(page) as requested
    // await mockDatasets(page);
    await mockBootEnvironments(page);

    await page.goto("/");

    // Check if loading
    if ((await page.locator(".animate-pulse").count()) > 0) {
      console.log("Dashboard is in loading state (skeletons visible)");
    }

    // Verification: Ensure dashboard loaded
    await expect(page.getByText("System Health")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should allow creating a new dataset", async ({ page }) => {
    const datasetName = `Finance-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Expand the accordion for the first pool (likely 'boot-pool')
    const accordionTrigger = page
      .getByRole("button", { name: "Manage Datasets & Shares" })
      .first();
    await expect(accordionTrigger).toBeVisible();
    await accordionTrigger.click();

    // 2. Click "New Share"
    const newShareBtn = page.getByRole("button", { name: "New Share" });
    await expect(newShareBtn).toBeVisible();
    await newShareBtn.click();

    // 3. Fill form
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.getByLabel("Dataset Name").fill(datasetName);

    // 4. Submit
    await page.getByRole("button", { name: "Create Dataset" }).click();

    // 5. Verify success toast
    await expect(
      page.getByText(`Dataset '${datasetName}' created successfully`),
    ).toBeVisible();

    // 6. Verify persistence in list
    await expect(page.getByRole("row", { name: datasetName })).toBeVisible();
  });

  test("should allow deleting a dataset", async ({ page }) => {
    const datasetName = `DeleteMe-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Expand
    const accordionTrigger = page
      .getByRole("button", { name: "Manage Datasets & Shares" })
      .first();
    await expect(accordionTrigger).toBeVisible();
    await accordionTrigger.click();

    // 2. Create dataset to delete (Seed)
    await page.getByRole("button", { name: "New Share" }).click();
    await page.getByLabel("Dataset Name").fill(datasetName);
    await page.getByRole("button", { name: "Create Dataset" }).click();
    await expect(
      page.getByText(`Dataset '${datasetName}' created successfully`),
    ).toBeVisible();

    // 3. Find the row for the new dataset
    const row = page.getByRole("row", { name: datasetName });
    await expect(row).toBeVisible();

    // 4. Click delete within that row
    const deleteBtn = row
      .getByRole("button")
      .filter({ has: page.locator(".lucide-trash-2") });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // 5. Confirm dialog
    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    // Type "CONFIRM"
    await page.getByPlaceholder("CONFIRM").fill("CONFIRM");

    // Click delete
    await page.getByRole("button", { name: "Delete Permanently" }).click();

    // 6. Verify toast
    await expect(page.getByText("deleted")).toBeVisible();

    // 7. Verify persistence (removed from list)
    await expect(
      page.getByRole("row", { name: datasetName }),
    ).not.toBeVisible();
  });
});
