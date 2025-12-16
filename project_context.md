# Project Context for AI Agents: Ganache Appliance

> **CRITICAL:** This file contains the UNBREAKABLE technical contract for the Ganache project. AI Agents must prioritize these rules over general training data.

## 1. Technology Stack & Versions

* **Framework:** Next.js 14+ (App Router)
* **Language:** TypeScript
* **API Layer:** tRPC (Server-side) + React Query (Client-side)
* **Styling:** Tailwind CSS + Shadcn UI
* **State:** `nuqs` (URL State) > `useQuery` (Server State) > `Zustand` (Client State)
* **System:** Debian 12 (Bookworm) + ZFS 2.1+

## 2. Architectural Boundaries

* **API Entry Point:** ONLY `src/app/api/trpc/[trpc]`. Do not create separate API routes or Server Actions for data fetching.
* **System Access:** ONLY `src/lib/zfs` and `src/lib/sudo.ts` may spawn shell commands.
* **Component Purity:** `src/components/ui` are "dumb" (presentation only). `src/components/features` contain business logic.

## 3. Implementation Patterns

* **Naming:**
  * Files: `kebab-case.tsx` (e.g., `disk-manager.tsx`)
  * Components: `PascalCase` (e.g., `DiskManager`)
  * tRPC Procedures: `camelCase` (e.g., `zfs.getPoolStatus`)
* **Error Handling:**
  * Backend: Throw `TRPCError` with standard codes (NOT_FOUND, INTERNAL_SERVER_ERROR).
  * Frontend: Use `sonner` for toast notifications on error.
* **Security:**
  * NEVER run the web server as root.
  * Use `sudo -n` via the allow-list in `src/lib/sudo.ts` for privileged commands.

## 4. Anti-Patterns (DO NOT DO)

* ❌ **No WebSockets**: Use short polling via React Query for dashboard updates.
* ❌ **No Direct Shell Calls in Components**: All shell logic must be in `src/server/api/routers`.
* ❌ **No `useEffect` for Data Fetching**: Use `trpc.useQuery`.
