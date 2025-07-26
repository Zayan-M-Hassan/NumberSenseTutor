'use server';

/**
 * @fileOverview Provides detailed feedback on a user's numerical estimate.
 * 
 * - provideFeedbackOnEstimate - A function that takes the user's estimate, the correct answer, and the question, and returns detailed feedback.
 * - ProvideFeedbackOnEstimateInput - The input type for the provideFeedbackOnEstimate function.
 * - ProvideFeedbackOnEstimateOutput - The return type for the provideFeedbackOnEstimate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideFeedbackOnEstimateInputSchema = z.object({
  question: z.string().describe('The numerical estimation question that was asked.'),
  userEstimate: z.number().describe('The user estimate for the question.'),
  correctAnswer: z.number().describe('The correct answer to the question.'),
});
export type ProvideFeedbackOnEstimateInput = z.infer<typeof ProvideFeedbackOnEstimateInputSchema>;

const ProvideFeedbackOnEstimateOutputSchema = z.object({
  feedback: z.string().describe('Detailed feedback on the user estimate, including the correct answer and explanation.'),
});
export type ProvideFeedbackOnEstimateOutput = z.infer<typeof ProvideFeedbackOnEstimateOutputSchema>;

export async function provideFeedbackOnEstimate(input: ProvideFeedbackOnEstimateInput): Promise<ProvideFeedbackOnEstimateOutput> {
  return provideFeedbackOnEstimateFlow(input);
}

const provideFeedbackOnEstimatePrompt = ai.definePrompt({
  name: 'provideFeedbackOnEstimatePrompt',
  input: {schema: ProvideFeedbackOnEstimateInputSchema},
  output: {schema: ProvideFeedbackOnEstimateOutputSchema},
  prompt: `You are a tutor providing feedback on a numerical estimation question.

  Question: {{{question}}}
  Your estimate: {{{userEstimate}}}
  Correct answer: {{{correctAnswer}}}

  Provide detailed feedback on the estimate. Explain why it was correct or incorrect. Include the correct answer in the feedback. Be encouraging, and provide helpful tips for improving estimation skills.  Focus on the magnitude of error, and give examples for future reference.
  `,
});

const provideFeedbackOnEstimateFlow = ai.defineFlow(
  {
    name: 'provideFeedbackOnEstimateFlow',
    inputSchema: ProvideFeedbackOnEstimateInputSchema,
    outputSchema: ProvideFeedbackOnEstimateOutputSchema,
  },
  async input => {
    const {output} = await provideFeedbackOnEstimatePrompt(input);
    return output!;
  }
);
