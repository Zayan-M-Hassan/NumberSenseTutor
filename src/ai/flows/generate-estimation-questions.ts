// src/ai/flows/generate-estimation-questions.ts
'use server';

/**
 * @fileOverview An AI agent for generating numerical estimation questions.
 *
 * - generateEstimationQuestion - A function that generates an estimation question.
 * - GenerateEstimationQuestionInput - The input type for the generateEstimationQuestion function.
 * - GenerateEstimationQuestionOutput - The return type for the generateEstimationQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEstimationQuestionInputSchema = z.object({
  topic: z.string().describe('The topic for the estimation question.'),
  exampleQuestions: z
    .string()
    .describe('Example questions to guide the AI question generation.'),
});
export type GenerateEstimationQuestionInput = z.infer<typeof GenerateEstimationQuestionInputSchema>;

const GenerateEstimationQuestionOutputSchema = z.object({
  question: z.string().describe('The generated estimation question.'),
  answer: z.number().describe('The answer to the estimation question.'),
  hasErrorRange: z.boolean().describe('Whether the question allows for a range of correct answers.'),
});
export type GenerateEstimationQuestionOutput = z.infer<typeof GenerateEstimationQuestionOutputSchema>;

export async function generateEstimationQuestion(
  input: GenerateEstimationQuestionInput
): Promise<GenerateEstimationQuestionOutput> {
  return generateEstimationQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEstimationQuestionPrompt',
  input: {schema: GenerateEstimationQuestionInputSchema},
  output: {schema: GenerateEstimationQuestionOutputSchema},
  prompt: `You are an expert in generating numerical calculation questions. Your most important task is to ensure the answer you provide is 100% correct. Double-check your calculations before providing the answer.

  Based on the topic and example questions provided, generate a new and unique calculation question. Also include the answer to the question.

  Topic: {{{topic}}}
  Example Questions: {{{exampleQuestions}}}

  If the question is very long or difficult and would be suitable for an estimation with an error range, set hasErrorRange to true. Otherwise, set it to false.
  Make sure your answer is a number. Return the answer, question, and hasErrorRange flag in JSON format.
  Do not include any introductory or concluding remarks, only the JSON.
  Follow the schema: { \"question\": \"question here\", \"answer\": answer here, \"hasErrorRange\": boolean here }
  `,
});

const generateEstimationQuestionFlow = ai.defineFlow(
  {
    name: 'generateEstimationQuestionFlow',
    inputSchema: GenerateEstimationQuestionInputSchema,
    outputSchema: GenerateEstimationQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
