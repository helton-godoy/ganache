"use client";

import { useListDisks } from "@/api/generated/default/default";
import type { DiskInfo } from "@/api/generated/model";
import { DiskCard, type DiskType } from "@/components/features/storage/disk";
import { Button } from "@/components/ui/button";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ServerBlade } from "./server-blade";
import { WizardCompatibilityStep } from "./WizardCompatibilityStep";
import { WizardWelcomeStep } from "./WizardWelcomeStep";

type WizardStep = "welcome" | "config" | "review" | "compatibility";

interface SetupWizardProps {
    initialSetupStatus?: { data: any };
    initialDisks?: { data: DiskInfo[] };
}

export function SetupWizard({ initialSetupStatus, initialDisks }: SetupWizardProps) {
    const router = useRouter();
    const { data: axiosDisks, isLoading } = useListDisks({
        query: {
            initialData: initialDisks ? {
                data: initialDisks.data,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            } : undefined
        }
    });
    const serverDisks = axiosDisks?.data || initialDisks?.data;

    const [currentStep, setCurrentStep] = useState<WizardStep>("welcome");

    // Node A State
    const [nodeAAvailable, setNodeAAvailable] = useState<DiskType[]>([]);
    const [nodeAAssigned, setNodeAAssigned] = useState<DiskType[]>([]);

    // Node B State
    const [nodeBAvailable, setNodeBAvailable] = useState<DiskType[]>([]);
    const [nodeBAssigned, setNodeBAssigned] = useState<DiskType[]>([]);

    const [activeDisk, setActiveDisk] = useState<DiskType | null>(null);

    // Initialize local state
    useEffect(() => {
        if (serverDisks && nodeAAvailable.length === 0 && nodeAAssigned.length === 0 && nodeBAvailable.length === 0 && nodeBAssigned.length === 0) {
            const mappedDisks = serverDisks.map((d: DiskInfo) => ({
                ...d,
                nodeId: d.node_id as "node-a" | "node-b"
            })) as DiskType[];

            setNodeAAvailable(mappedDisks.filter((d) => d.nodeId === "node-a"));
            setNodeBAvailable(mappedDisks.filter((d) => d.nodeId === "node-b"));
        }
    }, [serverDisks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // --- Drag Handlers (Only active in 'config' step) ---
    function handleDragStart(event: DragStartEvent) {
        if (currentStep !== "config") return;
        const { active } = event;
        const disk =
            nodeAAvailable.find((d) => d.id === active.id) ||
            nodeAAssigned.find((d) => d.id === active.id) ||
            nodeBAvailable.find((d) => d.id === active.id) ||
            nodeBAssigned.find((d) => d.id === active.id);
        if (disk) setActiveDisk(disk);
    }

    function handleDragEnd(event: DragEndEvent) {
        if (currentStep !== "config") { setActiveDisk(null); return; }
        const { active, over } = event;
        setActiveDisk(null);
        if (!over) return;

        const diskId = active.id as string;
        const overId = over.id as string;
        const disk = active.data.current as DiskType;
        if (!disk) return;

        if (overId === "node-a-pool" && disk.nodeId === "node-a") {
            if (nodeAAssigned.find(d => d.id === diskId)) return;
            setNodeAAvailable(prev => prev.filter(d => d.id !== diskId));
            setNodeAAssigned(prev => [...prev, { ...disk, status: "assigned" }]);
        }
        else if (overId === "node-b-pool" && disk.nodeId === "node-b") {
            if (nodeBAssigned.find(d => d.id === diskId)) return;
            setNodeBAvailable(prev => prev.filter(d => d.id !== diskId));
            setNodeBAssigned(prev => [...prev, { ...disk, status: "assigned" }]);
        }
    }

    // --- Node Actions ---
    const handleRemoveNodeA = (id: string) => {
        const disk = nodeAAssigned.find(d => d.id === id);
        if (!disk) return;
        setNodeAAssigned(prev => prev.filter(d => d.id !== id));
        setNodeAAvailable(prev => [...prev, { ...disk, status: "available" }]);
    };
    const handleAssignNodeA = (id: string) => {
        const disk = nodeAAvailable.find(d => d.id === id);
        if (!disk) return;
        setNodeAAvailable(prev => prev.filter(d => d.id !== id));
        setNodeAAssigned(prev => [...prev, { ...disk, status: "assigned" }]);
    }
    const handleAutoAssignNodeA = () => {
        setNodeAAssigned([...nodeAAvailable, ...nodeAAssigned].map(d => ({ ...d, status: "assigned" })));
        setNodeAAvailable([]);
    };
    const handleResetNodeA = () => {
        setNodeAAvailable([...nodeAAvailable, ...nodeAAssigned].map(d => ({ ...d, status: "available" })));
        setNodeAAssigned([]);
    };

    const handleRemoveNodeB = (id: string) => {
        const disk = nodeBAssigned.find(d => d.id === id);
        if (!disk) return;
        setNodeBAssigned(prev => prev.filter(d => d.id !== id));
        setNodeBAvailable(prev => [...prev, { ...disk, status: "available" }]);
    };
    const handleAssignNodeB = (id: string) => {
        const disk = nodeBAvailable.find(d => d.id === id);
        if (!disk) return;
        setNodeBAvailable(prev => prev.filter(d => d.id !== id));
        setNodeBAssigned(prev => [...prev, { ...disk, status: "assigned" }]);
    }
    const handleAutoAssignNodeB = () => {
        setNodeBAssigned([...nodeBAvailable, ...nodeBAssigned].map(d => ({ ...d, status: "assigned" })));
        setNodeBAvailable([]);
    };
    const handleResetNodeB = () => {
        setNodeBAvailable([...nodeBAvailable, ...nodeBAssigned].map(d => ({ ...d, status: "available" })));
        setNodeBAssigned([]);
    };

    // --- Global Wizard Actions ---
    const canProcced = nodeAAssigned.length > 0 && nodeBAssigned.length > 0;

    const handleNext = () => {
        if (!canProcced) {
            toast.error("Both nodes must have storage configured.");
            return;
        }
        setCurrentStep("review");
    };

    const handleBack = () => {
        setCurrentStep("config");
    };

    const handleConfirm = () => {
        toast.success("Cluster configuration applied!");
        setTimeout(() => router.push("/"), 1500);
    };

    const handleGlobalReset = () => {
        handleResetNodeA();
        handleResetNodeB();
        toast.info("All configurations reset.");
    };

    if (isLoading) return <div>Loading hardware inventory...</div>;

    // --- REVIEW VIEW COMPONENT ---
    const ReviewView = () => (
        <div className="space-y-6 max-w-4xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Check className="w-8 h-8 text-primary" />
                    Review Configuration
                </h2>
                <p className="text-muted-foreground">Please verify the configuration before building the cluster.</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Node A Summary */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold border-b pb-2">
                        <Server className="w-4 h-4 text-primary" /> Node A Summary
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pool Disks:</span>
                            <span className="font-mono font-bold">{nodeAAssigned.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Raw Capacity:</span>
                            <span className="font-mono">~{(nodeAAssigned.length * 1.92).toFixed(2)} TB</span>
                        </div>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 pt-2">
                            {nodeAAssigned.map(d => <li key={d.id}>{d.serial} ({d.size})</li>)}
                        </ul>
                    </div>
                </div>

                {/* Node B Summary */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold border-b pb-2">
                        <Server className="w-4 h-4 text-primary" /> Node B Summary
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pool Disks:</span>
                            <span className="font-mono font-bold">{nodeBAssigned.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Raw Capacity:</span>
                            <span className="font-mono">~{(nodeBAssigned.length * 1.92).toFixed(2)} TB</span>
                        </div>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 pt-2">
                            {nodeBAssigned.map(d => <li key={d.id}>{d.serial} ({d.size})</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-500 mt-4 text-center">
                A ZFS Pool will be created on each node using the assigned disks.
                <br />DRBD replication will be configured automatically.
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {currentStep === "welcome" && (
                <WizardWelcomeStep onNext={(mode) => {
                    if (mode === "compatibility") {
                        setCurrentStep("compatibility");
                    } else {
                        setCurrentStep("config");
                    }
                }} />
            )}

            {currentStep === "compatibility" && (
                <WizardCompatibilityStep
                    onNext={() => {
                        // Compatibility mode bypasses config/review for now as it's automated
                        // or moves to a specific review if needed. For now, it handles its own confirmation.
                        // Ideally, it transitions to "done" or redirects.
                        // The component handles the API call and visualizer.
                        // We can just stay here or have a callback to redirect?
                        // The component calls configure(). On success it calls onNext.
                        // We can redirect to dashboard.
                        toast.success("Compatibility Mode Configured!");
                        setTimeout(() => router.push("/"), 2000);
                    }}
                    onBack={() => setCurrentStep("welcome")}
                />
            )}

            {currentStep === "config" && (
                // --- CONFIG STEP (DnD) ---
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 pb-24 max-w-7xl mx-auto">
                        <ServerBlade
                            id="node-a" name="Node A (Primary)"
                            availableDisks={nodeAAvailable} assignedDisks={nodeAAssigned} isMain={true}
                            onRemoveDisk={handleRemoveNodeA} onAssignDisk={handleAssignNodeA} onAutoAssign={handleAutoAssignNodeA} onReset={handleResetNodeA}
                        />
                        <ServerBlade
                            id="node-b" name="Node B (Secondary)"
                            availableDisks={nodeBAvailable} assignedDisks={nodeBAssigned}
                            onRemoveDisk={handleRemoveNodeB} onAssignDisk={handleAssignNodeB} onAutoAssign={handleAutoAssignNodeB} onReset={handleResetNodeB}
                        />
                    </div>
                    <DragOverlay>
                        {activeDisk ? <DiskCard disk={activeDisk} isOverlay /> : null}
                    </DragOverlay>
                </DndContext>
            )}
            {currentStep === "review" && (
                // --- REVIEW STEP ---
                <div className="p-6 pb-24">
                    <ReviewView />
                </div>
            )}

            {/* Footer - Hide on Welcome Step */}
            {currentStep !== "welcome" && (
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-50">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        {/* Footer Left Info */}
                        <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
                            {currentStep === "config" && (
                                <>
                                    <span>Node A Pool: <strong className="text-foreground">{nodeAAssigned.length}</strong></span>
                                    <span>Node B Pool: <strong className="text-foreground">{nodeBAssigned.length}</strong></span>
                                </>
                            )}
                            {currentStep === "review" && (
                                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Ready to apply</span>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-4">
                            {currentStep === "config" ? (
                                <>
                                    <Button variant="outline" size="lg" onClick={handleGlobalReset} className="gap-2">
                                        <RotateCcw className="w-4 h-4" /> Reset All
                                    </Button>
                                    <Button size="lg" onClick={handleNext} className="gap-2" disabled={!canProcced}>
                                        Next: Review <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="lg" onClick={handleBack} className="gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back to Config
                                    </Button>
                                    <Button size="lg" onClick={handleConfirm} className="gap-2 bg-green-600 hover:bg-green-700">
                                        Confirm & Apply <Check className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
