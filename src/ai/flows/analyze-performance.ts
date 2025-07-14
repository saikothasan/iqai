'use server';

/**
 * @fileOverview An AI agent that analyzes user performance on IQ tests and provides insights.
 *
 * - analyzePerformance - A function that analyzes IQ test performance and provides insights.
 * - AnalyzePerformanceInput - The input type for the analyzePerformance function.
 * - AnalyzePerformanceOutput - The return type for the analyzePerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePerformanceInputSchema = z.object({
  testResults: z.array(
    z.object({
      testType: z.string().describe('The type of IQ test taken.'),
      score: z.number().describe('The score achieved on the test.'),
      percentile: z.number().describe('The percentile ranking achieved on the test.'),
      duration: z.number().describe('The duration of the test in seconds.'),
      completedAt: z.string().describe('The timestamp when the test was completed.'),
    })
  ).describe('An array of IQ test results for a user.'),
  userHistory: z.string().optional().describe('Optional: A summary of the user history and past performances.'),
});
export type AnalyzePerformanceInput = z.infer<typeof AnalyzePerformanceInputSchema>;

const AnalyzePerformanceOutputSchema = z.object({
  insights: z.string().describe('Detailed insights into the user performance, including strengths, weaknesses, and areas for improvement.'),
  recommendations: z.string().describe('Personalized recommendations for improving IQ test performance.'),
});
export type AnalyzePerformanceOutput = z.infer<typeof AnalyzePerformanceOutputSchema>;

export async function analyzePerformance(input: AnalyzePerformanceInput): Promise<AnalyzePerformanceOutput> {
  return analyzePerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePerformancePrompt',
  input: {schema: AnalyzePerformanceInputSchema},
  output: {schema: AnalyzePerformanceOutputSchema},
  prompt: `You are an expert in analyzing IQ test results and providing personalized insights and recommendations.

  Analyze the following IQ test results to identify strengths, weaknesses, and areas for improvement. Also consider the user history if provided.

  Test Results:
  {{#each testResults}}
  - Type: {{this.testType}}, Score: {{this.score}}, Percentile: {{this.percentile}}, Duration: {{this.duration}} seconds, Completed At: {{this.completedAt}}
  {{/each}}

  {{#if userHistory}}
  User History: {{userHistory}}
  {{/if}}

  Based on the analysis, provide detailed insights into the user's performance and personalized recommendations for improvement.

  Output the insights into the insights field, and the recommendations into the recommendations field.
  `,
});

const analyzePerformanceFlow = ai.defineFlow(
  {
    name: 'analyzePerformanceFlow',
    inputSchema: AnalyzePerformanceInputSchema,
    outputSchema: AnalyzePerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
