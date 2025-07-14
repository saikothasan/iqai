import AppLayout from '@/components/layout/AppLayout';
import StartTestForm from '@/components/StartTestForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StartTestPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Start a New Test</CardTitle>
            <CardDescription>
              Choose a category and difficulty level to begin your assessment. A new set of questions will be generated for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StartTestForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
