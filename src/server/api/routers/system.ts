import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Mock system state
let systemStatus = "CRITICAL";

export const systemRouter = createTRPCRouter({
    // Simulate promoting a node to active
    promoteNode: publicProcedure
        .input(z.object({ nodeId: z.string(), force: z.boolean().optional() }))
        .mutation(async ({ input }) => {
            // Simulate processing delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (input.nodeId === "node-failure") {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Node failed to promote: Hardware fault detected",
                });
            }

            systemStatus = "RECOVERING";

            return {
                success: true,
                message: `Node ${input.nodeId} promoted successfully. syncing...`,
                status: systemStatus,
            };
        }),

    // Get current system event log (mock)
    getSystemLogs: publicProcedure.query(async () => {
        return [
            { id: 1, timestamp: new Date().toISOString(), level: "CRITICAL", message: "Master node heartbeat lost" },
            { id: 2, timestamp: new Date(Date.now() - 5000).toISOString(), level: "WARN", message: "High latency on pool-01" },
            { id: 3, timestamp: new Date(Date.now() - 10000).toISOString(), level: "INFO", message: "Automatic failover initiated" },
        ];
    }),
});
