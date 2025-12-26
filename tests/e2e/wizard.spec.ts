import { test } from "../support/fixtures";

test.describe("Setup Wizard", () => {
  test.beforeEach(async ({ wizard }) => {
    await wizard.mockDisks();
    await wizard.goto();
  });

  test("should allow a user to auto-assign disks and proceed to review", async ({
    wizard,
    page,
  }) => {
    // Run through the flow using the fixture abstraction
    await wizard.autoAssign();
    await wizard.proceedToReview();

    // Verify we are on the review step (implicitly checked by proceedToReview, but adding explicit assertions here if needed)
    // Verify we are on the review step (implicitly checked by proceedToReview)
  });

  test("should allow a user to confirm configuration", async ({ wizard }) => {
    await wizard.autoAssign();
    await wizard.proceedToReview();
    await wizard.confirmConfiguration();

    // Add verification for what happens after confirm (e.g., redirect to dashboard or success message)
    // For now, the fixture handles the click, we can assert URL or toast if known
  });
});
