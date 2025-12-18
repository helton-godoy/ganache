import { diskRouter } from "@/server/api/routers/disk";
import { zfsRouter } from "@/server/api/routers/zfs";
import { createCallerFactory, createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Import sub-routers here when created
// import { zfsRouter } from "./routers/zfs";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    disk: diskRouter,
    zfs: zfsRouter,
    // system: systemRouter, // REMOVED: Moved to Rust Core
    // Mock health check for now
    health: createTRPCRouter({
        check: publicProcedure.query(() => "ok"),
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
