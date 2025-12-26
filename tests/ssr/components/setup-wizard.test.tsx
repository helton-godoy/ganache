import SetupPage from "@/app/setup/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/features/setup/setup-wizard", () => ({
  SetupWizard: () => <div data-testid="setup-wizard">Wizard</div>,
}));

describe("Setup Page", () => {
  it("renders the header and wizard", () => {
    render(<SetupPage />);
    expect(
      screen.getByRole("heading", { name: /Twin-View Cluster Setup/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("setup-wizard")).toBeInTheDocument();
  });
});
