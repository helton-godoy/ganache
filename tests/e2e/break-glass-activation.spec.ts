/**
 * Break-Glass Emergency Admin - Activation Tests
 *
 * Validates AC 5.3.1: Ativação Segura da Conta Break-Glass
 *
 * @ref Story-5.3 AC 5.3.1
 */

import { expect, test } from "../support/fixtures/auth.fixture";

test.describe("Break-Glass Emergency Admin - Activation [P0]", () => {
  test("[P0] should activate emergency_admin account via API and send critical alert", async ({
    authenticatedPage,
    request,
  }) => {
    // GIVEN: Admin is authenticated and AD is inaccessible (simulated)
    await authenticatedPage.goto("/security/break-glass");

    // WHEN: Admin triggers break-glass activation
    await authenticatedPage.fill(
      '[data-testid="activation-reason"]',
      "AD controller offline - critical infrastructure failure",
    );
    await authenticatedPage.click('[data-testid="activate-break-glass"]');

    // THEN: Confirmation dialog appears
    await expect(
      authenticatedPage.locator('[data-testid="confirm-activation-dialog"]'),
    ).toBeVisible();

    // WHEN: Admin confirms activation
    await authenticatedPage.click('[data-testid="confirm-activation-button"]');

    // THEN: Success message is displayed
    await expect(
      authenticatedPage.locator('[data-testid="activation-success-message"]'),
    ).toContainText("emergency_admin account activated successfully");

    // AND: Critical security event is logged
    await authenticatedPage.goto("/security/events");

    // Wait for events to load
    await authenticatedPage.waitForSelector('[data-testid="security-event"]', {
      timeout: 5000,
    });

    // Validate break-glass activation event exists
    const firstEvent = authenticatedPage
      .locator('[data-testid="security-event"]')
      .first();
    await expect(firstEvent).toContainText("BreakGlassActivation");
    await expect(firstEvent).toContainText("Critical");

    // Cleanup: Deactivate via API
    await request.post("/api/v1/security/break-glass/deactivate");
  });

  test("[P1] should record activation metadata (who, when, why, source IP)", async ({
    authenticatedPage,
    request,
  }) => {
    // GIVEN: Admin is authenticated
    const reason = "E2E Test - Metadata validation";
    const expectedUser = "admin";

    // WHEN: Activating via API (direct test of backend)
    const response = await request.post(
      "/api/v1/security/break-glass/activate",
      {
        data: {
          reason,
          activated_by: expectedUser,
          source_ip: "127.0.0.1",
        },
      },
    );

    expect(response.status()).toBe(200);

    const body = await response.json();

    // THEN: Activation info contains all required metadata
    expect(body.activation_info).toBeDefined();
    expect(body.activation_info.reason).toBe(reason);
    expect(body.activation_info.activated_by).toBe(expectedUser);
    expect(body.activation_info.source_ip).toBe("127.0.0.1");
    expect(body.activation_info.activated_at).toBeDefined(); // ISO timestamp

    // AND: Timestamp is recent (within last 5 seconds)
    const activatedAt = new Date(body.activation_info.activated_at);
    const now = new Date();
    const diffMs = now.getTime() - activatedAt.getTime();
    expect(diffMs).toBeLessThan(5000);

    // Cleanup
    await request.post("/api/v1/security/break-glass/deactivate");
  });

  test("[P1] should prevent duplicate activation (idempotency)", async ({
    request,
  }) => {
    // WHEN: Activating break-glass
    const firstResponse = await request.post(
      "/api/v1/security/break-glass/activate",
      {
        data: {
          reason: "First activation",
          activated_by: "admin",
        },
      },
    );

    expect(firstResponse.status()).toBe(200);

    // WHEN: Attempting to activate again
    const secondResponse = await request.post(
      "/api/v1/security/break-glass/activate",
      {
        data: {
          reason: "Second activation attempt",
          activated_by: "admin",
        },
      },
    );

    // THEN: Second activation should fail or return same state
    // (Backend decision: return 409 Conflict or 200 with current state)
    expect([200, 409]).toContain(secondResponse.status());

    if (secondResponse.status() === 200) {
      const body = await secondResponse.json();
      expect(body.activation_info.reason).toBe("First activation"); // Original reason preserved
    }

    // Cleanup
    await request.post("/api/v1/security/break-glass/deactivate");
  });
});
