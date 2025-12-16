"use client";

import { useDroppable } from "@dnd-kit/core";
import { Database, RotateCcw, Server } from "lucide-react";

import { Disk, type DiskType } from "@/components/features/storage/disk";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ServerBladeProps = {
    id: string;
    name: string;
    availableDisks: DiskType[]; // Local physical inventory
    assignedDisks: DiskType[];  // Disks assigned to the ZPool
    isMain?: boolean;
    onRemoveDisk?: (id: string) => void;
    onAssignDisk?: (id: string) => void;
    onAutoAssign?: () => void;
    onReset?: () => void;
};

// Droppable area specifically for the Pool (Assigned)
function PoolArea({ id, disks, isMain, onRemove }: { id: string, disks: DiskType[], isMain?: boolean, onRemove?: (id: string) => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${id}-pool`, // Unique ID for the pool drop zone
        data: { id: id, type: "pool-target" },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 flex flex-col gap-2 rounded-lg border-2 border-dashed p-3 transition-colors min-h-[150px]",
                isOver ? "border-primary bg-primary/5" : "border-muted-foreground/20",
                disks.length > 0 && "border-solid border-primary/20 bg-muted/30"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Target ZPool
                </h4>
                <span className="text-xs text-muted-foreground">{disks.length} / 8 slots</span>
            </div>

            {disks.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground text-center p-4">
                    {isOver ? "Drop to Add" : "Drag disks here to assign<br/>or double-click"}
                </div>
            ) : (
                <div className="space-y-2">
                    {disks.map((disk) => (
                        <Disk
                            key={disk.id}
                            disk={disk}
                            onRemove={onRemove}
                            onDoubleClick={onRemove} // Double-click to remove/unassign
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export function ServerBlade({ id, name, availableDisks, assignedDisks, isMain, onRemoveDisk, onAssignDisk, onAutoAssign, onReset }: ServerBladeProps) {

    return (
        <div className={cn(
            "relative flex flex-col gap-6 rounded-xl border p-6 bg-card shadow-sm",
            isMain && "ring-2 ring-primary/20"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-muted", isMain && "bg-primary/10 text-primary")}>
                        <Server className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{id}</p>
                    </div>
                </div>
                {/* Node-Local Actions */}
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={onReset} title="Reset Node Configuration">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={onAutoAssign} disabled={availableDisks.length === 0}>
                        Auto-Fill
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                {/* Left: Local Available Inventory */}
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 border-r border-dashed">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Local Disks (Available)</h4>
                    {availableDisks.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-8 text-center italic">
                            No unassigned disks
                        </div>
                    ) : (
                        availableDisks.map((disk) => (
                            <Disk
                                key={disk.id}
                                disk={disk}
                                onDoubleClick={onAssignDisk} // Double-click to assign
                            />
                        ))
                    )}
                </div>

                {/* Right: Targeted ZPool (Droppable) */}
                <PoolArea
                    id={id}
                    disks={assignedDisks}
                    isMain={isMain}
                    onRemove={onRemoveDisk} // Also serves as double-click handler inside PoolArea
                />
            </div>
        </div>
    );
}
