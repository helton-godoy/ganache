import { useGetHardwareInfo } from "@/api/generated/default/default";

export function useHardwareDetection() {
    return useGetHardwareInfo({
        axios: {
            // Se necessário adicionar configurações globais aqui
        }
    });
}
