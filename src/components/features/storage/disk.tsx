"use client";

import { useDraggable } from "@dnd-kit/core";
import { HardDrive, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type DiskType = {
    id: string;
    serial: string;
    size: string;
    status: "available" | "assigned" | "failed";
    slot?: number;
    nodeId: "node-a" | "node-b";
};

type DiskProps = {
    disk: DiskType;
    onRemove?: (id: string) => void;
    onDoubleClick?: (id: string) => void;
};

// Pure UI Component (for Overlay and Inner rendering)
export function DiskCard({ disk, onRemove, onDoubleClick, isDragging, isOverlay }: DiskProps & { isDragging?: boolean; isOverlay?: boolean }) {
    return (
        <div
            onDoubleClick={(e) => {
                if (onDoubleClick) {
                    e.stopPropagation();
                    onDoubleClick(disk.id);
                }
            }}
            className={cn(
                "group relative flex cursor-grab items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-primary active:cursor-grabbing",
                // Styles for Assigned Disks
                disk.status === "assigned" && "cursor-default opacity-100 pr-10 hover:border-destructive/50",
                // Styles for Failed Disks
                disk.status === "failed" && "border-destructive/50 bg-destructive/10",
                // Styles when being dragged (Ghost / Source)
                isDragging && !isOverlay && "opacity-30",
                // Styles for Overlay (The flying copy)
                isOverlay && "z-50 shadow-xl scale-105 ring-2 ring-primary ring-offset-2 opacity-100 bg-card"
            )}
            title={onDoubleClick ? "Double-click to move" : undefined}
        >
            <div
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full bg-muted",
                    disk.status === "failed" && "bg-destructive/20 text-destructive"
                )}
            >
                <HardDrive className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-medium">{disk.serial}</p>
                <p className="text-xs text-muted-foreground">{disk.size}</p>
            </div>

            {disk.status === "assigned" && onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(disk.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-destructive/10 text-destructive"
                    title="Remove disk"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

// Logic Component (Drag Source)
export function Disk({ disk, onRemove, onDoubleClick }: DiskProps) {
    const { attributes, listeners, setNodeRef, isDragging } =
        useDraggable({
            id: disk.id,
            data: disk,
            disabled: disk.status !== "available",
        });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
        >
            <DiskCard
                disk={disk}
                onRemove={onRemove}
                onDoubleClick={onDoubleClick}
                isDragging={isDragging}
            />
        </div>
    );
}
