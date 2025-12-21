/**
 * E2E Tests for ACL Endpoints
 * 
 * @ref Story-4.2 - ACL API endpoints E2E validation
 */

import { expect, test } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3005';

test.describe('ACL API Endpoints', () => {
    test.describe('GET /api/v1/acl/principals - Search AD Principals', () => {
        test('should return mock principals in dev mode', async ({ request }) => {
            const response = await request.get(`${API_BASE}/api/v1/acl/principals`);

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            expect(data).toHaveProperty('principals');
            expect(data).toHaveProperty('page');
            expect(data).toHaveProperty('page_size');
            expect(data).toHaveProperty('total_count');
            expect(data).toHaveProperty('has_more');

            expect(Array.isArray(data.principals)).toBeTruthy();
            expect(data.principals.length).toBeGreaterThan(0);
        });

        test('should filter by principal type', async ({ request }) => {
            const response = await request.get(
                `${API_BASE}/api/v1/acl/principals?principal_type=group`
            );

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            // All results should be groups
            data.principals.forEach((principal: any) => {
                expect(principal.principal_type).toBe('group');
            });
        });

        test('should filter by query string', async ({ request }) => {
            const response = await request.get(
                `${API_BASE}/api/v1/acl/principals?query=Finance`
            );

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            // Should find Finance-Group
            expect(data.principals.length).toBeGreaterThan(0);
            expect(data.principals[0].name).toContain('Finance');
        });

        test('should support pagination', async ({ request }) => {
            const response = await request.get(
                `${API_BASE}/api/v1/acl/principals?page=0&page_size=2`
            );

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            expect(data.principals.length).toBeLessThanOrEqual(2);
            expect(data.page).toBe(0);
            expect(data.page_size).toBe(2);
        });
    });

    test.describe('GET /api/v1/acl/:path - Get ACL', () => {
        test('should return ACL for path in dev mode', async ({ request }) => {
            const testPath = encodeURIComponent('/test/path');
            const response = await request.get(`${API_BASE}/api/v1/acl/${testPath}`);

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            expect(data).toHaveProperty('acl');
            expect(data.acl).toHaveProperty('path');
            expect(data.acl).toHaveProperty('aces');
            expect(Array.isArray(data.acl.aces)).toBeTruthy();
            expect(data.acl.aces.length).toBeGreaterThan(0);

            // Verify ACE structure
            const ace = data.acl.aces[0];
            expect(ace).toHaveProperty('principal');
            expect(ace).toHaveProperty('permissions');
            expect(ace).toHaveProperty('inherit_flags');
            expect(ace).toHaveProperty('ace_type');
        });

        test('should support format parameter', async ({ request }) => {
            const testPath = encodeURIComponent('/test/path');
            const response = await request.get(
                `${API_BASE}/api/v1/acl/${testPath}?format=compact`
            );

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.acl).toBeDefined();
        });
    });

    test.describe('POST /api/v1/acl/:path - Set ACL', () => {
        test('should set ACL with valid data in dev mode', async ({ request }) => {
            const testPath = encodeURIComponent('/test/new/path');

            const aclData = {
                path: '/test/new/path',
                aces: [
                    {
                        principal: 'owner',
                        permissions: {
                            read_data: true,
                            write_data: true,
                            execute: true,
                            delete: false,
                            delete_child: false,
                            read_acl: true,
                            write_acl: false,
                            read_attributes: true,
                            write_attributes: false,
                            read_named_attrs: false,
                            write_named_attrs: false,
                            write_owner: false,
                            synchronize: false,
                        },
                        inherit_flags: {
                            file_inherit: false,
                            dir_inherit: false,
                            inherit_only: false,
                            no_propagate: false,
                            successful_access: false,
                            failed_access: false,
                            inherited: false,
                        },
                        ace_type: 'allow',
                    },
                ],
            };

            const response = await request.post(`${API_BASE}/api/v1/acl/${testPath}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-User': 'test-user',
                },
                data: aclData,
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data.success).toBe(true);
            expect(data).toHaveProperty('message');
            expect(data.message).toContain('DEV MODE');
        });

        test('should reject ACL without owner@', async ({ request }) => {
            const testPath = encodeURIComponent('/test/invalid/path');

            const invalidAcl = {
                path: '/test/invalid/path',
                aces: [
                    {
                        principal: 'everyone',
                        permissions: {
                            read_data: true,
                            write_data: false,
                            execute: false,
                            delete: false,
                            delete_child: false,
                            read_acl: false,
                            write_acl: false,
                            read_attributes: false,
                            write_attributes: false,
                            read_named_attrs: false,
                            write_named_attrs: false,
                            write_owner: false,
                            synchronize: false,
                        },
                        inherit_flags: {
                            file_inherit: false,
                            dir_inherit: false,
                            inherit_only: false,
                            no_propagate: false,
                            successful_access: false,
                            failed_access: false,
                            inherited: false,
                        },
                        ace_type: 'allow',
                    },
                ],
            };

            const response = await request.post(`${API_BASE}/api/v1/acl/${testPath}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-User': 'test-user',
                },
                data: invalidAcl,
            });

            expect(response.status()).toBe(400);
            const error = await response.text();
            expect(error).toContain('owner@');
        });

        test('should reject empty ACL', async ({ request }) => {
            const testPath = encodeURIComponent('/test/empty/path');

            const emptyAcl = {
                path: '/test/empty/path',
                aces: [],
            };

            const response = await request.post(`${API_BASE}/api/v1/acl/${testPath}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-User': 'test-user',
                },
                data: emptyAcl,
            });

            expect(response.status()).toBe(400);
            const error = await response.text();
            expect(error).toContain('at least one ACE');
        });
    });

    test.describe('ACL Workflow Integration', () => {
        test('should complete full ACL workflow: search, get, set', async ({ request }) => {
            // 1. Search for principals
            const searchResponse = await request.get(
                `${API_BASE}/api/v1/acl/principals?query=Finance&principal_type=group`
            );
            expect(searchResponse.ok()).toBeTruthy();
            const searchData = await searchResponse.json();
            expect(searchData.principals.length).toBeGreaterThan(0);

            // 2. Get existing ACL
            const testPath = encodeURIComponent('/test/workflow');
            const getResponse = await request.get(`${API_BASE}/api/v1/acl/${testPath}`);
            expect(getResponse.ok()).toBeTruthy();
            const getDataset = await getResponse.json();
            expect(getDataset.acl.aces).toBeDefined();

            // 3. Set new ACL
            const newAcl = {
                path: '/test/workflow',
                aces: [
                    {
                        principal: 'owner',
                        permissions: {
                            read_data: true,
                            write_data: true,
                            execute: true,
                            delete: true,
                            delete_child: true,
                            read_acl: true,
                            write_acl: true,
                            read_attributes: true,
                            write_attributes: true,
                            read_named_attrs: false,
                            write_named_attrs: false,
                            write_owner: true,
                            synchronize: true,
                        },
                        inherit_flags: {
                            file_inherit: false,
                            dir_inherit: false,
                            inherit_only: false,
                            no_propagate: false,
                            successful_access: false,
                            failed_access: false,
                            inherited: false,
                        },
                        ace_type: 'allow',
                    },
                ],
            };

            const setResponse = await request.post(`${API_BASE}/api/v1/acl/${testPath}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-User': 'admin',
                },
                data: newAcl,
            });

            expect(setResponse.ok()).toBeTruthy();
            const setData = await setResponse.json();
            expect(setData.success).toBe(true);
        });
    });
});
