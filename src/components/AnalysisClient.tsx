'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserTests } from '@/lib/firebase/firestore';
import { analyzePerformance, AnalyzePerformanceOutput } from '@/ai/flows/analyze-performance';
import type { Test } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Rocket, Target } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function AnalysisClient() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePerformanceOutput | null>(null);
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

  const handleAnalyze = async () => {
    if (tests.length === 0) {
      setError('You need to complete at least one test to get an analysis.');
      return;
    }
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const testResults = tests.map(t => ({
        testType: t.testType,
        score: t.score,
        percentile: 90, // Placeholder, as percentile is not in the data model.
        duration: t.duration,
        completedAt: t.completedAt ? t.completedAt.toDate().toISOString() : new Date().toISOString(),
      }));
      
      const result = await analyzePerformance({ testResults });
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate analysis. The AI service might be unavailable.');
    } finally {
      setAnalyzing(false);
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
            <AlertTitle>No Data to Analyze</AlertTitle>
            <AlertDescription>
              You haven't completed any tests yet. Complete a test to get your AI-powered performance analysis.
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
          <CardTitle>Generate Your Analysis</CardTitle>
          <CardDescription>
            Click the button below to have our AI analyze your performance across all {tests.length} of your completed tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <>
                <Lightbulb className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Analyze My Performance
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

      {analyzing && (
        <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      )}

      {analysisResult && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Strengths and Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.insights}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
               <div className="rounded-full bg-accent/10 p-3 flex items-center justify-center">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.recommendations}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
