import { ConfigurationTimeline } from '@/components/features/history/ConfigurationTimeline';

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuration History</h1>
        <p className="text-muted-foreground mt-2">
          View the chronological timeline of all system configuration changes
        </p>
      </div>
      <ConfigurationTimeline />
    </div>
  );
}