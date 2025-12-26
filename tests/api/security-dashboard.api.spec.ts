/**
 * Security Dashboard API - Contract Tests
 *
 * Validates OpenAPI contracts for Security Dashboard endpoints
 *
 * @ref Story-5.4 Backend API Endpoints
 */

import { expect, test } from "@playwright/test";

const API_BASE = process.env.BASE_URL || "http://localhost:3000";

test.describe("Security Dashboard API - Contracts", () => {
  test("[P1] GET /api/v1/security/events - should return paginated security events", async ({
    request,
  }) => {
    // WHEN: Fetching security events with pagination
    const response = await request.get(
      `${API_BASE}/api/v1/security/events?limit=10&offset=0`,
    );

    // THEN: Response is successful
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate response schema
    expect(body).toHaveProperty("events");
    expect(body.events).toBeInstanceOf(Array);
    expect(body.events.length).toBeLessThanOrEqual(10);

    // Validate event structure (if events exist)
    if (body.events.length > 0) {
      const firstEvent = body.events[0];
      expect(firstEvent).toMatchObject({
        event_type: expect.any(String),
        severity: expect.stringMatching(/Critical|High|Medium|Low/),
        user: expect.any(String),
        source_ip: expect.any(String),
        timestamp: expect.any(String),
      });

      // Validate timestamp is ISO 8601 format
      expect(firstEvent.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    }
  });

  test("[P1] GET /api/v1/security/events - should support filtering by event type", async ({
    request,
  }) => {
    // WHEN: Filtering by SSH event type
    const response = await request.get(
      `${API_BASE}/api/v1/security/events?event_type=SshCommand&limit=10`,
    );

    // THEN: Response contains only SSH events
    expect(response.status()).toBe(200);

    const body = await response.json();

    if (body.events.length > 0) {
      body.events.forEach((event: any) => {
        expect(event.event_type).toBe("SshCommand");
      });
    }
  });

  test("[P1] GET /api/v1/security/metrics - should return aggregated security metrics", async ({
    request,
  }) => {
    // WHEN: Fetching security metrics
    const response = await request.get(`${API_BASE}/api/v1/security/metrics`);

    // THEN: Response is successful
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate metrics schema
    expect(body).toMatchObject({
      events_per_minute: expect.any(Number),
      active_users: expect.any(Number),
      suspicious_ips: expect.any(Array),
    });

    // Validate metric values are reasonable
    expect(body.events_per_minute).toBeGreaterThanOrEqual(0);
    expect(body.events_per_minute).toBeLessThan(100000); // Sanity check

    expect(body.active_users).toBeGreaterThanOrEqual(0);
    expect(body.active_users).toBeLessThan(10000); // Sanity check

    // Validate suspicious IPs array structure
    body.suspicious_ips.forEach((ip: any) => {
      expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/); // IPv4 format
    });
  });

  test("[P2] GET /api/v1/security/alerts - should return active security alerts", async ({
    request,
  }) => {
    // WHEN: Fetching active alerts
    const response = await request.get(`${API_BASE}/api/v1/security/alerts`);

    // THEN: Response is successful
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validate alerts schema
    expect(body).toHaveProperty("alerts");
    expect(body.alerts).toBeInstanceOf(Array);

    // Validate alert structure (if alerts exist)
    if (body.alerts.length > 0) {
      const firstAlert = body.alerts[0];
      expect(firstAlert).toMatchObject({
        id: expect.any(String),
        severity: expect.stringMatching(/Critical|High|Medium|Low/),
        message: expect.any(String),
        triggered_at: expect.any(String),
      });
    }
  });

  test("[P2] POST /api/v1/security/alerts/:id/acknowledge - should acknowledge alert", async ({
    request,
  }) => {
    // GIVEN: Get list of active alerts
    const alertsResponse = await request.get(
      `${API_BASE}/api/v1/security/alerts`,
    );
    const alertsBody = await alertsResponse.json();

    if (alertsBody.alerts.length === 0) {
      // Skip test if no alerts available
      test.skip();
      return;
    }

    const alertId = alertsBody.alerts[0].id;

    // WHEN: Acknowledging the alert
    const response = await request.post(
      `${API_BASE}/api/v1/security/alerts/${alertId}/acknowledge`,
    );

    // THEN: Acknowledgement is successful
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      id: alertId,
      acknowledged: true,
    });
  });

  test("[P2] GET /api/v1/security/events - should validate pagination parameters", async ({
    request,
  }) => {
    // Test Case 1: Valid pagination
    const validResponse = await request.get(
      `${API_BASE}/api/v1/security/events?limit=5&offset=10`,
    );

    expect(validResponse.status()).toBe(200);
    const validBody = await validResponse.json();
    expect(validBody.events.length).toBeLessThanOrEqual(5);

    // Test Case 2: Invalid limit (too large)
    const invalidLimitResponse = await request.get(
      `${API_BASE}/api/v1/security/events?limit=10000`,
    );

    // Should either clamp to max or return 400
    expect([200, 400]).toContain(invalidLimitResponse.status());

    if (invalidLimitResponse.status() === 200) {
      const body = await invalidLimitResponse.json();
      expect(body.events.length).toBeLessThanOrEqual(1000); // Reasonable max
    }
  });

  test("[P1] GET /api/v1/security/events - should support filtering by user", async ({
    request,
  }) => {
    // WHEN: Filtering by specific user
    const response = await request.get(
      `${API_BASE}/api/v1/security/events?user=root&limit=10`,
    );

    // THEN: Response contains only events from that user
    expect(response.status()).toBe(200);

    const body = await response.json();

    if (body.events.length > 0) {
      body.events.forEach((event: any) => {
        expect(event.user).toBe("root");
      });
    }
  });

  test("[P2] API should handle invalid requests gracefully", async ({
    request,
  }) => {
    // Test Case 1: Invalid event type filter
    const invalidTypeResponse = await request.get(
      `${API_BASE}/api/v1/security/events?event_type=InvalidType`,
    );

    // Should return 200 with empty results or 400
    expect([200, 400]).toContain(invalidTypeResponse.status());

    // Test Case 2: Malformed query parameters
    const malformedResponse = await request.get(
      `${API_BASE}/api/v1/security/events?limit=notanumber`,
    );

    // Should return 400 Bad Request
    expect([400, 422]).toContain(malformedResponse.status());
  });
});
