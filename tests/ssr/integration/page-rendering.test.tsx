import Home from "@/app/page";
import SetupPage from "@/app/setup/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mocks
vi.mock("@/components/features/BootEnvironmentBadge", () => ({
  BootEnvironmentBadge: () => <div>Badge</div>,
}));
vi.mock("@/components/features/dashboard/status-dashboard", () => ({
  StatusDashboard: () => <div>Status</div>,
}));
vi.mock("@/components/features/setup/setup-wizard", () => ({
  SetupWizard: () => <div>Wizard</div>,
}));

describe("Page Rendering Integration", () => {
  it("Home page integrates components correctly", () => {
    const { container } = render(<Home />);
    expect(container).toBeDefined();
    expect(screen.getByText("Badge")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("Setup page integrates wizard correctly", () => {
    const { container } = render(<SetupPage />);
    expect(container).toBeDefined();
    expect(screen.getByText("Wizard")).toBeInTheDocument();
  });
});
