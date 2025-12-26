import Home from "@/app/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Reuse mocks
vi.mock("@/components/features/BootEnvironmentBadge", () => ({
  BootEnvironmentBadge: () => <div>Badge</div>,
}));
vi.mock("@/components/features/dashboard/status-dashboard", () => ({
  StatusDashboard: () => <div>Status</div>,
}));

describe("SSR/CSR Interaction", () => {
  it("renders interactive elements enabled", () => {
    render(<Home />);
    const setupLink = screen.getByRole("link", { name: /Setup Journey/i });
    expect(setupLink).toHaveAttribute("href", "/setup");

    const clusterLink = screen.getByRole("link", {
      name: /Cluster Management/i,
    });
    expect(clusterLink).toHaveAttribute("href", "/cluster");
  });
});
