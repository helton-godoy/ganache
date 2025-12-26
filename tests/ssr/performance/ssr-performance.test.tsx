import { render } from "@testing-library/react";
import Home from "@/app/page";
import { describe, it, expect, vi } from "vitest";

// Mocks to isolate page performance from heavy children (we want to test the SSR shell performance primarily)
vi.mock("@/components/features/BootEnvironmentBadge", () => ({
  BootEnvironmentBadge: () => <div>Badge </div>,
}));
vi.mock("@/components/features/dashboard/status-dashboard", () => ({
  StatusDashboard: () => <div>Status </div>,
}));

describe("SSR Performance", () => {
  it("Home renders within budget (SIMULATED)", () => {
    const start = performance.now();
    render(<Home />);
    const end = performance.now();
    const duration = end - start;
    console.log(`Render time: ${duration}ms`);
    expect(duration).toBeLessThan(200);
  });
});
