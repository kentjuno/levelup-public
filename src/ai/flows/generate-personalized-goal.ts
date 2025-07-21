'use server';

/**
 * @fileOverview Generates personalized habit and goal suggestions based on user-specified parameters, incorporating psychological best practices.
 *
 * - generatePersonalizedGoal - A function that generates personalized goal suggestions.
 * - GeneratePersonalizedGoalInput - The input type for the generatePersonalizedGoal function.
 * - GeneratePersonalizedGoalOutput - The output type for the generatePersonalizedGoal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getCost} from './get-cost-flow';
import {trackUsage} from '@/services/usage';
import type {StatCategory} from '@/lib/types';

const GeneratePersonalizedGoalInputSchema = z.object({
  goalType: z
    .string()
    .describe('The type of goal (e.g., fitness, productivity, learning).'),
  goalDescription: z
    .string()
    .describe('A detailed description of the goal and desired outcomes.'),
  currentHabits: z
    .string()
    .describe('Description of current habits related to the goal.'),
  timeCommitment: z
    .string()
    .describe(
      'The amount of time the user is willing to commit to this goal daily/weekly.'
    ),
  motivation: z
    .string()
    .describe('The users motivation for achieving this goal.'),
});
export type GeneratePersonalizedGoalInput = z.infer<
  typeof GeneratePersonalizedGoalInputSchema
>;

const AiQuestTaskSchema = z.object({
  text: z.string().describe('A short, actionable description of the repeatable task.'),
  exp_value: z.number().int().min(5).max(50).describe('The XP value for completing this task, between 5 and 50.'),
});

const AiQuestSchema = z.object({
  title: z.string().describe("A concise, motivational title for the quest."),
  description: z.string().describe("A brief, one-sentence description of the quest's purpose."),
  exp_category: z.enum(['strength', 'intelligence', 'soul']).describe("The most fitting category for this quest."),
  exp_value: z.number().int().min(10).max(100).describe("Bonus XP for completing the entire quest, between 10 and 100."),
  tasks: z.array(AiQuestTaskSchema).min(2).max(5).describe("A list of 2-5 repeatable tasks to achieve the quest.")
});
export type AiQuest = z.infer<typeof AiQuestSchema>;


const PromptOutputSchema = z.object({
  quest: AiQuestSchema.describe("The structured quest object that the user can add to their log."),
  potentialObstacles: z
    .string()
    .describe('A markdown list of possible obstacles that may prevent the user from achieving goal.'),
  solutions: z
    .string()
    .describe('A markdown list of solutions to overcome potential obstacles.'),
});

const GeneratePersonalizedGoalOutputSchema = PromptOutputSchema.extend({
  cost: z.number().describe('The estimated cost of this generation in USD.'),
});
export type GeneratePersonalizedGoalOutput = z.infer<
  typeof GeneratePersonalizedGoalOutputSchema
>;

export async function generatePersonalizedGoal(
  input: GeneratePersonalizedGoalInput
): Promise<GeneratePersonalizedGoalOutput> {
  return generatePersonalizedGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedGoalPrompt',
  input: {schema: GeneratePersonalizedGoalInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an expert habit and goal formation coach, skilled in psychology. Your task is to convert user aspirations into a structured, actionable quest.

Based on the user's input, provide:

1.  A structured Quest object. This quest should be a specific, measurable, achievable, relevant, and time-bound (SMART) goal. It must contain:
    *   A motivational \`title\`.
    *   A short \`description\`.
    *   The most appropriate \`exp_category\` ('strength', 'intelligence', 'soul').
    *   A bonus \`exp_value\` for completing the whole quest.
    *   An array of 2 to 5 repeatable \`tasks\`, each with its own \`text\` description and \`exp_value\`.
2.  A markdown-formatted list of potential \`potentialObstacles\`.
3.  A markdown-formatted list of \`solutions\` to overcome those obstacles.

Align your suggestions with the user's current habits and time commitment.

Here is the user's information:

Goal Type: {{{goalType}}}
Goal Description: {{{goalDescription}}}
Current Habits: {{{currentHabits}}}
Time Commitment: {{{timeCommitment}}}
Motivation: {{{motivation}}}`,
});

const generatePersonalizedGoalFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedGoalFlow',
    inputSchema: GeneratePersonalizedGoalInputSchema,
    outputSchema: GeneratePersonalizedGoalOutputSchema,
  },
  async input => {
    const {output, usage} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate goal. No output received.');
    }

    const inputCharacters = usage.input?.characters ?? 0;
    const outputCharacters = usage.output?.characters ?? 0;

    const cost = getCost({inputCharacters, outputCharacters});
    await trackUsage(cost);

    return {
      ...output,
      cost,
    };
  }
);
