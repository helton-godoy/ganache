"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Activity, AlertTriangle, CheckCircle, Server } from "lucide-react";

export function StatusDashboard() {
    // Poll system status every 2 seconds
    const { data: status, isLoading } = api.zfs.getStatus.useQuery(undefined, {
        refetchInterval: 2000,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-xl" />
                ))}
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health Card */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center bg-muted",
                            status.health === "ONLINE" && "bg-emerald-100 text-emerald-600",
                            status.health !== "ONLINE" && "bg-destructive/10 text-destructive"
                        )}>
                            {status.health === "ONLINE" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <h3 className="font-bold text-foreground">System Health</h3>
                    </div>
                    <p className={cn(
                        "text-2xl font-mono font-bold",
                        status.health === "ONLINE" ? "text-emerald-600" : "text-destructive"
                    )}>
                        {status.health}
                    </p>
                </div>

                {/* Throughput Card */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-foreground">Throughput</h3>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {status.throughput} <span className="text-sm text-muted-foreground font-normal">MB/s</span>
                    </p>
                </div>

                {/* Latency Card */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Server className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-foreground">Latency</h3>
                    </div>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {status.latency} <span className="text-sm text-muted-foreground font-normal">ms</span>
                    </p>
                </div>
            </div>

            {/* Pools List */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold">Storage Pools</h3>
                </div>
                <div className="p-0">
                    {status.pools.map((pool) => (
                        <div key={pool.name} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    pool.status === "ONLINE" ? "bg-emerald-500" : "bg-destructive"
                                )} />
                                <span className="font-medium font-mono">{pool.name}</span>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <span className="text-muted-foreground">Used: <span className="text-foreground font-mono">{pool.used}</span></span>
                                <span className="text-muted-foreground">Free: <span className="text-foreground font-mono">{pool.free}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
