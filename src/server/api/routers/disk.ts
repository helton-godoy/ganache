import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const diskRouter = createTRPCRouter({
    list: publicProcedure
        .query(() => {
            return [
                // Node A Disks
                { id: "d1", serial: "SAMSUNG-MZ7L3", size: "1.92TB", status: "available", nodeId: "node-a" },
                { id: "d2", serial: "SAMSUNG-MZ7L3", size: "1.92TB", status: "available", nodeId: "node-a" },
                { id: "d3", serial: "INTEL-SSD-S45", size: "960GB", status: "available", nodeId: "node-a" },
                { id: "d4", serial: "INTEL-SSD-S45", size: "960GB", status: "available", nodeId: "node-a" },

                // Node B Disks (Different set, simulating separate physical hardware)
                { id: "d5", serial: "MICRON-5300", size: "1.92TB", status: "available", nodeId: "node-b" },
                { id: "d6", serial: "MICRON-5300", size: "1.92TB", status: "available", nodeId: "node-b" },
                { id: "d7", serial: "KINGSTON-DC500", size: "960GB", status: "available", nodeId: "node-b" },
                { id: "d8", serial: "KINGSTON-DC500", size: "960GB", status: "available", nodeId: "node-b" },
            ] as const;
        }),
});
