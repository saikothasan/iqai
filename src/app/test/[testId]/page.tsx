import AppLayout from '@/components/layout/AppLayout';
import TestArea from '@/components/TestArea';
import { getTest } from '@/lib/firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function TestPage({ params }: { params: { testId: string } }) {
  const { testId } = params;
  
  const testData = await getTest(testId);

  if (!testData) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Test not found.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (testData.status === 'completed') {
    redirect(`/results/${testId}`);
  }
  
  return (
    <AppLayout>
      <TestArea testId={testId} testDetails={testData} />
    </AppLayout>
  );
}