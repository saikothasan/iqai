'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized study plan based on a user's test history.
 *
 * - createStudyPlan - A function that generates a personalized study plan.
 * - CreateStudyPlanInput - The input type for the createStudyPlan function.
 * - CreateStudyPlanOutput - The return type for the createStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateStudyPlanInputSchema = z.object({
  userHistory: z
    .string()
    .describe('The user test history, including test types and scores.'),
});
export type CreateStudyPlanInput = z.infer<typeof CreateStudyPlanInputSchema>;

const CreateStudyPlanOutputSchema = z.object({
  studyPlan: z
    .string()
    .describe(
      'A personalized study plan tailored to the user, focusing on areas of weakness.'
    ),
});
export type CreateStudyPlanOutput = z.infer<typeof CreateStudyPlanOutputSchema>;

export async function createStudyPlan(input: CreateStudyPlanInput): Promise<CreateStudyPlanOutput> {
  return createStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createStudyPlanPrompt',
  input: {schema: CreateStudyPlanInputSchema},
  output: {schema: CreateStudyPlanOutputSchema},
  prompt: `You are an AI study plan generator. Analyze the user\'s test history and create a personalized study plan to help the user improve their IQ score. Focus on the user\'s weaknesses.

User History: {{{userHistory}}}

Study Plan:`,
});

const createStudyPlanFlow = ai.defineFlow(
  {
    name: 'createStudyPlanFlow',
    inputSchema: CreateStudyPlanInputSchema,
    outputSchema: CreateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
