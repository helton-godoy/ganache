import { SetupWizard } from "@/components/features/setup/setup-wizard";
import { serverFetch } from "@/lib/api-server";

// @ref Story-6.4 - Converted to Server Component for SSR
export default async function SetupPage() {
  // Fetch initial data server-side
  const [setupStatus, disks] = await Promise.all([
    serverFetch<any>("/api/v1/setup/status"),
    serverFetch<any>("/api/v1/storage/disks"),
  ]);

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Twin-View Cluster Setup</h1>
      <p className="text-muted-foreground mb-8">
        Drag and drop disks to configure your initial storage pool.
      </p>
      <SetupWizard
        initialSetupStatus={setupStatus || undefined}
        initialDisks={disks || undefined}
      />
    </main>
  );
}
