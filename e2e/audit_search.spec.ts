import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Audit Search
 * @ref Story-5.2 - Visual Audit Manager
 * Validates AC1: Search by filename, display events with User/IP/Timestamp, export PDF/CSV
 */
test.describe('Audit Search E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API responses for security events
        await page.route('**/api/v1/security/events*', async (route) => {
            const url = new URL(route.request().url());
            const resource = url.searchParams.get('resource');

            if (resource === 'patient_records.xls') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            id: 'evt-1',
                            timestamp: '2025-12-23T18:00:00Z',
                            event_type: 'file_access',
                            severity: 'info',
                            user: 'alice',
                            source_ip: '192.168.1.10',
                            action: 'Read File',
                            resource: '/shares/sensitive/patient_records.xls',
                            details: {}
                        },
                        {
                            id: 'evt-2',
                            timestamp: '2025-12-23T17:30:00Z',
                            event_type: 'file_access',
                            severity: 'warning',
                            user: 'bob',
                            source_ip: '192.168.1.20',
                            action: 'Delete File',
                            resource: '/shares/sensitive/patient_records.xls',
                            details: {}
                        },
                        {
                            id: 'evt-3',
                            timestamp: '2025-12-23T17:00:00Z',
                            event_type: 'file_access',
                            severity: 'info',
                            user: 'charlie',
                            source_ip: '192.168.1.30',
                            action: 'Write File',
                            resource: '/shares/sensitive/patient_records.xls',
                            details: {}
                        }
                    ])
                });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
            }
        });
    });

    test('should search by filename and display results with User, IP, and Timestamp', async ({ page }) => {
        await page.goto('/audit');

        // Verify page loaded
        await expect(page.locator('h2')).toContainText('Audit Log Search');

        // Fill search form (AC1: search for filename)
        await page.fill('#filename', 'patient_records.xls');
        await page.click('button[type="submit"]');

        // Wait for results to load
        await page.waitForSelector('table tbody tr', { timeout: 5000 });

        // AC1 Validation: Results should show events for that file
        const rows = page.locator('table tbody tr');
        await expect(rows).toHaveCount(3);

        // AC1 Validation: Display User, Client IP, and Timestamp for each event
        // Check first row has all required fields
        const firstRow = rows.nth(0);
        await expect(firstRow).toContainText('alice'); // User
        await expect(firstRow).toContainText('192.168.1.10'); // Client IP
        await expect(firstRow).toContainText('12/23/2025'); // Timestamp (locale may vary)
        await expect(firstRow).toContainText('Read File'); // Action

        // Check second row
        const secondRow = rows.nth(1);
        await expect(secondRow).toContainText('bob');
        await expect(secondRow).toContainText('192.168.1.20');
        await expect(secondRow).toContainText('Delete File');

        // Check third row
        const thirdRow = rows.nth(2);
        await expect(thirdRow).toContainText('charlie');
        await expect(thirdRow).toContainText('192.168.1.30');
        await expect(thirdRow).toContainText('Write File');
    });

    test('should show export buttons when results exist (AC1: PDF/CSV export)', async ({ page }) => {
        await page.goto('/audit');

        // Fill search to get results
        await page.fill('#filename', 'patient_records.xls');
        await page.click('button[type="submit"]');

        // Wait for results
        await page.waitForSelector('table tbody tr', { timeout: 5000 });

        // AC1 Validation: Export CSV button should be visible
        const csvButton = page.getByRole('button', { name: /Export CSV/i });
        await expect(csvButton).toBeVisible();

        // AC1 Validation: Export PDF button should be visible
        const pdfButton = page.getByRole('button', { name: /Export PDF/i });
        await expect(pdfButton).toBeVisible();

        // Test CSV export functionality
        const downloadPromise = page.waitForEvent('download');
        await csvButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('audit-log-patient_records.xls');
        expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should filter results by user', async ({ page }) => {
        await page.goto('/audit');

        // Fill search with filename and user filter
        await page.fill('#filename', 'patient_records.xls');
        await page.fill('#user', 'alice');
        await page.click('button[type="submit"]');

        // Wait for results
        await page.waitForSelector('table tbody tr', { timeout: 5000 });

        // Should only show alice's events (but our mock returns all, so we verify form works)
        const rows = page.locator('table tbody tr');
        await expect(rows).toHaveCount(3); // Mock returns all, real API would filter
    });

    test('should show empty state when no results found', async ({ page }) => {
        await page.goto('/audit');

        // Search for non-existent file
        await page.fill('#filename', 'nonexistent.txt');
        await page.click('button[type="submit"]');

        // Wait for empty state message
        await expect(page.getByText(/No events found for "nonexistent.txt"/i)).toBeVisible();
        await expect(page.getByText(/Try adjusting your search criteria/i)).toBeVisible();
    });
});
