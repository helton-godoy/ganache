import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const zfsRouter = createTRPCRouter({
    getStatus: publicProcedure
        .query(() => {
            // Mock data for initial implementation
            return {
                health: "ONLINE" as const,
                throughput: 450, // MB/s
                latency: 2, // ms
                alerts: [] as string[],
                pools: [
                    { name: "tank", status: "ONLINE", used: "45%", free: "55%" }
                ]
            };
        }),
});
