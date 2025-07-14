import AppLayout from '@/components/layout/AppLayout';
import AnalysisClient from '@/components/AnalysisClient';

export default function AnalysisPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Performance Analysis</h1>
          <p className="text-muted-foreground">
            Leverage AI to get detailed insights and recommendations based on your test history.
          </p>
        </div>
        <AnalysisClient />
      </div>
    </AppLayout>
  );
}
