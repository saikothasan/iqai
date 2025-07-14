import AppLayout from '@/components/layout/AppLayout';
import DashboardClient from '@/components/DashboardClient';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your progress.</p>
        </div>
        <DashboardClient />
      </div>
    </AppLayout>
  );
}
