import { expect, test } from "@playwright/test";

test.describe("Security API Expansion (Story 5.4 - P1/P2)", () => {
  test("[P1] GET /api/v1/security/events - should filter events by IP", async ({
    request,
  }) => {
    const targetIp = "10.0.0.50";

    // GIVEN: Multiple events exist (simulated via API for test context if supported, or assuming data exists)
    // For ATDD/Expansion, we validate the interface contract
    const response = await request.get("/api/v1/security/events", {
      params: { ip: targetIp },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // THEN: All returned events should have the target IP
    if (body.events && body.events.length > 0) {
      body.events.forEach((event: any) => {
        expect(event.details.ip).toBe(targetIp);
      });
    }
  });

  test("[P1] GET /api/v1/security/events - should filter events by user", async ({
    request,
  }) => {
    const targetUser = "attacker_joe";

    const response = await request.get("/api/v1/security/events", {
      params: { user: targetUser },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.events && body.events.length > 0) {
      body.events.forEach((event: any) => {
        expect(event.details.user).toBe(targetUser);
      });
    }
  });

  test("[P1] OpenAPI Sync: Should match SecurityEvent model schema", async ({
    request,
  }) => {
    // GIVEN: A security event from the API
    const response = await request.get("/api/v1/security/events", {
      params: { limit: 1 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.events && body.events.length > 0) {
      const event = body.events[0];
      // THEN: Mandatory fields from OpenAPI spec must exist
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("type");
      expect(event).toHaveProperty("timestamp");
      expect(event).toHaveProperty("severity");
      expect(event).toHaveProperty("details");
    }
  });

  test("[P2] GET /api/v1/security/events - should handle invalid date range with 400", async ({
    request,
  }) => {
    // GIVEN: Invalid date parameters
    const response = await request.get("/api/v1/security/events", {
      params: { from: "not-a-date", to: "yesterday" },
    });

    // THEN: Backend should validate and return 400 Bad Request
    expect(response.status()).toBe(400);
  });
});
