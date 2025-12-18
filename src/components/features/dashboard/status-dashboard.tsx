"use client";

import {
  useGetPools,
  useGetSystemResources,
} from "@/api/generated/default/default";
import type { PoolInfo } from "@/api/generated/model";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, CheckCircle, Database, Server, ShieldCheck } from "lucide-react";
import { DatasetManager } from "../storage/DatasetManager";

export function StatusDashboard() {
  // Poll system resources every 2 seconds via OpenAPI Client
  const { data: axiosResponse, isLoading: isResourcesLoading } =
    useGetSystemResources({
      query: {
        refetchInterval: 2000,
      },
    });

  const { data: poolsResponse, isLoading: isPoolsLoading } = useGetPools({
    query: {
      refetchInterval: 5000,
    },
  });

  const isLoading = isResourcesLoading || isPoolsLoading;

  const status = axiosResponse?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
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
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center bg-muted",
                status.status === "HEALTHY" &&
                "bg-emerald-100 text-emerald-600",
                status.status !== "HEALTHY" &&
                "bg-destructive/10 text-destructive",
              )}
            >
              {status.status === "HEALTHY" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h3 className="font-bold text-foreground">System Health</h3>
          </div>
          <p
            className={cn(
              "text-2xl font-mono font-bold",
              status.status === "HEALTHY"
                ? "text-emerald-600"
                : "text-destructive",
            )}
          >
            {status.status}
          </p>
        </div>

        {/* Memory Usage Card */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-foreground">Memory Usage</h3>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">
            {(Number(status.used_memory_bytes) / 1024 ** 3).toFixed(1)} /{" "}
            {(Number(status.total_memory_bytes) / 1024 ** 3).toFixed(1)}{" "}
            <span className="text-sm text-muted-foreground font-normal">
              GB
            </span>
          </p>
        </div>

        {/* ARC Target Card */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-foreground">ARC Target</h3>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">
            {(Number(status.arc_target_bytes) / 1024 ** 3).toFixed(1)}{" "}
            <span className="text-sm text-muted-foreground font-normal">
              GB
            </span>
          </p>
        </div>
      </div>

      {/* Storage Pools Section */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold">Storage Pools</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {poolsResponse?.data.map((pool: PoolInfo) => {
            const parseZFSSize = (sizeStr: string): number => {
              const units: Record<string, number> = {
                P: 1125899906842624,
                T: 1099511627776,
                G: 1073741824,
                M: 1048576,
                K: 1024,
                B: 1,
              };

              const match = sizeStr.match(/^([\d.]+)\s*([PTGMK]?B?|[PTGMK])$/i);
              if (!match) return parseFloat(sizeStr) || 0;

              const value = parseFloat(match[1]);
              const unit = (match[2] || "B").toUpperCase()[0];

              return value * (units[unit] || 1);
            };

            const allocBytes = parseZFSSize(pool.alloc);
            const limitBytes = pool.quota
              ? parseZFSSize(pool.quota)
              : parseZFSSize(pool.size);

            const usagePercent = Math.min((allocBytes / limitBytes) * 100, 100);
            const isQuotaReached = pool.quota && usagePercent >= 99.9;

            return (
              <div
                key={pool.name}
                className={cn(
                  "space-y-2 border p-4 rounded-lg transition-colors",
                  isQuotaReached
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border",
                )}
              >
                {isQuotaReached && (
                  <div className="flex items-center gap-2 text-destructive font-bold text-xs mb-3 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    ALERTA CRÍTICO: LIMITE DE QUOTA (90%) ATINGIDO NESTE POOL
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{pool.name}</span>
                    {pool.quota && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap",
                          isQuotaReached
                            ? "bg-destructive text-destructive-foreground border-destructive"
                            : "bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border-blue-100",
                        )}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        90% HARD QUOTA ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {pool.alloc} /{" "}
                      <span className="text-slate-900 font-bold">
                        {pool.quota || pool.size}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {pool.quota
                        ? "Capacidade Útil (Limite 90%)"
                        : "Total do Pool"}
                    </div>
                  </div>
                </div>
                <Progress
                  value={usagePercent}
                  className={cn(
                    "h-2",
                    isQuotaReached ? "bg-destructive/20" : "bg-slate-100",
                  )}
                  indicatorClassName={cn(
                    isQuotaReached
                      ? "bg-destructive"
                      : usagePercent > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                />
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase pt-1">
                  <span>
                    Saúde:{" "}
                    <span
                      className={cn(
                        pool.health === "ONLINE"
                          ? "text-emerald-600"
                          : "text-destructive",
                      )}
                    >
                      {pool.health}
                    </span>
                  </span>
                  <span>Ponto de Montagem: {pool.mountpoint}</span>
                </div>

                <Accordion type="single" collapsible className="mt-4 border-t pt-2">
                  <AccordionItem value="datasets" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm text-slate-600 hover:text-slate-900">
                      Manage Datasets & Shares
                    </AccordionTrigger>
                    <AccordionContent>
                      <DatasetManager poolName={pool.name} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
          {poolsResponse?.data.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum pool de storage detectado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
