"use client";

import {
  getGetSystemLogsQueryKey,
  useGetSystemLogs,
  usePromoteNode,
} from "@/api/generated/default/default";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Power,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function RecoveryConsole() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: axiosLogs } = useGetSystemLogs();
  const logs = axiosLogs?.data;

  const promoteMutation = usePromoteNode({
    mutation: {
      onSuccess: (axiosRes) => {
        toast.success(axiosRes.data);
        void queryClient.invalidateQueries({
          queryKey: getGetSystemLogsQueryKey(),
        });
      },
      onError: (err: any) => {
        toast.error("Promotion Failed", {
          description: err.response?.data?.message || err.message,
        });
      },
    },
  });

  const handlePromote = (nodeId: string) => {
    toast.promise(promoteMutation.mutateAsync(), {
      loading: "Promoting node...",
      success: "Node promoted successfully",
      error: "Failed to promote node",
    });
  };

  const handleRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetSystemLogsQueryKey(),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: System Status & Controls */}
      <div className="space-y-6">
        <div className="bg-destructive/10 border-destructive border p-6 rounded-xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive rounded-full text-destructive-foreground">
              <ServerCrash className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-destructive">
                System Panic: CRITICAL
              </h2>
              <p className="text-destructive/80 font-medium">
                Master node unreachable. Split-brain detected.
              </p>
              <p className="text-sm text-destructive/70 mt-2 font-mono bg-destructive/5 inline-block px-2 py-1 rounded">
                ⚠️ Automatic Failover DISABLED. Manual intervention required.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Recovery Options
          </h3>
          <div className="space-y-4">
            <div
              className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => setSelectedNode("node-02")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Node-02 (Standby)</span>
                <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  Healthy
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Last synced: 2s ago. Ready for promotion.
              </p>
              <Button
                disabled={promoteMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromote("node-02");
                }}
                className="w-full gap-2"
                variant={selectedNode === "node-02" ? "default" : "secondary"}
              >
                <Power className="w-4 h-4" /> Promote to Master
              </Button>
            </div>

            <div
              className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => setSelectedNode("node-03")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Node-03 (Witness)</span>
                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  Degraded
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                High latency detected. Promotion not recommended.
              </p>
              <Button
                disabled={promoteMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromote("node-03");
                }}
                className="w-full gap-2"
                variant="secondary"
              >
                <AlertTriangle className="w-4 h-4" /> Force Promotion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Event Log */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <ActivityLogIcon /> Live Event Log
          </h3>
          <Button size="sm" variant="ghost" onClick={handleRefresh}>
            <RefreshCw className={cn("w-4 h-4", logs ? "" : "animate-spin")} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="p-4 border-b last:border-0 hover:bg-muted/5"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded",
                    log.level === "CRITICAL" &&
                      "bg-destructive text-destructive-foreground",
                    log.level === "WARN" && "bg-yellow-100 text-yellow-800",
                    log.level === "INFO" && "bg-blue-100 text-blue-800",
                  )}
                >
                  {log.level}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {log.timestamp}
                </span>
              </div>
              <p className="text-sm font-medium">{log.message}</p>
            </div>
          ))}
          {!logs && (
            <div className="p-8 text-center text-muted-foreground">
              Loading logs...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityLogIcon() {
  return (
    <svg
      className="w-5 h-5 text-muted-foreground"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
