import { sudo } from '../lib/sudo';

// List of supported RAID Controller identifiers (substrings or regex)
// In a real app, this might be a more comprehensive list or config file.
const SUPPORTED_RAID_CONTROLLERS = [
    'MegaRAID',
    'PERC 6/i',
    'PERC H700',
    'PERC H710',
    'PERC H310',
    'LSI Logic / Symbios Logic',
    'RAID bus controller',
];

export interface HardwareInfo {
    hasRaid: boolean;
    controllerName: string | null;
}

export const HardwareDetectionService = {
    async detectRaidController(): Promise<HardwareInfo> {
        try {
            // Use lspci to list PCI devices.
            // -nn shows strict numeric IDs, but for now text matching "RAID" or specific models is sufficient.
            const output = await sudo.exec('lspci');

            // Check for presence of RAID controllers
            const lines = output.split('\n');

            for (const line of lines) {
                // Case insensitive check against supported list
                const lowerLine = line.toLowerCase();
                for (const controller of SUPPORTED_RAID_CONTROLLERS) {
                    if (lowerLine.includes(controller.toLowerCase())) {
                        // Found a match
                        // Extract a friendly name - typically the text after the address "00:00.0 Details..."
                        // Example: "03:00.0 RAID bus controller: LSI Logic / Symbios Logic MegaRAID SAS 1078 (rev 04)"
                        // We'll just return the full description after the PCI address for now.
                        const parts = line.split(': ');
                        const name = parts.length > 1 ? parts.slice(1).join(': ').trim() : line.trim();

                        return {
                            hasRaid: true,
                            controllerName: name
                        };
                    }
                }
            }

            return {
                hasRaid: false,
                controllerName: null,
            };
        } catch (error) {
            console.error('Failed to detect hardware:', error);
            // Fail safe: return false if detection fails, or maybe throw depending on requirements.
            // Story says "detect if I'm running on ANY RAID", implying if we can't detect, we assume NO (or maybe show error).
            // safely returning false for now.
            return {
                hasRaid: false,
                controllerName: null,
            };
        }
    },
};
