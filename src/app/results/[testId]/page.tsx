import AppLayout from '@/components/layout/AppLayout';
import { getTest } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, BarChart, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';

export default async function ResultsPage({ params }: { params: { testId: string } }) {
  const testData = await getTest(params.testId);

  if (!testData || testData.status !== 'completed') {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Results for this test could not be found or the test is not completed.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Test Results</CardTitle>
            <CardDescription className="capitalize">
              {testData.testType.replace('-', ' ')} - {testData.difficulty}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" /> Your Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-primary">{testData.score}</p>
                  <p className="text-sm text-muted-foreground">out of 100</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-lg">
                    <BarChart className="h-5 w-5 text-accent" /> Percentile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-bold text-accent">90th</p>
                  <p className="text-sm text-muted-foreground">Better than 90%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-blue-500" /> Time Taken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-500">{formatDuration(testData.duration)}</p>
                  <p className="text-sm text-muted-foreground">Total duration</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/dashboard">
                  Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Answer Review</CardTitle>
                <CardDescription>Review the questions and your answers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {testData.questions.map((q, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full pr-4">
                                    <span>Question {index + 1}</span>
                                    {testData.answers[index] === q.correctAnswer ? (
                                        <span className="text-green-500 font-semibold">Correct</span>
                                    ) : (
                                        <span className="text-red-500 font-semibold">Incorrect</span>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                {q.imageUrl && (
                                  <div className="relative w-full h-64">
                                    <Image src={q.imageUrl} alt="Question image" layout="fill" objectFit="contain" />
                                  </div>
                                )}
                                <p className="font-semibold">{q.questionText}</p>
                                <p><strong>Your Answer:</strong> <span className={testData.answers[index] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}>{testData.answers[index] || 'Not answered'}</span></p>
                                <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                                <div className="p-4 bg-muted rounded-md border">
                                    <h4 className="font-semibold mb-2">Explanation</h4>
                                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}