import { fetchJson } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

export interface ClusterStatus {
    state: "configuring" | "syncing" | "ready" | "error";
    progress: number;
    message: string;
}

export interface ClusterConfig {
    mode: "compatibility" | "standard";
    node_id: number;
    peer_ip: string;
}

export function useClusterConfiguration() {
    return useMutation<ClusterStatus, Error, ClusterConfig>({
        mutationFn: (config) => fetchJson<ClusterStatus>("/cluster/configure", {
            method: "POST",
            body: JSON.stringify(config),
            headers: { "Content-Type": "application/json" }
        }),
    });
}
