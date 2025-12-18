import { useConfigureCluster } from "@/api/generated/default/default";
import type { ClusterStatus } from "@/api/generated/model";

export type { ClusterStatus };

export function useClusterConfiguration() {
    const mutation = useConfigureCluster();
    return mutation;
}
