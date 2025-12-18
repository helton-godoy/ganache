import { useCreateDataset } from "@/api/generated/default/default";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateDatasetDialogProps {
    poolName: string;
    onSuccess?: () => void;
}

export function CreateDatasetDialog({ poolName, onSuccess }: CreateDatasetDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const { mutate, isPending } = useCreateDataset({
        mutation: {
            onSuccess: () => {
                toast.success(`Dataset '${name}' created successfully`);
                setOpen(false);
                setName("");
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(`Failed to create dataset: ${error.message}`);
            }
        }
    });

    const handleCreate = () => {
        if (!name.trim()) return;
        mutate({
            data: {
                pool_name: poolName,
                name: name.trim()
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Share
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Dataset (Share)</DialogTitle>
                    <DialogDescription>
                        Create a new ZFS dataset in <strong>{poolName}</strong>. This will automatically expose a network share.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">Dataset Name</label>
                        <Input
                            id="name"
                            placeholder="e.g., Marketing, Finance"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Dataset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
