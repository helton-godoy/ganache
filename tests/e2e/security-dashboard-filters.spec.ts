/**
 * Security Dashboard - Filters Tests
 * 
 * Validates AC 6: Dashboard deve permitir filtrar por tipo de evento, usuário, IP ou período de tempo
 * 
 * @ref Story-5.4 AC 6
 */

import { expect, test } from '../support/fixtures/auth.fixture';

test.describe('Security Dashboard - Filters', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        // Navigate to security dashboard before each test
        await authenticatedPage.goto('/security');

        // Wait for initial data load
        await authenticatedPage.waitForSelector('[data-testid="security-event"]', {
            timeout: 10000,
            state: 'visible',
        });
    });

    test('[P0] should filter events by type (SSH, Config, Auth)', async ({ authenticatedPage }) => {
        // GIVEN: Dashboard is loaded with multiple event types
        const allEvents = authenticatedPage.locator('[data-testid="security-event"]');
        const initialCount = await allEvents.count();
        expect(initialCount).toBeGreaterThan(0);

        // WHEN: User selects SSH events filter
        await authenticatedPage.click('[data-testid="filter-event-type"]');
        await authenticatedPage.click('[data-testid="filter-option-ssh"]');

        // Wait for filter to apply
        await authenticatedPage.waitForTimeout(1000);

        // THEN: Only SSH events are displayed
        const filteredEvents = authenticatedPage.locator('[data-testid="security-event"]');
        const filteredCount = await filteredEvents.count();

        // Validate all visible events are SSH type
        for (let i = 0; i < Math.min(filteredCount, 5); i++) {
            const eventText = await filteredEvents.nth(i).textContent();
            expect(eventText?.toLowerCase()).toMatch(/ssh|sshcommand/i);
        }

        // Validate filter badge/indicator is shown
        await expect(authenticatedPage.locator('[data-testid="active-filter-ssh"]')).toBeVisible();
    });

    test('[P1] should filter events by user', async ({ authenticatedPage }) => {
        // GIVEN: Dashboard with events from multiple users
        const userFilter = authenticatedPage.locator('[data-testid="filter-user"]');
        await userFilter.click();

        // Get first available user from dropdown
        const firstUserOption = authenticatedPage.locator('[data-testid^="filter-user-option-"]').first();
        const userName = await firstUserOption.textContent();

        // WHEN: User selects specific user filter
        await firstUserOption.click();

        // Wait for filter to apply
        await authenticatedPage.waitForTimeout(1000);

        // THEN: Only events from selecteduser are displayed
        const filteredEvents = authenticatedPage.locator('[data-testid="security-event"]');
        const count = await filteredEvents.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
            const eventText = await filteredEvents.nth(i).textContent();
            expect(eventText).toContain(userName);
        }

        // Validate filter is active
        await expect(authenticatedPage.locator(`[data-testid="active-filter-user-${userName}"]`)).toBeVisible();
    });

    test('[P1] should filter events by IP address', async ({ authenticatedPage }) => {
        // GIVEN: Dashboard with events from multiple IPs
        const ipFilterInput = authenticatedPage.locator('[data-testid="filter-ip-input"]');

        // WHEN: User enters specific IP address
        const testIP = '192.168.1.100';
        await ipFilterInput.fill(testIP);
        await authenticatedPage.keyboard.press('Enter');

        // Wait for filter to apply
        await authenticatedPage.waitForTimeout(1000);

        // THEN: Only events from that IP are displayed
        const filteredEvents = authenticatedPage.locator('[data-testid="security-event"]');
        const count = await filteredEvents.count();

        // If no events match, that's valid (empty state)
        if (count > 0) {
            for (let i = 0; i < Math.min(count, 5); i++) {
                const eventText = await filteredEvents.nth(i).textContent();
                expect(eventText).toContain(testIP);
            }
        } else {
            // Validate empty state message
            await expect(authenticatedPage.locator('[data-testid="no-events-message"]')).toBeVisible();
        }
    });

    test('[P2] should filter events by time period (last hour, last 24h, custom)', async ({
        authenticatedPage,
    }) => {
        // GIVEN: Dashboard with events across different time periods
        const timeFilter = authenticatedPage.locator('[data-testid="filter-time-period"]');
        await timeFilter.click();

        // WHEN: User selects "Last Hour" filter
        await authenticatedPage.click('[data-testid="filter-time-last-hour"]');

        // Wait for filter to apply
        await authenticatedPage.waitForTimeout(1000);

        // THEN: Only events from last hour are displayed
        const filteredEvents = authenticatedPage.locator('[data-testid="security-event"]');
        const count = await filteredEvents.count();

        // Validate timestamps are within last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        for (let i = 0; i < Math.min(count, 3); i++) {
            const timestamp = await filteredEvents.nth(i).getAttribute('data-timestamp');
            if (timestamp) {
                const eventTime = new Date(timestamp);
                expect(eventTime.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
            }
        }

        // Validate filter indicator
        await expect(
            authenticatedPage.locator('[data-testid="active-filter-time-last-hour"]')
        ).toBeVisible();
    });

    test('[P1] should combine multiple filters (type + user)', async ({ authenticatedPage }) => {
        // GIVEN: Dashboard with mixed events
        // WHEN: User applies type filter (SSH)
        await authenticatedPage.click('[data-testid="filter-event-type"]');
        await authenticatedPage.click('[data-testid="filter-option-ssh"]');

        await authenticatedPage.waitForTimeout(500);

        // AND: User applies user filter
        await authenticatedPage.click('[data-testid="filter-user"]');
        const firstUser = authenticatedPage.locator('[data-testid^="filter-user-option-"]').first();
        const userName = await firstUser.textContent();
        await firstUser.click();

        await authenticatedPage.waitForTimeout(1000);

        // THEN: Events match BOTH filters
        const filteredEvents = authenticatedPage.locator('[data-testid="security-event"]');
        const count = await filteredEvents.count();

        for (let i = 0; i < Math.min(count, 3); i++) {
            const eventText = await filteredEvents.nth(i).textContent();
            expect(eventText?.toLowerCase()).toMatch(/ssh/i);
            expect(eventText).toContain(userName);
        }

        // Validate both filter badges are shown
        await expect(authenticatedPage.locator('[data-testid="active-filter-ssh"]')).toBeVisible();
        await expect(
            authenticatedPage.locator(`[data-testid="active-filter-user-${userName}"]`)
        ).toBeVisible();
    });

    test('[P2] should clear all filters with "Clear Filters" button', async ({
        authenticatedPage,
    }) => {
        // GIVEN: Multiple filters are applied
        await authenticatedPage.click('[data-testid="filter-event-type"]');
        await authenticatedPage.click('[data-testid="filter-option-ssh"]');

        await authenticatedPage.waitForTimeout(500);

        const filteredCount = await authenticatedPage
            .locator('[data-testid="security-event"]')
            .count();

        // WHEN: User clicks "Clear Filters"
        await authenticatedPage.click('[data-testid="clear-filters-button"]');

        await authenticatedPage.waitForTimeout(1000);

        // THEN: All events are displayed again (filter removed)
        const allEventsCount = await authenticatedPage
            .locator('[data-testid="security-event"]')
            .count();

        expect(allEventsCount).toBeGreaterThanOrEqual(filteredCount);

        // Filter badges should be hidden
        await expect(
            authenticatedPage.locator('[data-testid="active-filter-ssh"]')
        ).not.toBeVisible();
    });
});
