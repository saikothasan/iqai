'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserTests } from '@/lib/firebase/firestore';
import { createStudyPlan, CreateStudyPlanOutput } from '@/ai/flows/create-study-plan';
import type { Test } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Bot } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { format } from 'date-fns';

export default function StudyPlanClient() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<CreateStudyPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchTests = async () => {
        setLoading(true);
        const userTests = await getUserTests(user.uid);
        setTests(userTests);
        setLoading(false);
      };
      fetchTests();
    }
  }, [user]);

  const handleGeneratePlan = async () => {
    if (tests.length === 0) {
      setError('You need to complete at least one test to generate a study plan.');
      return;
    }
    setGenerating(true);
    setError(null);
    setStudyPlan(null);

    try {
      const userHistory = tests
        .map(t => `- Test: ${t.testType} (${t.difficulty}), Score: ${t.score}, Date: ${format(t.createdAt.toDate(), 'yyyy-MM-dd')}`)
        .join('\n');
      
      const result = await createStudyPlan({ userHistory });
      setStudyPlan(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate study plan. The AI service might be unavailable.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if (tests.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertTitle>No Data for Study Plan</AlertTitle>
            <AlertDescription>
              Complete a test to get your AI-powered personalized study plan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Your Study Plan</CardTitle>
          <CardDescription>
            Based on your past performance, our AI will create a tailored study plan to address your areas for improvement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGeneratePlan} disabled={generating}>
            {generating ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Create My Study Plan
              </>
            )}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {generating && (
         <Card>
            <CardHeader>
                 <Skeleton className="h-6 w-48 mb-2" />
                 <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
      )}

      {studyPlan && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Your Personalized Study Plan
                </CardTitle>
                <CardDescription>Follow these steps to boost your cognitive abilities.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert whitespace-pre-wrap">
                    {studyPlan.studyPlan}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
