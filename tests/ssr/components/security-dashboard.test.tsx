import SecurityPage from "@/app/security/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../src/components/features/security/SecurityDashboard", () => ({
  SecurityDashboard: () => <div data-testid="security-dashboard">Security</div>,
}));

// Note: Ensure mock path matches import in component or mapping works.
// In page.tsx: import { SecurityDashboard } from '../../components/features/security/SecurityDashboard';
// Unit test import usually mocks by module name.
// We might need to mock '@/components/features/security/SecurityDashboard' if alias applies, or relative path.
// Vitest vi.mock works with the import string used in the source file OR exact absolute path.
// We'll try mocking the component by its potential alias or just use factory if possible.
// Wait, if source uses relative import, mock should use same string?
// Better: Mock both alias and relative if unsure, or rely on auto-mocking if set.
// For now, I'll mock the module as imported in test file if I imported it? No, I import Page, Page imports Dashboard.
// I will mock using the path that verifies against source or just rely on 'vi.mock'.

describe("Security Page", () => {
  it("renders security dashboard", () => {
    render(<SecurityPage />);
    expect(screen.getByTestId("security-dashboard")).toBeInTheDocument();
  });
});
