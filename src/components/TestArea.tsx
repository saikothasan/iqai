'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateTest } from '@/lib/firebase/firestore';
import { generateIqQuestion } from '@/ai/flows/generate-iq-question';
import type { Question, Test } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { serverTimestamp } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';


const TEST_DURATION_MINUTES = 15;
const TOTAL_QUESTIONS = 10;
type Difficulty = 'easy' | 'medium' | 'hard';

interface TestAreaProps {
  testId: string;
  testDetails: Test;
}

export default function TestArea({ testId, testDetails }: TestAreaProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MINUTES * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(testDetails.difficulty);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  const fetchQuestion = useCallback(async (difficulty: Difficulty) => {
    setLoadingQuestion(true);
    setError(null);
    try {
      const newQuestion = await generateIqQuestion({
        category: testDetails.testType,
        difficulty: difficulty,
      });
      setQuestions(prev => [...prev, newQuestion as Question]);
      setAnswers(prev => [...prev, null]);
    } catch (e) {
      console.error(e);
      setError('Failed to generate a new question. The AI service might be unavailable.');
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate the next question.',
      });
    } finally {
      setLoadingQuestion(false);
    }
  }, [testDetails.testType, toast]);

  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestion(currentDifficulty);
    }
  }, [fetchQuestion, questions.length, currentDifficulty]);


  const handleFinishTest = useCallback(async () => {
    setIsSubmitting(true);
    try {
      let score = 0;
      answers.forEach((answer, index) => {
        if (answer === questions[index]?.correctAnswer) {
          score++;
        }
      });
      const finalScore = Math.round((score / questions.length) * 100);

      await updateTest(testId, {
        questions,
        answers,
        score: finalScore,
        status: 'completed',
        duration: TEST_DURATION_MINUTES * 60 - timeLeft,
        completedAt: serverTimestamp(),
      });

      toast({
        title: 'Test Submitted!',
        description: 'Your results have been calculated.',
      });
      router.push(`/results/${testId}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'There was a problem submitting your test. Please try again.',
      });
      setIsSubmitting(false);
    }
  }, [answers, questions, router, testId, timeLeft, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleFinishTest]);

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };
  
  const getNextDifficulty = (isCorrect: boolean): Difficulty => {
    if (isCorrect) {
      if (currentDifficulty === 'easy') return 'medium';
      if (currentDifficulty === 'medium') return 'hard';
      return 'hard';
    } else {
      if (currentDifficulty === 'hard') return 'medium';
      if (currentDifficulty === 'medium') return 'easy';
      return 'easy';
    }
  };

  const handleNext = () => {
    const isCorrect = answers[currentQuestionIndex] === currentQuestion.correctAnswer;
    const nextDifficulty = getNextDifficulty(isCorrect);
    setCurrentDifficulty(nextDifficulty);

    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (currentQuestionIndex + 1 >= questions.length) {
        fetchQuestion(nextDifficulty);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle className="text-2xl font-headline capitalize">
              {testDetails.testType.replace('-', ' ')} Test
            </CardTitle>
             <p className="text-sm text-muted-foreground capitalize">Difficulty: {testDetails.difficulty}</p>
          </div>
          <div className="text-lg font-semibold text-primary">{formatTime(timeLeft)}</div>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2 text-center">Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</p>
      </CardHeader>
      <CardContent>
        {loadingQuestion && (
           <div className="space-y-4 my-6">
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        )}
        {error && (
            <Alert variant="destructive" className="my-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {!loadingQuestion && currentQuestion && (
          <>
            <div className="my-6">
              {currentQuestion.imageUrl && (
                  <div className="mb-4 relative w-full h-64 md:h-96">
                      <Image 
                          src={currentQuestion.imageUrl} 
                          alt="Question visual" 
                          layout="fill"
                          objectFit="contain"
                          className="rounded-md"
                      />
                  </div>
              )}
              <h2 className="text-lg md:text-xl font-semibold">{currentQuestion.questionText}</h2>
            </div>

            <RadioGroup value={answers[currentQuestionIndex] || ''} onValueChange={handleAnswerChange} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              {currentQuestion.options.map((option, index) => (
                <Label
                  key={index}
                  className="flex items-center space-x-3 border rounded-md p-4 cursor-pointer hover:bg-muted has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <span>{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </>
        )}

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting}>
            Previous
          </Button>
          
          {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting || loadingQuestion || !answers[currentQuestionIndex]}>
                  {isSubmitting ? 'Submitting...' : 'Finish Test'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to finish?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will submit all your answers and end the test. You cannot go back after this.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFinishTest}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting || loadingQuestion || !answers[currentQuestionIndex]}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
