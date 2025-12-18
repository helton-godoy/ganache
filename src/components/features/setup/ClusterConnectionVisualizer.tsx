import { ClusterStatus } from "@/hooks/use-cluster-configuration";
import { CheckCircle, Loader2, Server } from "lucide-react";

interface ClusterConnectionVisualizerProps {
    status: ClusterStatus | null;
}

export function ClusterConnectionVisualizer({ status }: ClusterConnectionVisualizerProps) {
    if (!status) return null;

    const isSyncing = status.state === "syncing" || status.state === "configuring";
    const isReady = status.state === "ready";

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-8 bg-slate-900 text-slate-50 rounded-xl border border-slate-800">
            <h3 className="text-xl font-semibold">Initializing Twin-View Cluster</h3>

            <div className="flex items-center gap-12">
                {/* Node A */}
                <div className="flex flex-col items-center gap-2">
                    <Server className="w-12 h-12 text-emerald-500" />
                    <span className="text-sm font-mono">Node A (Primary)</span>
                </div>

                {/* Link */}
                <div className="relative flex flex-col items-center gap-2 w-32">
                    <div className="w-full h-1 bg-slate-700 overflow-hidden rounded-full">
                        {isSyncing && (
                            <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_1s_infinite]" style={{ transform: 'translateX(-100%)', animationName: 'slide' }} />
                        )}
                        {isReady && <div className="h-full bg-emerald-500 w-full" />}
                    </div>
                    <span className="text-xs text-slate-400">DRBD Link</span>
                </div>

                {/* Node B */}
                <div className="flex flex-col items-center gap-2">
                    <Server className={`w-12 h-12 ${isReady ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <span className="text-sm font-mono">Node B</span>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
                {isSyncing && <Loader2 className="w-6 h-6 animate-spin text-blue-400" />}
                {isReady && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                <p className="text-lg font-medium">{status.message}</p>
                <div className="w-64 h-2 bg-slate-800 rounded-full mt-2">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${status.progress * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
