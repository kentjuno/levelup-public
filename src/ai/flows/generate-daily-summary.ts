'use server';
/**
 * @fileOverview Generates a daily summary and motivational message for the user.
 *
 * - generateDailySummary - A function that generates a personalized daily summary.
 * - GenerateDailySummaryInput - The input type for the function.
 * - GenerateDailySummaryOutput - The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { GenerateDailySummaryInput, GenerateDailySummaryOutput } from '@/lib/types';

const GenerateDailySummaryInputSchema = z.object({
  nickname: z.string().describe("The user's nickname."),
  tasksCompleted: z.number().int().describe('The number of tasks the user completed yesterday.'),
  questsCompleted: z.number().int().describe('The number of quests the user completed yesterday.'),
  xpEarned: z.number().int().describe('The total XP the user earned yesterday.'),
  tasksMissed: z.number().int().describe('The number of tasks the user missed yesterday.'),
  hpLost: z.number().int().describe('The amount of HP the user lost from missed tasks.'),
});

const GenerateDailySummaryOutputSchema = z.object({
  title: z.string().describe('A cheerful, short title for the summary card. e.g., "Yesterday\'s Recap!" or "Great Job, [Nickname]!"'),
  message: z.string().describe("A friendly and motivational summary of the user's accomplishments yesterday. Address them by their nickname. Use markdown for formatting. If they did nothing, provide a gentle encouragement for the new day."),
});

async function generateDailySummary(
  input: GenerateDailySummaryInput
): Promise<GenerateDailySummaryOutput> {
  return generateDailySummaryFlow(input);
}
export { generateDailySummary, type GenerateDailySummaryInput, type GenerateDailySummaryOutput };


const prompt = ai.definePrompt({
  name: 'generateDailySummaryPrompt',
  input: { schema: GenerateDailySummaryInputSchema },
  output: { schema: GenerateDailySummaryOutputSchema },
  prompt: `You are a cheerful and encouraging coach in a gamified productivity app called LevelUp Life.
Your task is to generate a daily summary for the user, {{{nickname}}}, based on their accomplishments from yesterday.

The summary should be positive and motivational. Address the user directly by their nickname.
Use markdown for light formatting (like bolding numbers).

- If the user accomplished things, congratulate them.
- If the user missed tasks and lost HP, acknowledge it gently and provide encouragement to bounce back today. Frame it as a challenge, not a failure.
- If the user did nothing (all stats are 0), provide a gentle and encouraging message for the new day, without being judgmental. For example, "A new day is a new opportunity!".

User's stats from yesterday:
- Tasks Completed: {{{tasksCompleted}}}
- Quests Completed: {{{questsCompleted}}}
- XP Earned: {{{xpEarned}}}
- Tasks Missed: {{{tasksMissed}}}
- HP Lost: {{{hpLost}}}
`,
});

const generateDailySummaryFlow = ai.defineFlow(
  {
    name: 'generateDailySummaryFlow',
    inputSchema: GenerateDailySummaryInputSchema,
    outputSchema: GenerateDailySummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate daily summary.');
    }
    return output;
  }
);
