import { SetupWizard } from '@/components/features/setup/setup-wizard'

export default function SetupPage() {
    return (
        <main className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Twin-View Cluster Setup</h1>
            <p className="text-muted-foreground mb-8">Drag and drop disks to configure your initial storage pool.</p>
            <SetupWizard />
        </main>
    )
}
