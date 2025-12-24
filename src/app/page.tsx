import { BootEnvironmentBadge } from '@/components/features/BootEnvironmentBadge';
import { StatusDashboard } from '@/components/features/dashboard/status-dashboard';
import { Button } from '@/components/ui/button';
import { serverFetch } from '@/lib/api-server';
import { AlertTriangle, Server, Settings } from "lucide-react";
import Link from 'next/link';

// @ref Story-6.4 - Converted to Server Component for SSR support
export default async function Home() {
  // Fetch initial data server-side for SSR
  const [resources, pools] = await Promise.all([
    serverFetch<{ data: any }>('/api/v1/system/resources'),
    serverFetch<{ data: any }>('/api/v1/storage/pools'),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ganache Dashboard</h1>
            <p className="text-slate-500">System Monitoring & Control</p>
          </div>
          <div className="flex gap-3 items-center">
            <BootEnvironmentBadge />
            <div className="w-px h-8 bg-slate-200 mx-1" /> {/* Separator */}
            <Link href="/setup">
              <Button className="gap-2">
                <Settings className="w-4 h-4" /> Setup Journey
              </Button>
            </Link>
            <Link href="/cluster">
              <Button size="lg" variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-white">
                <Server className="w-5 h-5 mr-2" />
                Cluster Management
              </Button>
            </Link>
            <Link href="/recovery">
              <Button variant="destructive" className="gap-2">
                <AlertTriangle className="w-4 h-4" /> Simulate Panic
              </Button>
            </Link>
          </div>
        </header>

        {/* Real-time Status Dashboard with SSR Data */}
        <StatusDashboard
          initialResources={resources || undefined}
          initialPools={pools || undefined}
        />

      </div>
    </div>
  )
}
