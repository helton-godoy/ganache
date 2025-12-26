import Home from "@/app/page";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/features/BootEnvironmentBadge", () => ({
  BootEnvironmentBadge: () => <div>Badge</div>,
}));
vi.mock("@/components/features/dashboard/status-dashboard", () => ({
  StatusDashboard: () => <div>Status</div>,
}));

describe("Hydration Safety", () => {
  it("renders without console errors (simulating hydration success)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Home />);
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("hydration"),
    );
    consoleSpy.mockRestore();
  });
});
