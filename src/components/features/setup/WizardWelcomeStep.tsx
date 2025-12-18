"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHardwareDetection } from "@/hooks/use-hardware-detection";
import { AlertTriangle, ArrowRight, Check, Cpu, Server, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface WizardWelcomeStepProps {
    onNext: (mode: "standard" | "compatibility") => void;
}

export function WizardWelcomeStep({ onNext }: WizardWelcomeStepProps) {
    const [selectedMode, setSelectedMode] = useState<"standard" | "compatibility" | null>(null);
    const [showWarning, setShowWarning] = useState(false);

    // Check hardware detection
    const { data: hardwareInfo, isLoading } = useHardwareDetection();

    // Automatically recommend compatibility mode if RAID is detected
    useEffect(() => {
        if (hardwareInfo?.data?.has_raid) {
            setSelectedMode("compatibility");
        }
    }, [hardwareInfo]);

    const handleContinue = () => {
        if (selectedMode) {
            onNext(selectedMode);
        }
    };

    const handleStandardClick = () => {
        if (hardwareInfo?.data?.has_raid) {
            setShowWarning(true);
        } else {
            setSelectedMode("standard");
        }
    };

    const confirmStandardMode = () => {
        setSelectedMode("standard");
        setShowWarning(false);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Welcome to Ganache
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose how you want to configure your storage cluster.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                {/* Standard Mode Card */}
                <Card
                    data-testid="card-standard"
                    className={`relative cursor-pointer transition-all border-2 hover:border-primary/50 ${selectedMode === "standard" ? "border-primary shadow-lg scale-[1.02]" : "border-border"}`}
                    onClick={handleStandardClick}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-6 h-6" />
                            Standard Mode
                        </CardTitle>
                        <CardDescription>
                            Full hardware control for maximum performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• Requires direct disk access (HBA/IT Mode)</p>
                            <p>• Supports full ZFS features</p>
                            <p>• Best for custom hardware builds</p>
                        </div>
                    </CardContent>
                    {selectedMode === "standard" && (
                        <div className="absolute top-4 right-4 text-primary">
                            <Check className="w-6 h-6" />
                        </div>
                    )}
                </Card>

                {/* Compatibility Mode Card */}
                <Card
                    data-testid="card-compatibility"
                    className={`relative cursor-pointer transition-all border-2 hover:border-primary/50 ${selectedMode === "compatibility" ? "border-primary shadow-lg scale-[1.02]" : "border-border"}`}
                    onClick={() => setSelectedMode("compatibility")}
                >
                    {hardwareInfo?.data?.has_raid && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10 animate-in fade-in zoom-in duration-300">
                            Recommended
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6" />
                            Compatibility Mode
                        </CardTitle>
                        <CardDescription>
                            Optimized for hardware RAID controllers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• Works with existing RAID cards (PERC, etc.)</p>
                            <p>• Safe ZFS layering on virtual drives</p>
                            <p>• Automatic performance tuning</p>
                        </div>

                        {/* Educator Tooltip / Info Box */}
                        {hardwareInfo?.data?.has_raid && (
                            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-md border border-blue-100 mt-4 animate-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <Cpu className="w-4 h-4" />
                                    Hardware Detected: {hardwareInfo.data.controller_name || "RAID Controller"}
                                </div>
                                <p>
                                    Compatibility mode ensures ZFS runs safely on top of your existing virtual drives without data corruption risks.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    {selectedMode === "compatibility" && (
                        <div className="absolute top-4 right-4 text-blue-500">
                            <Check className="w-6 h-6" />
                        </div>
                    )}
                </Card>
            </div>

            <div className="flex justify-center pt-8">
                <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!selectedMode || isLoading}
                    className="w-full md:w-auto min-w-[200px] text-lg h-12"
                >
                    {isLoading ? "Scanning Hardware..." : (
                        <>
                            Continue Setup <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    )}
                </Button>
            </div>

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                            Hardware RAID Detected
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            We detected a <strong>{hardwareInfo?.data?.controller_name || "RAID Controller"}</strong> in your system.
                            <br /><br />
                            Using <strong>Standard Mode</strong> (ZFS) on top of hardware RAID can lead to reliability issues and is <strong>not recommended</strong> unless you have flashed your controller to IT Mode.
                            <br /><br />
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStandardMode}
                            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
                        >
                            Proceed Anyway
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
