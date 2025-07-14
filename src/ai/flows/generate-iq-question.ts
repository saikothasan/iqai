'use server';

/**
 * @fileOverview This file defines a Genkit flow for dynamically generating IQ questions using the Gemini Pro model.
 *
 * - generateIqQuestion - A function that generates a unique IQ question based on the specified category and difficulty.
 * - GenerateIqQuestionInput - The input type for the generateIqQuestion function.
 * - GenerateIqQuestionOutput - The return type for the generateIqQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIqQuestionInputSchema = z.object({
  category: z
    .string()
    .describe('The category of the IQ question (e.g., logical reasoning, pattern recognition).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the IQ question.'),
});
export type GenerateIqQuestionInput = z.infer<typeof GenerateIqQuestionInputSchema>;

const GenerateIqQuestionOutputSchema = z.object({
  questionText: z.string().describe('The text of the generated IQ question.'),
  options: z.array(z.string()).describe('The possible answer options for the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  explanation: z.string().describe('An explanation of why the answer is correct.'),
  imageUrl: z.string().optional().describe('An optional URL for an image to be included with the question.'),
});
export type GenerateIqQuestionOutput = z.infer<typeof GenerateIqQuestionOutputSchema>;

export async function generateIqQuestion(input: GenerateIqQuestionInput): Promise<GenerateIqQuestionOutput> {
  if (input.category === 'pattern-recognition' && Math.random() < 0.5) {
     return generateVisualPatternQuestion(input);
  }
  return generateIqQuestionFlow(input);
}

const generateIqQuestionPrompt = ai.definePrompt({
  name: 'generateIqQuestionPrompt',
  input: {schema: GenerateIqQuestionInputSchema},
  output: {schema: GenerateIqQuestionOutputSchema},
  prompt: `You are an expert in creating IQ test questions. Your job is to generate a unique IQ question with the following parameters:

Category: {{{category}}}
Difficulty: {{{difficulty}}}

Ensure the question is challenging, original, and suitable for the specified difficulty level. Provide plausible but incorrect answer options along with the correct answer. Also, include a clear and concise explanation of the correct answer.

If the category is 'pattern-recognition', you can create a question that requires an image, but it's not mandatory.

Format your response as a JSON object with the following keys:
- questionText: The text of the IQ question.
- options: An array of possible answer options (at least 4).
- correctAnswer: The correct answer from the options.
- explanation: An explanation of why the answer is correct.`,
});

const generateIqQuestionFlow = ai.defineFlow(
  {
    name: 'generateIqQuestionFlow',
    inputSchema: GenerateIqQuestionInputSchema,
    outputSchema: GenerateIqQuestionOutputSchema,
  },
  async input => {
    const {output} = await generateIqQuestionPrompt(input);
    return output!;
  }
);


const generateVisualPatternQuestion = ai.defineFlow(
  {
    name: 'generateVisualPatternQuestion',
    inputSchema: GenerateIqQuestionInputSchema,
    outputSchema: GenerateIqQuestionOutputSchema
  },
  async (input) => {
    const { media, text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image for a visual pattern recognition IQ question of ${input.difficulty} difficulty. The image should be part of a sequence or a matrix, where one item is missing. Also, provide a JSON object with the question text, 4 options (one correct, three plausible but incorrect), the correct answer, and an explanation. The user will be asked to find the missing item. The options should be simple text like "A", "B", "C", "D" or numbers that correspond to parts of the image. The image itself should contain the visual elements of the question. For example, a 3x3 grid with one empty square.

      Example JSON response format:
      {
        "questionText": "Which of the options below completes the pattern?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "C",
        "explanation": "The pattern consists of rotating the inner shape 90 degrees clockwise and changing its color. Option C correctly follows this pattern."
      }`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const parsedOutput = JSON.parse(text()!.replace(/```json\n|```/g, ''));

    return {
      ...parsedOutput,
      imageUrl: media.url
    };
  }
);