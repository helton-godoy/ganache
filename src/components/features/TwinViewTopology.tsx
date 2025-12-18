"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, RefreshCw, Server, ShieldCheck } from "lucide-react";

interface TwinViewTopologyProps {
    primaryNodeName?: string;
    secondaryNodeName?: string;
    state: string; // "offline" | "configuring" | "syncing" | "ready"
    progress?: number;
}

export function TwinViewTopology({
    primaryNodeName = "Node 1 (Local)",
    secondaryNodeName = "Node 2 (Peer)",
    state,
    progress = 0,
}: TwinViewTopologyProps) {
    const isSyncing = state === "syncing";
    const isReady = state === "ready";
    const isConfiguring = state === "configuring";

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-12">
            <div className="flex items-center justify-between w-full max-w-2xl relative">
                {/* Connection Line / Ring */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-muted overflow-hidden">
                    {(isSyncing || isConfiguring) && (
                        <div
                            className="h-full bg-emerald-500 animate-pulse transition-all duration-500"
                            style={{ width: `${progress * 100}%` }}
                        />
                    )}
                    {isReady && <div className="h-full w-full bg-emerald-500" />}
                </div>

                {/* Node 1 */}
                <Card className={cn(
                    "z-10 p-6 flex flex-col items-center space-y-4 border-2 transition-all duration-500",
                    isReady ? "border-emerald-500 shadow-emerald-500/20 shadow-lg" : "border-muted"
                )}>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                        <Server className={cn("w-10 h-10", isReady ? "text-emerald-500" : "text-slate-400")} />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg">{primaryNodeName}</p>
                        <Badge variant={isReady ? "default" : "secondary"}>Primary</Badge>
                    </div>
                </Card>

                {/* Sync Center */}
                <div className="z-20 bg-background border-2 p-3 rounded-full shadow-md animate-in fade-in zoom-in">
                    {isSyncing ? (
                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    ) : isReady ? (
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    ) : (
                        <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
                    )}
                </div>

                {/* Node 2 */}
                <Card className={cn(
                    "z-10 p-6 flex flex-col items-center space-y-4 border-2 transition-all duration-500",
                    isReady ? "border-emerald-500 shadow-emerald-500/20 shadow-lg" : "border-muted"
                )}>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                        <Server className={cn("w-10 h-10", isReady ? "text-emerald-500" : "text-slate-400")} />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg">{secondaryNodeName}</p>
                        <Badge variant="secondary">Secondary</Badge>
                    </div>
                </Card>
            </div>

            {/* Connection Info */}
            <div className="text-center space-y-2 max-w-md w-full">
                {isSyncing && (
                    <>
                        <p className="text-sm font-medium animate-pulse">Synchronizing Block Device...</p>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">{Math.round(progress * 100)}% Complete</p>
                    </>
                )}
                {isReady && <p className="text-emerald-500 font-bold flex items-center justify-center gap-2"><ShieldCheck className="w-5 h-5" /> HA LINK ACTIVE</p>}
                {isConfiguring && <p className="text-muted-foreground italic">Verifying Peer Connectivity...</p>}
            </div>
        </div>
    );
}
