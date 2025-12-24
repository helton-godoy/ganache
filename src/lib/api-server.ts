import { headers } from 'next/headers';

/**
 * Server-side API helper
 * Used to fetch data from the local API during SSR/RSC execution.
 * 
 * @param path API endpoint path (e.g. '/api/v1/system/resources')
 * @returns Typed response data or null on error
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
    const headersList = await headers();

    // 1. Simulation of SSR Errors (for Test 6.4-INT-001)
    // Check both Env var (global) and Header (per-request)
    if (process.env.SIMULATE_SSR_ERROR === 'true' || headersList.get('x-simulate-error') === 'true') {
        throw new Error("Simulated SSR Error: Connection timeout");
    }

    // 2. Mock Data for SSR Tests (since we cannot intercept RSC fetches with Playwright)
    if (process.env.MOCK_SSR_DATA === 'true') {
        return getMockData(path) as T;
    }


    try {
        // In RSC, we can get request headers to propagate if needed (auth, etc)
        const cookie = headersList.get('cookie') || '';

        // Internal API calls go to localhost:3000
        const baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
        const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

        const res = await fetch(url, {
            headers: {
                'Cookie': cookie,
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0 // Default to no-store for dynamic data
            }
        });

        if (!res.ok) {
            console.error(`[ServerFetch] Failed to fetch ${path}: ${res.status} ${res.statusText}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error(`[ServerFetch] Error fetching ${path}:`, error);
        return null;
    }
}

function getMockData(path: string): any {
    if (path.includes('system/resources')) {
        return {
            data: {
                status: "HEALTHY",
                used_memory_bytes: 8589934592, // 8GB
                total_memory_bytes: 34359738368, // 32GB
                arc_target_bytes: 4294967296, // 4GB
            }
        };
    }
    if (path.includes('storage/pools')) {
        return {
            data: [
                {
                    name: "tank",
                    health: "ONLINE",
                    alloc: "500G",
                    size: "2T",
                    mountpoint: "/tank",
                    usage: 25
                }
            ]
        };
    }
    if (path.includes('security/events')) {
        return Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            timestamp: new Date().toISOString(),
            user: "user0@ganache.local", // Matches test 6.4-E2E-004
            action: "LOGIN",
            resource: "portal",
            event_type: "auth_failure",
            severity: "warning"
        }));
    }
    if (path.includes('security/metrics')) {
        return {
            events_per_minute: 5,
            active_users: ['user0@ganache.local'],
            suspicious_ips: ['192.168.1.100'],
            critical_alerts: 2,
            failed_logins_1h: 12,
            total_events_24h: 156
        };
    }
    if (path.includes('setup/status')) {
        // Matches test 6.4-E2E-003 expectations (Setup Shell)
        return { setupCompleted: false };
    }
    if (path.includes('storage/disks')) {
        return { data: [] };
    }
    return null;
}
