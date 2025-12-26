/**
 * Break-Glass Emergency Admin - Deactivation Tests
 *
 * Validates AC 5.3.4: Desativação Automática
 *
 * @ref Story-5.3 AC 5.3.4
 */

import { expect, test } from "../support/fixtures/break-glass.fixture";

test.describe("Break-Glass Emergency Admin - Deactivation [P1]", () => {
  test("[P1] should deactivate account when AD is restored", async ({
    breakGlassActivated,
    request,
  }) => {
    // GIVEN: emergency_admin is activated and AD is restored (simulated)
    await breakGlassActivated.goto("/security/break-glass");

    // WHEN: Admin triggers deactivation
    await breakGlassActivated.click('[data-testid="deactivate-break-glass"]');

    // THEN: Confirmation dialog appears
    await expect(
      breakGlassActivated.locator(
        '[data-testid="confirm-deactivation-dialog"]',
      ),
    ).toBeVisible();

    // WHEN: Admin confirms deactivation
    await breakGlassActivated.click(
      '[data-testid="confirm-deactivation-button"]',
    );

    // THEN: Success message is displayed
    await expect(
      breakGlassActivated.locator(
        '[data-testid="deactivation-success-message"]',
      ),
    ).toContainText(/deactivated successfully|disabled/i);

    // AND: Status page shows "Disabled"
    const statusResponse = await request.get(
      "/api/v1/security/break-glass/status",
    );
    expect(statusResponse.status()).toBe(200);

    const statusBody = await statusResponse.json();
    expect(statusBody.status).toBe("Disabled");
  });

  test("[P1] should generate security event on deactivation", async ({
    breakGlassActivated,
    request,
  }) => {
    // WHEN: Deactivating via API
    const deactivateResponse = await request.post(
      "/api/v1/security/break-glass/deactivate",
    );

    expect(deactivateResponse.status()).toBe(200);

    // THEN: Navigate to security events
    await breakGlassActivated.goto("/security/events");
    await breakGlassActivated.waitForSelector(
      '[data-testid="security-event"]',
      {
        timeout: 5000,
      },
    );

    // AND: Deactivation event is logged
    const firstEvent = breakGlassActivated
      .locator('[data-testid="security-event"]')
      .first();
    await expect(firstEvent).toContainText(
      /BreakGlassDeactivation|Deactivated/i,
    );
    await expect(firstEvent).toContainText(/High|Critical/i); // Severity
  });

  test("[P1] should clear activation info after deactivation", async ({
    request,
  }) => {
    // GIVEN: Break-glass is activated
    await request.post("/api/v1/security/break-glass/activate", {
      data: {
        reason: "Test activation for deactivation",
        activated_by: "admin",
      },
    });

    // Verify activation info exists
    const beforeStatus = await request.get(
      "/api/v1/security/break-glass/status",
    );
    const beforeBody = await beforeStatus.json();
    expect(beforeBody.activation_info).toBeDefined();
    expect(beforeBody.activation_info.reason).toBe(
      "Test activation for deactivation",
    );

    // WHEN: Deactivating
    await request.post("/api/v1/security/break-glass/deactivate");

    // THEN: Activation info is cleared
    const afterStatus = await request.get(
      "/api/v1/security/break-glass/status",
    );
    const afterBody = await afterStatus.json();
    expect(afterBody.status).toBe("Disabled");
    expect(afterBody.activation_info).toBeNull();
  });

  test("[P2] should notify administrators on deactivation (if implemented)", async ({
    breakGlassActivated,
    request,
  }) => {
    // Note: Story 5.3 documentation indicates notification system is TODO (future implementation)
    // This test validates the endpoint accepts notification preferences if available

    // WHEN: Deactivating with notification flag
    const response = await request.post(
      "/api/v1/security/break-glass/deactivate",
      {
        data: {
          send_notification: true,
          deactivated_by: "admin@example.com",
        },
      },
    );

    // THEN: Endpoint accepts the request (notification logic may be stubbed)
    expect(response.status()).toBe(200);

    // Future: Validate notification was sent when system is implemented
    // For now, we just ensure the API contract is correct
  });

  test("[P2] should prevent operations on disabled account", async ({
    request,
  }) => {
    // GIVEN: Account is disabled (default state)
    // WHEN: Attempting to deactivate already-disabled account
    const response = await request.post(
      "/api/v1/security/break-glass/deactivate",
    );

    // THEN: Should handle gracefully (idempotent)
    // Backend may return 200 (already disabled) or 409 (conflict)
    expect([200, 409]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body.status).toBe("Disabled");
    }
  });
});

test.describe("Break-Glass Emergency Admin - Audit Report [P2]", () => {
  test("[P2] should track session duration in deactivation event", async ({
    request,
  }) => {
    // GIVEN: Activating break-glass
    const activationTime = new Date();
    await request.post("/api/v1/security/break-glass/activate", {
      data: {
        reason: "Duration tracking test",
        activated_by: "admin",
      },
    });

    // Simulate some time passing
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds

    // WHEN: Deactivating
    const deactivationTime = new Date();
    await request.post("/api/v1/security/break-glass/deactivate");

    // THEN: Deactivation event should include session duration
    // (Validated via security events API or audit log)
    const eventsResponse = await request.get("/api/v1/security/events");
    expect(eventsResponse.status()).toBe(200);

    const events = await eventsResponse.json();
    const deactivationEvent = events.find(
      (e: any) => e.event_type === "BreakGlassDeactivation",
    );

    expect(deactivationEvent).toBeDefined();
    expect(deactivationEvent.details.duration_seconds).toBeGreaterThanOrEqual(
      2,
    );
  });
});
