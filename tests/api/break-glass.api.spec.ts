/**
 * Break-Glass API - OpenAPI Contract Validation
 * 
 * Tests API contracts for Break-Glass Emergency Admin endpoints.
 * Validates request/response schemas match OpenAPI specification.
 * 
 * @ref Story-5.3 - Break-Glass Emergency Admin
 */

import { expect, test } from '@playwright/test';

const API_BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Break-Glass API - Contract Validation', () => {
    test.afterEach(async ({ request }) => {
        // Cleanup: Ensure break-glass is deactivated after each test
        await request
            .post(`${API_BASE}/api/v1/security/break-glass/deactivate`)
            .catch(() => {
                // Ignore cleanup errors
            });
    });

    test('[P0] POST /api/v1/security/break-glass/activate - should activate with valid request', async ({
        request,
    }) => {
        // WHEN: Activating break-glass with valid payload
        const response = await request.post(`${API_BASE}/api/v1/security/break-glass/activate`, {
            data: {
                reason: 'AD controller offline - E2E test',
                activated_by: 'admin@example.com',
                source_ip: '10.0.0.100',
            },
        });

        // THEN: Returns 200 with correct response schema
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toMatchObject({
            status: 'ActivatedPendingPassword', // Initial state after activation
            activation_info: {
                reason: 'AD controller offline - E2E test',
                activated_by: 'admin@example.com',
                source_ip: '10.0.0.100',
                activated_at: expect.any(String), // ISO 8601 timestamp
            },
        });

        // Validate timestamp format (ISO 8601)
        expect(body.activation_info.activated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
        );
    });

    test('[P1] POST /api/v1/security/break-glass/activate - should reject invalid request', async ({
        request,
    }) => {
        // WHEN: Activating with missing required fields
        const response = await request.post(`${API_BASE}/api/v1/security/break-glass/activate`, {
            data: {
                // Missing: reason, activated_by
            },
        });

        // THEN: Returns 400 Bad Request
        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.error).toBeDefined();
        expect(body.error).toContain('reason');
    });

    test('[P0] POST /api/v1/security/break-glass/deactivate - should deactivate successfully', async ({
        request,
    }) => {
        // GIVEN: Break-glass is activated
        await request.post(`${API_BASE}/api/v1/security/break-glass/activate`, {
            data: {
                reason: 'Setup for deactivation test',
                activated_by: 'admin',
            },
        });

        // WHEN: Deactivating
        const response = await request.post(
            `${API_BASE}/api/v1/security/break-glass/deactivate`
        );

        // THEN: Returns 200 with updated status
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.status).toBe('Disabled');
        expect(body.activation_info).toBeNull();
    });

    test('[P1] GET /api/v1/security/break-glass/status - should return current state', async ({
        request,
    }) => {
        // WHEN: Fetching status (default: Disabled)
        const response = await request.get(`${API_BASE}/api/v1/security/break-glass/status`);

        // THEN: Returns 200 with status schema
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty('status');
        expect(['Disabled', 'ActivatedPendingPassword', 'Active']).toContain(body.status);

        if (body.status === 'Disabled') {
            expect(body.activation_info).toBeNull();
        } else {
            expect(body.activation_info).toBeDefined();
            expect(body.activation_info).toHaveProperty('reason');
            expect(body.activation_info).toHaveProperty('activated_by');
            expect(body.activation_info).toHaveProperty('activated_at');
        }
    });

    test('[P0] POST /api/v1/security/break-glass/validate-password - should validate password complexity', async ({
        request,
    }) => {
        // Test Case 1: Valid password
        const validResponse = await request.post(
            `${API_BASE}/api/v1/security/break-glass/validate-password`,
            {
                data: {
                    password: 'ValidP@ssw0rd123!',
                },
            }
        );

        expect(validResponse.status()).toBe(200);
        const validBody = await validResponse.json();
        expect(validBody.valid).toBe(true);
        expect(validBody.errors).toEqual([]);

        // Test Case 2: Too short
        const shortResponse = await request.post(
            `${API_BASE}/api/v1/security/break-glass/validate-password`,
            {
                data: {
                    password: 'Short1!',
                },
            }
        );

        expect(shortResponse.status()).toBe(200);
        const shortBody = await shortResponse.json();
        expect(shortBody.valid).toBe(false);
        expect(shortBody.errors).toContain('Password must be at least 12 characters');

        // Test Case 3: Missing uppercase
        const noUpperResponse = await request.post(
            `${API_BASE}/api/v1/security/break-glass/validate-password`,
            {
                data: {
                    password: 'nouppercase123!',
                },
            }
        );

        expect(noUpperResponse.status()).toBe(200);
        const noUpperBody = await noUpperResponse.json();
        expect(noUpperBody.valid).toBe(false);
        expect(noUpperBody.errors).toContain('Password must contain at least one uppercase letter');

        // Test Case 4: Missing symbol
        const noSymbolResponse = await request.post(
            `${API_BASE}/api/v1/security/break-glass/validate-password`,
            {
                data: {
                    password: 'NoSymbols1234',
                },
            }
        );

        expect(noSymbolResponse.status()).toBe(200);
        const noSymbolBody = await noSymbolResponse.json();
        expect(noSymbolBody.valid).toBe(false);
        expect(noSymbolBody.errors).toContain(
            'Password must contain at least one special character'
        );
    });

    test('[P2] API should handle concurrent activation requests safely', async ({
        request,
    }) => {
        // WHEN: Sending multiple activation requests concurrently
        const requests = Array.from({ length: 3 }, (_, i) =>
            request.post(`${API_BASE}/api/v1/security/break-glass/activate`, {
                data: {
                    reason: `Concurrent request ${i + 1}`,
                    activated_by: `admin-${i + 1}`,
                },
            })
        );

        const responses = await Promise.all(requests);

        // THEN: All requests should succeed or return 409 Conflict
        responses.forEach((response) => {
            expect([200, 409]).toContain(response.status());
        });

        // AND: Only one activation should be recorded (first wins)
        const statusResponse = await request.get(
            `${API_BASE}/api/v1/security/break-glass/status`
        );
        const statusBody = await statusResponse.json();

        expect(statusBody.status).not.toBe('Disabled'); // Should be activated
        expect(statusBody.activation_info).toBeDefined();

        // Verify reason is from one of the requests (not corrupted)
        const reasons = ['Concurrent request 1', 'Concurrent request 2', 'Concurrent request 3'];
        expect(reasons).toContain(statusBody.activation_info.reason);
    });
});

test.describe('Break-Glass API - Error Handling', () => {
    test('[P1] should return 404 for non-existent endpoints', async ({ request }) => {
        const response = await request.get(
            `${API_BASE}/api/v1/security/break-glass/nonexistent`
        );

        expect(response.status()).toBe(404);
    });

    test('[P2] should handle malformed JSON gracefully', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/v1/security/break-glass/activate`, {
            data: 'invalid-json-string',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(response.status()).toBe(400);
    });
});
