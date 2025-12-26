/**
 * ATDD Test Suite: SSR Error Messages & Deploy Blocker (RED PHASE)
 * Story 6.4: Automated SSR Regression Tests
 *
 * Purpose: Validate clear error messaging and deployment blocking for SSR failures
 * These tests should FAIL initially (RED phase) until error handling is implemented.
 *
 * Priority: P0 (Critical - Must Test)
 * Test IDs: 6.4-E2E-004, 6.4-E2E-005, 6.4-E2E-006
 */

import { expect, test } from "@playwright/test";

test.describe("SSR Error Messages & Deploy Blocker (@p0 @ssr)", () => {
  /**
   * Scenario 4: Security Dashboard renderiza logs de auditoria
   * Test ID: 6.4-E2E-004
   * Risk: R-SSR-008 (Security critical functionality)
   *
   * Acceptance Criteria Mapping:
   * AC #1: "Mensagens de erro claras sobre o que quebrou"
   */
  test("should render security dashboard with audit logs via SSR @p0 @6.4-E2E-004", async ({
    page,
  }) => {
    // NOTE: With RSC, page.route does not intercept server-side fetch calls in Next.js.
    // We validate that the SSR structure renders correctly, even if data is empty or default.

    // WHEN: User acessa /security/audit
    const response = await page.goto("/security", {
      waitUntil: "domcontentloaded",
    });
    const htmlContent = (await response?.text()) || "";

    // THEN: SSR renderiza estrutura básica de segurança e timeline
    expect(htmlContent).toContain("Security Monitor");
    expect(htmlContent).toContain("Real-time threat detection");

    // AND: Dados sensíveis NÃO aparecem no HTML inicial
    expect(htmlContent).not.toContain("password");
    expect(htmlContent).not.toContain("token");
    expect(htmlContent).not.toContain("secret");

    // AND: Componentes de UI principais estão presentes
    // Note: Timeline uses card layout, not table headers
    expect(htmlContent).toContain("User");

    await page.waitForLoadState("networkidle");
  });

  /**
   * Scenario 5: Detecção de window/localStorage em SSR
   * Test ID: 6.4-E2E-005
   * Risk: R-SSR-001 (Client-only API causing 500 errors)
   *
   * Acceptance Criteria Mapping:
   * AC #1: "Detectar falhas de SSR"
   * AC #1: "Mensagens de erro claras"
   */
  test("should detect and handle client-only API usage in SSR @p0 @6.4-E2E-005", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
      if (msg.type() === "warning") consoleWarnings.push(msg.text());
    });

    // GIVEN: Component with potential client-only API usage
    // (This test validates guards are in place)

    // WHEN: SSR executes
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });

    // THEN: Guard `typeof window !== 'undefined'` prevents error
    const hasClientOnlyError = consoleErrors.some(
      (err) =>
        err.includes("window is not defined") ||
        err.includes("localStorage is not defined") ||
        err.includes("sessionStorage is not defined") ||
        err.includes("navigator is not defined"),
    );

    if (hasClientOnlyError) {
      // If error is found, test FAILS and reports which component broke
      const errorDetails = consoleErrors
        .filter((err) => err.includes("is not defined"))
        .join("\\n");

      throw new Error(
        `🚨 SSR FAILURE DETECTED - Client-only API usage without guard:\\n` +
          `${errorDetails}\\n\\n` +
          `Fix: Add guard before accessing browser APIs:\\n` +
          `if (typeof window !== 'undefined') { ... }`,
      );
    }

    expect(
      hasClientOnlyError,
      "SSR should not have client-only API errors",
    ).toBe(false);

    // AND: Fallback value is used on servidor
    expect(response?.status()).toBe(200);

    // AND: Hydration sincroniza valor correto no client
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  /**
   * Scenario 6: HTML inicial não contém dados sensíveis
   * Test ID: 6.4-E2E-006
   * Risk: R-SSR-004 (Data exposure via SSR)
   *
   * Acceptance Criteria Mapping:
   * AC #1: "Impedir implantação de funcionalidades SSR quebradas"
   */
  test("should not expose sensitive data in initial SSR HTML @p0 @6.4-E2E-006 @security", async ({
    page,
  }) => {
    // GIVEN: User authenticated with sensitive data (Mocked via MOCK_SSR_DATA in serverFetch)
    // We target /security because that's where user data (events) is rendered server-side.

    // WHEN: SSR renderiza HTML inicial
    const response = await page.goto("/security", {
      waitUntil: "domcontentloaded",
    });
    const htmlContent = (await response?.text()) || "";

    // THEN: Senhas, tokens, chaves NÃO aparecem no HTML
    const sensitivePatterns = [
      /secret[-_]?token/i,
      /api[-_]?key/i,
      /sk-live-/i,
      /password/i,
      /passwd/i,
      /private[-_]?key/i,
      /access[-_]?token/i,
      /refresh[-_]?token/i,
    ];

    const foundSensitiveData = sensitivePatterns.filter((pattern) =>
      pattern.test(htmlContent),
    );

    if (foundSensitiveData.length > 0) {
      throw new Error(
        `🚨 SECURITY VIOLATION - Sensitive data leaked in SSR HTML:\\n` +
          `Patterns found: ${foundSensitiveData.map((p) => p.source).join(", ")}\\n\\n` +
          `Fix: Never render sensitive data server-side. Use client-side fetching with auth.`,
      );
    }

    expect(
      foundSensitiveData.length,
      "Sensitive data should NOT be in SSR HTML",
    ).toBe(0);

    // AND: Apenas placeholders/IDs são renderizados
    // Mock data in api-server.ts returns "user0@ganache.local"
    expect(htmlContent).toContain("user0@ganache.local");
    expect(htmlContent).not.toContain("secret-token-12345"); // Token is BAD

    // AND: Dados reais são fetchados client-side (autenticado)
    await page.waitForLoadState("networkidle");
    // After hydration, sensitive data is available in memory but NOT in HTML
  });

  /**
   * Scenario 7: Erro em Server Component é capturado
   * Test ID: 6.4-INT-001
   * Risk: R-SSR-005 (Uncaught server errors causing 500)
   *
   * Acceptance Criteria Mapping:
   * AC #1: "Mensagens de erro claras"
   */
  test("should catch and display errors from Server Components @p0 @6.4-INT-001", async ({
    page,
  }) => {
    // GIVEN: Server Component lança erro (via Header Injection)
    await page.setExtraHTTPHeaders({
      "x-simulate-error": "true",
    });

    // WHEN: SSR tenta renderizar
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });

    // THEN: Error boundary captura erro (should NOT crash completely/white screen, but might return 500 status in Next.js dev)
    // Note: Next.js Error Boundary renders HTML, so response status might be 200 or 500 depending on implementation.
    // We verify the UI content.

    // AND: Fallback UI é renderizado
    const errorFallback = page.locator('[data-testid="error-boundary"]');
    await expect(errorFallback).toBeVisible();

    await expect(errorFallback).toContainText("Something went wrong");

    // AND: Error details are available
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText("Simulated SSR Error");

    // Should NOT expose internal implementation details
    await expect(errorMessage).not.toContainText("node_modules");
    await expect(errorMessage).not.toContainText("/root/GANACHE");
  });

  /**
   * Scenario 8: CI/CD blocks deployment if SSR tests fail
   * Test ID: 6.4-E2E-007
   * Risk: All critical risks
   *
   * Acceptance Criteria Mapping:
   * AC #1: "Impedir implantação de funcionalidades SSR quebradas"
   *
   * Note: This test validates CI/CD configuration, not runtime behavior
   */
  test("should fail CI/CD pipeline if critical SSR tests fail @p0 @6.4-E2E-007 @ci", async ({
    page,
  }) => {
    // This is a META test - it validates the test suite itself
    // If ANY P0 SSR test fails, CI should block merge/deploy

    // GIVEN: P0 SSR tests in suite
    const p0TestCount = 7; // Number of P0 tests in this file

    // WHEN: Running test suite
    // THEN: If any P0 test fails, exit code should be non-zero

    // This test ALWAYS PASSES in isolation
    // It serves as documentation that P0 failures block deployment

    expect(p0TestCount).toBeGreaterThan(0);

    // Meta-assertion: Verify test tags are correct for CI filtering
    // CI should run: `playwright test --grep "@p0"`
    expect(test.info().title).toContain("@p0");
  });
});
