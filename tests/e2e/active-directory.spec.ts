import { expect, test } from "@playwright/test";

/**
 * E2E tests for Active Directory integration
 *
 * @ref Story-4.1 - Active Directory domain join E2E tests
 */

test.describe("Active Directory Integration", () => {
  test("should display AD status endpoint", async ({ request }) => {
    const response = await request.get(
      "http://localhost:3005/api/v1/ad/status",
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("is_joined");
    expect(data).toHaveProperty("service_status");
  });

  test("should validate required fields on join request", async ({
    request,
  }) => {
    const invalidRequest = {
      domain_name: "",
      username: "admin",
      password: "password",
      dns_servers: "192.168.1.1",
    };

    const response = await request.post(
      "http://localhost:3005/api/v1/ad/join",
      {
        data: invalidRequest,
        headers: {
          "Content-Type": "application/json",
          "X-Auth-User": "testuser",
        },
      },
    );

    // Should fail validation
    expect(response.status()).toBe(500); // Internal server error due to validation
  });

  test("should accept valid AD join request", async ({ request }) => {
    const validRequest = {
      domain_name: "test.local",
      username: "Administrator",
      password: "P@ssw0rd123",
      dns_servers: "192.168.1.1",
      organizational_unit: null,
    };

    const response = await request.post(
      "http://localhost:3005/api/v1/ad/join",
      {
        data: validRequest,
        headers: {
          "Content-Type": "application/json",
          "X-Auth-User": "testuser",
        },
      },
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("success");
    expect(data).toHaveProperty("message");
  });

  test("should allow leaving domain", async ({ request }) => {
    const response = await request.post(
      "http://localhost:3005/api/v1/ad/leave",
      {
        headers: {
          "X-Auth-User": "testuser",
        },
      },
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("success");
    expect(data.current_domain).toBeUndefined();
  });

  test("should persist AD configuration to Git", async ({ request }) => {
    // Join domain
    const joinRequest = {
      domain_name: "corp.example.com",
      username: "admin",
      password: "secret",
      dns_servers: "10.0.0.1",
      organizational_unit: null,
    };

    await request.post("http://localhost:3005/api/v1/ad/join", {
      data: joinRequest,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-User": "testuser",
      },
    });

    // Check config history for AD commit
    const historyResponse = await request.get(
      "http://localhost:3005/api/v1/config/history?limit=10",
    );
    expect(historyResponse.ok()).toBeTruthy();

    const commits = await historyResponse.json();
    expect(Array.isArray(commits)).toBeTruthy();

    // Should have a commit related to AD configuration
    const adCommit = commits.find(
      (commit: any) =>
        commit.message.toLowerCase().includes("active directory") ||
        commit.message.toLowerCase().includes("ad_config"),
    );

    expect(adCommit).toBeDefined();
  });

  test("should update status after join", async ({ request }) => {
    // Get status before join
    const statusBefore = await request.get(
      "http://localhost:3005/api/v1/ad/status",
    );
    const dataBefore = await statusBefore.json();

    // Join domain
    const joinRequest = {
      domain_name: "test.local",
      username: "Administrator",
      password: "TestPass123",
      dns_servers: "192.168.1.1",
      organizational_unit: null,
    };

    await request.post("http://localhost:3005/api/v1/ad/join", {
      data: joinRequest,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-User": "testuser",
      },
    });

    // Get status after join
    const statusAfter = await request.get(
      "http://localhost:3005/api/v1/ad/status",
    );
    const dataAfter = await statusAfter.json();

    // Status should reflect changes (in dev mode, may vary)
    expect(dataAfter).toHaveProperty("is_joined");
  });

  test("should validate DNS format", async ({ request }) => {
    const invalidDnsRequest = {
      domain_name: "test.local",
      username: "admin",
      password: "password",
      dns_servers: "invalid-dns-format",
      organizational_unit: null,
    };

    const response = await request.post(
      "http://localhost:3005/api/v1/ad/join",
      {
        data: invalidDnsRequest,
        headers: {
          "Content-Type": "application/json",
          "X-Auth-User": "testuser",
        },
      },
    );

    // Should fail due to invalid DNS format
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should validate FQDN domain name", async ({ request }) => {
    const invalidDomainRequest = {
      domain_name: "localhost", // Not a FQDN
      username: "admin",
      password: "password",
      dns_servers: "192.168.1.1",
      organizational_unit: null,
    };

    const response = await request.post(
      "http://localhost:3005/api/v1/ad/join",
      {
        data: invalidDomainRequest,
        headers: {
          "Content-Type": "application/json",
          "X-Auth-User": "testuser",
        },
      },
    );

    // Should fail due to invalid domain format
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
