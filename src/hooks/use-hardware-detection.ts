import { fetchJson } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

// This shape matches the Rust 'HardwareInfo' struct
export interface HardwareInfo {
    has_raid: boolean;
    controller_name: string | null;
}

export function useHardwareDetection() {
    return useQuery<HardwareInfo, Error>({
        queryKey: ["system", "hardware"],
        queryFn: () => fetchJson<HardwareInfo>("/system/hardware"),
        // Don't retry indefinitely if backend is down in dev
        retry: 1,
        // Mock data for dev if backend not running (Optional fallback)
        initialData: process.env.NODE_ENV === 'development' ? undefined : undefined,
    });
}
