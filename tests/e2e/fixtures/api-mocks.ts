import { Page } from "@playwright/test";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const setupMockApi = async (page: Page) => {
  await page.route("**/api/v1/**", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        body: "",
      });
      return;
    }
    // Fallback for unhandled routes - allow passthrough to real backend (proxy)
    // console.log(`Unhandled request (passing through): ${route.request().method()} ${route.request().url()}`);
    await route.continue();
  });
};

export const mockSystemResources = async (page: Page) => {
  await page.route("**/api/v1/system/resources", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify({
        cpu_usage: 12.5,
        total_memory_bytes: 32000000000,
        used_memory_bytes: 8000000000,
        arc_target_bytes: 4000000000,
        status: "HEALTHY",
      }),
    });
    console.log("Mocked System Resources");
  });
};

export const mockPools = async (page: Page) => {
  await page.route("**/api/v1/storage/pools", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify([
        {
          name: "data-pool",
          status: "ONLINE",
          health: "ONLINE",
          size: "20T",
          alloc: "5T",
          free: "15T",
          frag: "0%",
          dedup: "1.00x",
          mountpoint: "/data-pool",
          quota: "19T",
        },
      ]),
    });
  });
};

export const mockDatasets = async (page: Page) => {
  // Initial Datasets
  let datasets = [
    {
      pool: "data-pool",
      name: "Marketing",
      mountpoint: "/data-pool/Marketing",
      used: "1.2G",
      available: "10T",
      compression: "lz4",
    },
  ];

  // Mock List
  await page.route("**/api/v1/storage/datasets?pool=*", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, headers: corsHeaders, body: "" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify(datasets),
    });
  });

  // Mock Create
  await page.route("**/api/v1/storage/datasets", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, headers: corsHeaders, body: "" });
      return;
    }
    if (route.request().method() === "POST") {
      const payload = await route.request().postDataJSON();
      const newDs = {
        pool: payload.pool_name,
        name: payload.name,
        mountpoint: `/${payload.pool_name}/${payload.name}`,
        used: "0B",
        available: "Unknown",
        compression: "lz4",
      };
      datasets.push(newDs);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: corsHeaders,
        body: JSON.stringify(newDs),
      });
    } else {
      await route.continue();
    }
  });

  // Mock Delete
  await page.route("**/api/v1/storage/datasets/delete", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, headers: corsHeaders, body: "" });
      return;
    }
    if (route.request().method() === "POST") {
      const payload = await route.request().postDataJSON();
      datasets = datasets.filter((d) => d.name !== payload.name);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: corsHeaders,
        body: JSON.stringify("OK"),
      });
    } else {
      await route.continue();
    }
  });
};

export const mockBootEnvironments = async (page: Page) => {
  await page.route("**/api/v1/system/boot-environments*", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 200, headers: corsHeaders, body: "" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: corsHeaders,
      body: JSON.stringify([
        {
          name: "default",
          active: "HEAD",
          mountpoint: "/",
          created: "2024-01-01T00:00:00",
        },
      ]),
    });
  });
};
