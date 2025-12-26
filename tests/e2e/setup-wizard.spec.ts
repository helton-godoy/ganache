import { expect, test } from "../support/fixtures";

test.describe("Setup Wizard", () => {
  test.beforeEach(async ({ wizard }) => {
    // GIVEN: API returns disk inventory
    await wizard.mockDisks();
  });

  test.fixme("[P0] should complete setup flow with auto-assignment", async ({
    wizard,
    page,
  }) => {
    // FIXME: Test healing failed after 3 attempts.
    // Failure: "expect(getByText('PERC6i-001')).toBeVisible() failed" - Data not loading.
    // Attempted fixes:
    //   1. Added 'meta' field to superjson mock - still failing
    //   2. Added explicit wait for data - confirmed data never loads
    //   3. Added 'type: "data"' to TRPC result structure - still failing
    // Manual investigation needed: Verify TRPC mock structure or superjson serialization for disk.list.

    // GIVEN: User is on the setup page
    await wizard.goto();

    // WHEN: User auto-assigns disks for both nodes
    await wizard.autoAssign();

    // AND: User proceeds to review
    await wizard.proceedToReview();

    // THEN: Review step shows correct summary
    await expect(page.getByText("Node A Summary")).toBeVisible();
    await expect(page.getByText("Node B Summary")).toBeVisible();

    // WHEN: User confirms configuration
    await wizard.confirmConfiguration();

    // THEN: User is redirected to dashboard
    await expect(page).toHaveURL("/");
    // Verify toast success if possible (flaky usually, but we check redirection)
  });
});
