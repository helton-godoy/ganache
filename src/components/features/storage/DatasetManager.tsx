import { useDestroyDataset, useListDatasets } from "@/api/generated/default/default";
import { DatasetInfo } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateDatasetDialog } from "./CreateDatasetDialog";

interface DatasetManagerProps {
    poolName: string;
}

export function DatasetManager({ poolName }: DatasetManagerProps) {
    const { data: datasetsResponse, isLoading, refetch } = useListDatasets({ pool: poolName });
    const datasets = datasetsResponse?.data;
    const { mutate: destroyMutate, isPending: isDestroyPending } = useDestroyDataset();

    // Delete Confirmation State
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = () => {
        if (!deleteTarget) return;
        destroyMutate({
            data: {
                pool: poolName,
                name: deleteTarget
            }
        }, {
            onSuccess: () => {
                toast.success(`Dataset '${deleteTarget}' deleted`);
                setDeleteTarget(null);
                setConfirmText("");
                refetch();
            },
            onError: (err) => {
                toast.error(`Failed to delete: ${err.message}`);
            }
        });
    };

    return (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Datasets & Shares</CardTitle>
                    <CardDescription>Manage ZFS child datasets for {poolName}</CardDescription>
                </div>
                <CreateDatasetDialog poolName={poolName} onSuccess={refetch} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : !datasets || datasets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No datasets found. Create one to get started.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Mountpoint</TableHead>
                                <TableHead>Start Usage</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Compression</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {datasets.map((ds: DatasetInfo) => (
                                <TableRow key={ds.name}>
                                    <TableCell className="font-medium">{ds.name}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{ds.mountpoint}</TableCell>
                                    <TableCell>{ds.used}</TableCell>
                                    <TableCell>{ds.available}</TableCell>
                                    <TableCell>{ds.compression}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setDeleteTarget(ds.name);
                                                setConfirmText("");
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Dataset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{poolName}/{deleteTarget}</strong>?
                            <br />
                            This action cannot be undone. All data will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm text-muted-foreground">Type <strong>CONFIRM</strong> to proceed:</label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-2"
                            placeholder="CONFIRM"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={confirmText !== "CONFIRM" || isDestroyPending}
                        >
                            {isDestroyPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
