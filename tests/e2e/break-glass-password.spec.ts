/**
 * Break-Glass Emergency Admin - Password Security Tests
 *
 * Validates AC 5.3.2: Segurança da Conta Break-Glass
 *
 * @ref Story-5.3 AC 5.3.2
 */

import {
  generateInvalidPassword,
  generateValidPassword,
} from "../support/factories/user.factory";
import { expect, test } from "../support/fixtures/break-glass.fixture";

test.describe("Break-Glass Emergency Admin - Password Security [P0]", () => {
  test("[P0] should force password reset before first login", async ({
    breakGlassActivated,
  }) => {
    // GIVEN: emergency_admin is activated (via fixture)
    // WHEN: Admin attempts to login without resetting password
    await breakGlassActivated.goto("/login");
    await breakGlassActivated.fill(
      '[data-testid="username"]',
      "emergency_admin",
    );
    await breakGlassActivated.fill('[data-testid="password"]', "any-password");
    await breakGlassActivated.click('[data-testid="login-submit"]');

    // THEN: Redirected to password reset page (forced)
    await expect(breakGlassActivated).toHaveURL(/\/reset-password/, {
      timeout: 10000,
    });

    // AND: Password reset form is visible
    await expect(
      breakGlassActivated.locator('[data-testid="password-reset-form"]'),
    ).toBeVisible();

    await expect(
      breakGlassActivated.locator(
        '[data-testid="password-reset-required-message"]',
      ),
    ).toContainText("You must reset your password before continuing");
  });

  test("[P0] should enforce password complexity (12+ chars, mixed case, numbers, symbols)", async ({
    breakGlassActivated,
  }) => {
    await breakGlassActivated.goto("/reset-password");

    // Test Case 1: Too short (< 12 chars)
    const tooShortPassword = generateInvalidPassword("too_short");
    await breakGlassActivated.fill(
      '[data-testid="new-password"]',
      tooShortPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    await expect(
      breakGlassActivated.locator('[data-testid="validation-error"]'),
    ).toContainText(/minimum 12 characters/i);

    // Test Case 2: Missing uppercase
    const noUpperPassword = generateInvalidPassword("no_upper");
    await breakGlassActivated.fill(
      '[data-testid="new-password"]',
      noUpperPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    await expect(
      breakGlassActivated.locator('[data-testid="validation-error"]'),
    ).toContainText(/uppercase/i);

    // Test Case 3: Missing lowercase
    const noLowerPassword = generateInvalidPassword("no_lower");
    await breakGlassActivated.fill(
      '[data-testid="new-password"]',
      noLowerPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    await expect(
      breakGlassActivated.locator('[data-testid="validation-error"]'),
    ).toContainText(/lowercase/i);

    // Test Case 4: Missing digit
    const noDigitPassword = generateInvalidPassword("no_digit");
    await breakGlassActivated.fill(
      '[data-testid="new-password"]',
      noDigitPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    await expect(
      breakGlassActivated.locator('[data-testid="validation-error"]'),
    ).toContainText(/digit|number/i);

    // Test Case 5: Missing symbol
    const noSymbolPassword = generateInvalidPassword("no_symbol");
    await breakGlassActivated.fill(
      '[data-testid="new-password"]',
      noSymbolPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    await expect(
      breakGlassActivated.locator('[data-testid="validation-error"]'),
    ).toContainText(/symbol|special character/i);

    // Test Case 6: Valid password (meets all requirements)
    const validPassword = generateValidPassword();
    await breakGlassActivated.fill(
      '[data-testid="new-password"]',
      validPassword,
    );
    await breakGlassActivated.fill(
      '[data-testid="confirm-password"]',
      validPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    // THEN: Password is accepted
    await expect(breakGlassActivated).toHaveURL(/\/dashboard|\/security/, {
      timeout: 10000,
    });
  });

  test("[P1] should validate password via API endpoint", async ({
    request,
  }) => {
    // Test invalid password via API
    const invalidResponse = await request.post(
      "/api/v1/security/break-glass/validate-password",
      {
        data: { password: "Too-Short1" }, // Only 11 chars
      },
    );

    expect(invalidResponse.status()).toBe(200);
    const invalidBody = await invalidResponse.json();
    expect(invalidBody.valid).toBe(false);
    expect(invalidBody.errors).toContain(
      "Password must be at least 12 characters",
    );

    // Test valid password via API
    const validPassword = generateValidPassword();
    const validResponse = await request.post(
      "/api/v1/security/break-glass/validate-password",
      {
        data: { password: validPassword },
      },
    );

    expect(validResponse.status()).toBe(200);
    const validBody = await validResponse.json();
    expect(validBody.valid).toBe(true);
    expect(validBody.errors).toEqual([]);
  });

  test("[P2] should log password reset activity to audit log", async ({
    breakGlassActivated,
  }) => {
    // WHEN: Resetting password
    await breakGlassActivated.goto("/reset-password");
    const newPassword = generateValidPassword();
    await breakGlassActivated.fill('[data-testid="new-password"]', newPassword);
    await breakGlassActivated.fill(
      '[data-testid="confirm-password"]',
      newPassword,
    );
    await breakGlassActivated.click('[data-testid="submit-password"]');

    // THEN: Navigate to security events
    await breakGlassActivated.goto("/security/events");

    // AND: Password reset event is logged
    await breakGlassActivated.waitForSelector(
      '[data-testid="security-event"]',
      {
        timeout: 5000,
      },
    );

    // Search for password reset event
    const events = breakGlassActivated.locator(
      '[data-testid="security-event"]',
    );
    const eventCount = await events.count();

    let foundPasswordResetEvent = false;
    for (let i = 0; i < eventCount; i++) {
      const eventText = await events.nth(i).textContent();
      if (
        eventText?.includes("password") ||
        eventText?.includes("PasswordReset")
      ) {
        foundPasswordResetEvent = true;
        break;
      }
    }

    expect(
      foundPasswordResetEvent,
      "Password reset event should be logged in security events",
    ).toBe(true);
  });
});
