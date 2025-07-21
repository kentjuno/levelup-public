'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2, Sparkles, ChevronDown, History, Star, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';

import {
  type GeneratePersonalizedGoalOutput,
  type GeneratePersonalizedGoalInput,
  type AiQuest,
} from '@/ai/flows/generate-personalized-goal';
import type { Quest, AiSuggestion } from '@/lib/types';
import { STAT_CATEGORIES } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { AI_COACH_CREDIT_COST } from '@/lib/constants';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const goalSuggesterSchema = z.object({
  goalType: z.string().min(3, 'Please specify a goal type.'),
  goalDescription: z.string().min(10, 'Please describe your goal in more detail.'),
  currentHabits: z.string().min(5, 'Please describe your current habits.'),
  timeCommitment: z.string().min(3, 'Please specify your time commitment.'),
  motivation: z.string().min(5, 'What is your motivation for this goal?'),
});

type GoalSuggesterFormValues = z.infer<typeof goalSuggesterSchema>;

interface GoalSuggesterProps {
  credits: number;
  history: AiSuggestion[];
  onGenerate: (data: GeneratePersonalizedGoalInput) => Promise<GeneratePersonalizedGoalOutput | null>;
  onAddQuest: (questData: Omit<Quest, 'id' | 'completed' | 'created_at'>) => void;
}

const GoalSuggester = ({ credits, history, onGenerate, onAddQuest }: GoalSuggesterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratePersonalizedGoalOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<GoalSuggesterFormValues>({
    resolver: zodResolver(goalSuggesterSchema),
    defaultValues: {
      goalType: 'Fitness',
      goalDescription: 'I want to be more active and lose some weight.',
      currentHabits: 'I walk my dog daily but mostly have a sedentary job.',
      timeCommitment: '30-45 minutes per day, 4 times a week.',
      motivation: 'To feel healthier and have more energy.',
    },
  });

  const onSubmit = async (data: GoalSuggesterFormValues) => {
    setIsLoading(true);
    setResult(null);
    const response = await onGenerate(data);
    if (response) {
      setResult(response);
    }
    setIsLoading(false);
  };

  const handleAddGeneratedQuest = () => {
    if (!result || !result.quest) return;
    
    const questToAdd: Omit<Quest, 'id' | 'completed' | 'created_at'> = {
      ...result.quest,
      tasks: result.quest.tasks.map(task => ({
        ...task,
        id: nanoid(),
        lastCompleted: null,
      })),
    };
    
    onAddQuest(questToAdd);
    toast({
      title: 'Quest Added!',
      description: `The quest "${questToAdd.title}" is now in your log.`,
    })
    setResult(null); 
  };
  
  const QuestResultDisplay = ({ quest }: { quest: AiQuest }) => {
    const categoryInfo = STAT_CATEGORIES.find(c => c.id === quest.exp_category);
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{quest.title}</h3>
          <p className="text-sm text-muted-foreground">{quest.description}</p>
        </div>
         <div className="flex flex-wrap gap-2">
            {categoryInfo && (
               <Badge variant="outline" className={cn("border-current", categoryInfo.color)}>
                 <categoryInfo.icon className="mr-1 h-3 w-3" /> {categoryInfo.name}
              </Badge>
            )}
            <Badge variant="secondary">Bonus: {quest.exp_value} XP</Badge>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Suggested Daily Tasks:</h4>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {quest.tasks.map((task, index) => (
              <li key={index} className="text-sm flex justify-between items-center">
                <span>{task.text}</span>
                <Badge variant="outline" className="text-amber-600 border-amber-500 shrink-0">
                  <Star className="mr-1 h-3 w-3" /> {task.exp_value} XP
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={handleAddGeneratedQuest} className="w-full">
            <Plus className="mr-2" /> Add to My Quests
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          <span>AI Goal Coach</span>
        </CardTitle>
        <CardDescription>
          Get personalized, actionable goals. Costs {AI_COACH_CREDIT_COST} credits per use. You have {credits} credits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fitness, Learning, Productivity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goalDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what you want to achieve." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentHabits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Habits</FormLabel>
                    <FormControl>
                      <Input placeholder="What are your related habits now?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Commitment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 30 mins daily" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your "Why"</FormLabel>
                    <FormControl>
                      <Input placeholder="What's driving you?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || credits < AI_COACH_CREDIT_COST} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Goal ({AI_COACH_CREDIT_COST} Credits)
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
        {result && (
          <div className="space-y-4 animate-in fade-in-50">
             <QuestResultDisplay quest={result.quest} />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Potential Obstacles</AccordionTrigger>
                <AccordionContent>
                    <div
                        className="prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: result.potentialObstacles.replace(/\n/g, '<br />') }}
                    />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">Solutions</AccordionTrigger>
                <AccordionContent>
                    <div
                        className="prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: result.solutions.replace(/\n/g, '<br />') }}
                    />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Button onClick={() => setResult(null)} variant="outline" className="w-full">
              Ask Again
            </Button>
          </div>
        )}
         <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="history">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Generation History
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    {history.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {history.map((item) => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className="w-full justify-start h-auto py-2"
                                    onClick={() => setResult(item)}
                                >
                                    <span className="truncate text-left whitespace-normal">{item.quest.title}</span>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No history yet.</p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
      {result && (
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Generation Cost: ${result.cost.toFixed(6)}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default GoalSuggester;
