"use client";

import { RecoveryConsole } from '@/components/features/panic/recovery-console';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecoveryPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-destructive tracking-tight">System Recovery</h1>
                        <p className="text-slate-500">Manual intervention required for cluster restoration.</p>
                    </div>
                </header>

                <RecoveryConsole />

            </div>
        </div>
    )
}
