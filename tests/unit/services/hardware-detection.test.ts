import { beforeEach, describe, expect, it, vi } from "vitest";
import { sudo } from "../../../src/lib/sudo";
import { HardwareDetectionService } from "../../../src/services/hardware-detection.service";

// Mock the sudo library
vi.mock("../../../src/lib/sudo", () => ({
  sudo: {
    exec: vi.fn(),
  },
}));

describe("HardwareDetectionService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("detectRaidController", () => {
    it("should return true and controller name when a supported RAID controller is detected", async () => {
      // Mock lspci output for PERC 6/i
      const mockLspciOutput = `
03:00.0 RAID bus controller: LSI Logic / Symbios Logic MegaRAID SAS 1078 (rev 04)
      `;

      // We need to decide how the service calls sudo.exec.
      // Assuming it runs 'lspci -nn' or just 'lspci'
      vi.mocked(sudo.exec).mockResolvedValue(mockLspciOutput);

      const result = await HardwareDetectionService.detectRaidController();

      expect(result.hasRaid).toBe(true);
      expect(result.controllerName).toContain("MegaRAID");
    });

    it("should return false when no supported RAID controller is detected", async () => {
      // Mock lspci output for a standard SATA controller
      const mockLspciOutput = `
00:1f.2 SATA controller: Intel Corporation 82801IR (ICH9R) SATA Controller [RAID mode] (rev 02)
      `;
      // Note: Even if it says [RAID mode] for Intel, we might only target specific hardware RAID cards
      // defined in our "supported" list (like PERC/LSI) as per the story requirements/examples.
      // For this test, let's assume Intel Onboard isn't the target "Hardware RAID" we recommend compatibility mode for,
      // OR we adjust requirements. The story mentions "PERC 6/i, H700".

      vi.mocked(sudo.exec).mockResolvedValue(mockLspciOutput);

      const result = await HardwareDetectionService.detectRaidController();

      expect(result.hasRaid).toBe(false);
      expect(result.controllerName).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(sudo.exec).mockRejectedValue(new Error("Command failed"));

      const result = await HardwareDetectionService.detectRaidController();

      expect(result.hasRaid).toBe(false);
      expect(result.controllerName).toBeNull();
    });
  });
});
