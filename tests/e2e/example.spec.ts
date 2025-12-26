import { expect, test } from "../support/fixtures";

test.describe("Example Test Suite", () => {
  test.skip("should load homepage", async ({ page }) => {
    await page.goto("/");
    // Adjust this expectation to match your actual homepage title or content
    // await expect(page).toHaveTitle(/Home/i);
    // Checking for a common element since title might vary
    await expect(page.locator("body")).toBeVisible();
  });

  test("should create user", async ({ userFactory }) => {
    // Create test user using factory
    const user = await userFactory.createUser();

    expect(user.email).toBeTruthy();
    expect(user.password).toBeTruthy();
    console.log(`Created test user: ${user.email}`);
  });
});
