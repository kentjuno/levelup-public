
'use server';

/**
 * @fileOverview Generates a unique, themed weekly boss encounter.
 *
 * - generateWeeklyBoss - A function that creates a weekly boss.
 * - WeeklyBossAiOutput - The output type for the generated boss data.
 */

import {ai} from '@/ai/genkit';
import {nanoid} from 'nanoid';
import {z} from 'genkit';

const AiQuestTaskSchema = z.object({
  id: z.string().optional(),
  text: z.string().describe('A short, actionable description of the thematic task.'),
  exp_value: z.number().int().min(10).max(100).describe('A thematic representation of the task\'s difficulty, not real XP. Between 10 and 100.'),
});

const FlavorQuestSchema = z.object({
    title: z.string().describe("A concise, motivational title for the flavor quest."),
    description: z.string().describe("A brief, one-sentence description of the quest's purpose."),
    exp_category: z.enum(['strength', 'intelligence', 'soul']).describe("The most fitting category for this quest."),
    tasks: z.array(AiQuestTaskSchema).min(3).max(5).describe("A list of 3-5 thematic, repeatable tasks related to the boss."),
    exp_value: z.number().int().min(100).max(500).describe("A thematic bonus reward for completing the entire quest."),
});

const WeeklyBossSchema = z.object({
  title: z.string().describe("A creative and menacing title for the weekly boss, like 'The Procrastination Dragon' or 'The Doomscrolling Hydra'."),
  description: z.string().describe("A thematic, one or two-sentence description of the boss and the challenge it represents."),
  totalHp: z.number().int().min(50000).max(100000).describe("A large health pool for the boss, representing the total community effort required. Between 50,000 and 100,000."),
  taunts: z.array(z.string()).min(3).max(5).describe("A list of 3-5 short, menacing, or funny taunts the boss might say to the player to provoke them."),
  flavorQuest: FlavorQuestSchema.describe("A 'flavor' quest that describes the boss's weaknesses, but is not directly completable by users."),
});
export type WeeklyBossAiOutput = z.infer<typeof WeeklyBossSchema>;

export async function generateWeeklyBoss(): Promise<WeeklyBossAiOutput> {
  return generateWeeklyBossFlow();
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyBossPrompt',
  output: {schema: WeeklyBossSchema},
  prompt: `You are a game designer specializing in creating engaging, metaphorical challenges for a productivity app called LevelUp Life. Your task is to design a unique "Weekly Boss" encounter.

This boss should be a metaphor for a common struggle like procrastination, distraction, or lack of motivation.

Generate a complete boss object with the following properties:

- title: A creative, catchy, and slightly intimidating name for the boss. For example, 'The Procrastination Dragon' or 'The Doomscrolling Hydra'.
- description: A short, thematic description that explains the boss's "mechanics" in a metaphorical sense.
- totalHp: A large health pool value between 50,000 and 100,000. This represents the total community effort needed to defeat it.
- taunts: A list of 3-5 short, thematic, and provocative taunts the boss would say to players.
- flavorQuest: A thematic, non-completable quest object. It should describe how one might fight the boss, and include a title, description, category, a list of 3-5 thematic tasks (with text and exp_value), and a bonus XP value.

The theme must be consistent across all properties. Do not repeat bosses you have created before. Ensure the tasks in the flavorQuest are actions that metaphorically "damage" the boss.`,
});

const generateWeeklyBossFlow = ai.defineFlow(
  {
    name: 'generateWeeklyBossFlow',
    inputSchema: z.void(),
    outputSchema: WeeklyBossSchema,
  },
  async () => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const {output} = await prompt();
        if (output) {
          // Add unique IDs to each task in the flavor quest
          if (output.flavorQuest && output.flavorQuest.tasks) {
            output.flavorQuest.tasks = output.flavorQuest.tasks.map(task => ({
              ...task,
              id: nanoid(), // Add a unique ID
            }));
          }
          return output; // Success
        }
        // If no output, treat as a failure and retry.
        throw new Error('The model returned no output on this attempt.');
      } catch (error) {
        console.error(`Attempt ${i + 1} to generate weekly boss failed: ${(error as Error).message}`);
        if (i === maxRetries - 1) {
          // Last attempt failed, throw a comprehensive error.
          throw new Error(`Failed to generate weekly boss after ${maxRetries} attempts. Last error: ${(error as Error).message}`);
        }
        // Wait 2 seconds before the next retry.
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    // This line should be unreachable if the loop logic is correct.
    throw new Error('Failed to generate weekly boss and exited retry loop unexpectedly.');
  }
);
