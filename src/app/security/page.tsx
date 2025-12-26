import { serverFetch } from "@/lib/api-server";
import { SecurityDashboard } from "../../components/features/security/SecurityDashboard";

/**
 * Security Monitoring Dashboard Page
 *
 * @ref Story-5.4 - Frontend route for security dashboard
 * @ref Story-6.4 - Converted to Server Component for SSR
 */
export default async function SecurityPage() {
  // Fetch initial data server-side
  const [eventsRes, metricsRes, alertsRes] = await Promise.all([
    serverFetch<any[]>("/api/v1/security/events?limit=50"),
    serverFetch<any>("/api/v1/security/metrics"),
    serverFetch<any[]>("/api/v1/security/alerts"),
  ]);

  // Sanitize data before passing to client (Defense in Depth)
  // Remove potential sensitive fields even if backend should already filter them
  const safeEvents = eventsRes?.map((event) => ({
    ...event,
    user:
      typeof event.user === "object"
        ? {
            ...event.user,
            password: undefined,
            token: undefined,
            secret: undefined,
            apiKey: undefined,
          }
        : event.user,
  }));

  return (
    <SecurityDashboard
      initialEvents={safeEvents || []}
      initialMetrics={metricsRes || undefined}
      initialAlerts={alertsRes || []}
    />
  );
}
