/**
 * Mock Data Fixtures for SSR ATDD Tests
 *
 * Purpose: Provide realistic test data for SSR scenarios
 * Used by: ssr-failure-detection.atdd.spec.ts, ssr-error-messages.atdd.spec.ts
 */

/**
 * Mock cluster status for dashboard tests
 */
export const mockClusterStatus = () => ({
  nodes: [
    {
      id: 1,
      name: "ganache-01",
      status: "primary",
      uptime: "15d 3h 42m",
      ip: "192.168.1.10",
      health: "healthy",
    },
    {
      id: 2,
      name: "ganache-02",
      status: "secondary",
      uptime: "15d 3h 40m",
      ip: "192.168.1.11",
      health: "healthy",
    },
  ],
  drbd: {
    status: "UpToDate",
    syncProgress: 100,
    connectionState: "Connected",
  },
  zfs: {
    pools: [
      {
        name: "tank",
        status: "ONLINE",
        usage: 45.3,
        capacity: "10TB",
        datasets: 25,
      },
    ],
  },
});

/**
 * Mock audit logs for security dashboard tests
 */
export const mockAuditLogs = (count = 50) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    user: `user${i % 5}@ganache.local`,
    action: ["CREATE", "UPDATE", "DELETE"][i % 3],
    resource: "dataset",
    details: {
      name: `dataset-${i}`,
      size: `${Math.floor(Math.random() * 1000)}GB`,
    },
    ip: `192.168.1.${100 + (i % 50)}`,
  }));

/**
 * Mock hardware detection for setup wizard
 */
export const mockHardwareDetection = () => ({
  controllers: [
    {
      type: "PERC 6/i",
      vendor: "Dell",
      mode: "RAID",
      passthrough: false,
      firmware: "6.3.1-0003",
    },
  ],
  ram: "32GB",
  cpu: {
    model: "Intel Xeon E5450",
    cores: 8,
    threads: 8,
  },
  disks: [
    { name: "/dev/sda", size: "2TB", type: "HDD", raid: "RAID10" },
    { name: "/dev/sdb", size: "2TB", type: "HDD", raid: "RAID10" },
    { name: "/dev/sdc", size: "2TB", type: "HDD", raid: "RAID10" },
    { name: "/dev/sdd", size: "2TB", type: "HDD", raid: "RAID10" },
  ],
  recommendation: "compatibility-mode",
  warnings: [],
});

/**
 * Mock setup wizard status
 */
export const mockSetupStatus = (step = 1) => ({
  setupCompleted: false,
  currentStep: step,
  totalSteps: 4,
  steps: [
    {
      id: 1,
      name: "Hardware Detection",
      status: step > 1 ? "completed" : "active",
    },
    {
      id: 2,
      name: "Network Configuration",
      status: step > 2 ? "completed" : step === 2 ? "active" : "pending",
    },
    {
      id: 3,
      name: "Storage Setup",
      status: step > 3 ? "completed" : step === 3 ? "active" : "pending",
    },
    {
      id: 4,
      name: "Cluster Initialization",
      status: step === 4 ? "active" : "pending",
    },
  ],
});

/**
 * Mock user session (authenticated)
 */
export const mockUserSession = () => ({
  user: {
    id: 1,
    email: "admin@ganache.local",
    name: "Admin User",
    role: "admin",
    permissions: ["cluster:manage", "storage:manage", "users:manage"],
  },
  session: {
    id: "session-12345",
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1h from now
  },
  // Note: Sensitive data should NEVER be in SSR HTML
  _sensitive: {
    sessionToken: "secret-token-12345",
    apiKey: "sk-live-abcdef123456",
  },
});

/**
 * Mock API error response
 */
export const mockAPIError = (message: string, code = 500) => ({
  error: "Internal Server Error",
  message,
  code,
  timestamp: new Date().toISOString(),
  // Stack traces should NOT be exposed in production
  _debug: {
    stack: "Error: ...(omitted in production)",
  },
});
