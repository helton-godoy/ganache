"use client";

import { getGetSystemResourcesQueryKey, useCreatePool, useGetDrbdDevices } from "@/api/generated/default/default";
import type { StorageDevice } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Database, HardDrive, Info, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PoolCreationWizard() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [selectedDevice, setSelectedDevice] = useState("");
    const [confirmation, setConfirmation] = useState("");

    const queryClient = useQueryClient();

    const drbdDevicesQuery = useGetDrbdDevices();
    const drbdDevices = drbdDevicesQuery.data?.data || [];

    const createPool = useCreatePool({
        mutation: {
            onSuccess: () => {
                void queryClient.invalidateQueries({ queryKey: getGetSystemResourcesQueryKey() });
                setOpen(false);
                setName("");
                setSelectedDevice("");
                setConfirmation("");
                toast.success("Storage Pool Created");
            },
            onError: (err: any) => {
                toast.error("Pool Creation Failed", {
                    description: err.response?.data?.message || err.message,
                });
            }
        }
    });

    const isReady = name.length >= 3 && selectedDevice && confirmation === "CONFIRM";

    const handleCreate = () => {
        if (!isReady) return;
        createPool.mutate({
            data: {
                name,
                device: selectedDevice,
                compression: true,
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 transition-all duration-300">
                    <Database className="w-4 h-4" />
                    Criar Novo Pool
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-100 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <DialogTitle className="text-xl text-center font-bold tracking-tight">
                        Configurar Armazenamento Seguro
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-center">
                        Crie um pool ZFS sobre um dispositivo replicado DRBD para garantir Resiliência HA.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    {/* Pool Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">
                            Nome do Pool
                        </label>
                        <Input
                            placeholder="ex: data-pool"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-950/50 border-slate-800 text-slate-100 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Device Selection Map */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                            Dispositivo Replicado (DRBD)
                            {drbdDevicesQuery.isLoading && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                        </label>

                        <div className="grid gap-2">
                            {drbdDevices.map((device: StorageDevice) => (
                                <button
                                    key={device.path}
                                    onClick={() => setSelectedDevice(device.path)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${selectedDevice === device.path
                                        ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/20"
                                        : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedDevice === device.path ? "bg-emerald-500/20" : "bg-slate-800 group-hover:bg-slate-700"
                                            }`}>
                                            <HardDrive className={`w-5 h-5 ${selectedDevice === device.path ? "text-emerald-400" : "text-slate-400"
                                                }`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-sm">{device.name}</div>
                                            <div className="text-xs text-slate-500">{device.path}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                                        {device.size}
                                    </div>
                                </button>
                            ))}
                            {drbdDevices.length === 0 && (
                                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                                    <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Nenhum dispositivo DRBD encontrado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Safety Gate */}
                    <div className="mt-2 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl space-y-3">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Ação Crítica</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Esta operação formatará o dispositivo selecionado e criará a estrutura ZFS. Todos os dados existentes no dispositivo DRBD serão perdidos.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-medium ml-1">
                                Digite <span className="text-yellow-500/80 font-mono italic">CONFIRM</span> para validar:
                            </p>
                            <Input
                                placeholder="CONFIRM"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                className="bg-slate-950/80 border-slate-800 text-slate-100 focus:ring-yellow-500/30 focus:border-yellow-500/50 h-9 text-center tracking-widest font-bold placeholder:tracking-normal placeholder:font-normal"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        onClick={handleCreate}
                        disabled={!isReady || createPool.isPending}
                        className={`w-full h-12 text-sm font-bold tracking-wide transition-all duration-300 ${isReady
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-800 text-slate-500 grayscale border-slate-700"
                            }`}
                    >
                        {createPool.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Inicializando Estrutura ZFS...
                            </>
                        ) : (
                            "Finalizar e Criar Pool"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
