"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useClusterConfiguration } from "@/hooks/use-cluster-configuration";
import { ArrowRight, Database, HardDrive, Layers, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ClusterConnectionVisualizer } from "./ClusterConnectionVisualizer";

interface WizardCompatibilityStepProps {
    onNext: () => void;
    onBack: () => void;
}

export function WizardCompatibilityStep({ onNext, onBack }: WizardCompatibilityStepProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutate: configure, data: status, isPending } = useClusterConfiguration();

    const handleConfirm = () => {
        configure({
            mode: "compatibility",
            node_id: 1,
            // TODO: [Story 1.1 Follow-up] Replace hardcoded peer IP with dynamic discovery from HardwareService
            peer_ip: "192.168.1.20" // Hardcoded for MVP/Mock
        }, {
            onSuccess: () => {
                // Wait for animation or directly proceed?
                // For now, let the visualizer show "Ready" then user clicks next or auto-next.
                // Simulating auto-next after a delay for the MVP if needed, 
                // but let's just let the visualizer handle the "Ready" state UI.
                setTimeout(onNext, 2000); // Auto-advance after 2s of "Ready" (mocked via hook success effectively)
            }
        });
    };

    if (isPending || status) {
        return <ClusterConnectionVisualizer status={status || { state: "configuring", progress: 0, message: "Starting..." }} />;
    }

    // Visual representation of the "Cake"
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    Compatibility Mode Architecture
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Understanding how Ganache ensures reliability on top of your existing hardware RAID.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-8">
                {/* Visual Stack Diagram */}
                <div className="relative w-full max-w-sm space-y-2 p-6 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">

                    {/* Layer 3: ZFS */}
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <div className="p-4 bg-emerald-100 border-2 border-emerald-500 rounded-lg text-emerald-900 font-bold text-center shadow-sm cursor-help hover:bg-emerald-200 transition-colors">
                                    <div className="flex items-center justify-center gap-2">
                                        <Database className="w-5 h-5" />
                                        ZFS Filesystem
                                    </div>
                                    <div className="text-xs font-normal opacity-80 mt-1">Data Integrity & Snapshots</div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">ZFS handles data checksums, compression, and snapshots. It thinks it is writing to a whole disk, but is actually writing to the replication layer.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Arrow */}
                    <div className="flex justify-center text-slate-300">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>

                    {/* Layer 2: DRBD */}
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <div className="p-4 bg-blue-100 border-2 border-blue-500 rounded-lg text-blue-900 font-bold text-center shadow-sm cursor-help hover:bg-blue-200 transition-colors">
                                    <div className="flex items-center justify-center gap-2">
                                        <Layers className="w-5 h-5" />
                                        DRBD Replication (Network RAID)
                                    </div>
                                    <div className="text-xs font-normal opacity-80 mt-1">Real-time Mirroring</div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">DRBD mirrors every write to the secondary node over the network before confirming success to ZFS.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Arrow */}
                    <div className="flex justify-center text-slate-300">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>

                    {/* Layer 1: Hardware RAID */}
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <div className="p-4 bg-slate-200 border-2 border-slate-400 rounded-lg text-slate-700 font-bold text-center shadow-sm cursor-help hover:bg-slate-300 transition-colors">
                                    <div className="flex items-center justify-center gap-2">
                                        <HardDrive className="w-5 h-5" />
                                        Hardware RAID (Virtual Disk)
                                    </div>
                                    <div className="text-xs font-normal opacity-80 mt-1">Physical Reliability</div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">Your physical PERC/RAID controller handles disk failures locally. Ganache sees this as a single reliable "Virtual Drive".</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>

                {/* Explainer Text */}
                <div className="space-y-6 max-w-sm">
                    <div className="flex gap-4">
                        <div className="mt-1 bg-blue-100 p-2 rounded-full h-fit">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Safe & Proven</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                This "Layer Cake" approach allows ZFS to run safely without needing direct access to disks, relying on the hardware controller for physical redundancy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
                <Button variant="ghost" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={() => setShowConfirm(true)} size="lg">
                    I Understand <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>

            <ConfirmationDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Confirm Compatibility Mode"
                description={
                    <div className="space-y-2">
                        <p>You are about to configure a Twin-View Cluster using <strong>Compatibility Mode</strong>.</p>
                        <p className="text-sm text-muted-foreground">This involves layering ZFS on top of your hardware RAID Virtual Drives via DRBD network replication.</p>
                        <ul className="list-disc ml-4 text-sm text-muted-foreground">
                            <li>All existing data on selected drives will be formatted.</li>
                            <li>Network replication will start immediately.</li>
                        </ul>
                    </div>
                }
                confirmKeyword="CONFIRM"
                onConfirm={handleConfirm}
                triggerLabel="Apply Configuration"
            />
        </div>
    );
}
