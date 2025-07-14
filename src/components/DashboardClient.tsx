'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserTests } from '@/lib/firebase/firestore';
import type { Test } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardClient() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchTests = async () => {
        setLoading(true);
        const userTests = await getUserTests(user.uid);
        // Sort tests by creation date
        userTests.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setTests(userTests);
        setLoading(false);
      };
      fetchTests();
    }
  }, [user]);

  const chartData = [...tests].reverse().map((test, index) => ({
    name: `Test ${index + 1}`,
    score: test.score,
    date: format(test.createdAt.toDate(), 'MMM dd'),
  }));

  const recentTests = tests.slice(0, 3);
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (tests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <h3 className="text-xl font-semibold mb-2">No tests taken yet</h3>
          <p className="text-muted-foreground mb-4">Start your first IQ test to see your results here.</p>
          <Button asChild>
            <Link href="/test">Start New Test</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Recent Tests</CardTitle>
          <CardDescription>Here are the last 3 tests you've completed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentTests.map((test) => (
            <Card key={test.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg capitalize">{test.testType.replace('-', ' ')}</CardTitle>
                <CardDescription>{format(test.createdAt.toDate(), 'PPP')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Score</span>
                  <span className="font-semibold">{test.score}/100</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Duration</span>
                  <span className="font-semibold">{formatDuration(test.duration)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty</span>
                  <Badge variant="outline" className="capitalize">{test.difficulty}</Badge>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button asChild className="w-full">
                    <Link href={`/results/${test.id}`}>
                        View Full Results <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Your scores from the last {tests.length} tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="score" fill="var(--color-score)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <CardDescription>A detailed log of all your completed tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{format(test.createdAt.toDate(), 'PP')}</TableCell>
                    <TableCell className="capitalize">{test.testType.replace('-', ' ')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{test.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{test.score}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/results/${test.id}`}>
                          View Results <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
