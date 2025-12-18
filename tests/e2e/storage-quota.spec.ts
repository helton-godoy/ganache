import { expect, test } from "@playwright/test";

test.describe("Storage Quota Enforcement", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display storage pools with 90% hard quota badge", async ({
    page,
  }) => {
    await expect(page.getByText("Storage Pools")).toBeVisible();
    await expect(page.getByText("90% HARD QUOTA ACTIVE")).toBeVisible();
    await expect(page.getByText("Capacidade Útil (Limite 90%)")).toBeVisible();
  });

  test("should display critical alert when quota is reached", async ({
    page,
  }) => {
    // boot-pool is mocked with 18.1G used / 18G quota
    await expect(
      page.getByText(
        "ALERTA CRÍTICO: LIMITE DE QUOTA (90%) ATINGIDO NESTE POOL",
      ),
    ).toBeVisible();

    // The progress bar color should be changed (difficult to test strictly with Tailwind classes without specific selectors,
    // but we can check if the container has destructive bg or similar if needed)
    const poolContainer = page.locator('div:has-text("boot-pool")').last();
    await expect(poolContainer).toHaveClass(/bg-destructive/);
  });
});
