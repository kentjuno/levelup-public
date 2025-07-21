'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { createQuestPack } from '@/services/firestoreService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { STAT_CATEGORIES } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const taskSchema = z.object({
  text: z.string().min(1, 'Task description is required.'),
  exp_value: z.coerce.number().min(1, 'XP must be at least 1.').max(100, 'Max XP per task is 100.'),
});

const questSchema = z.object({
  title: z.string().min(3, 'Quest title is required.'),
  description: z.string().optional(),
  exp_category: z.enum(['strength', 'intelligence', 'soul']),
  exp_value: z.coerce.number().min(0).max(500, 'Max bonus XP is 500.').optional(),
  tasks: z.array(taskSchema).max(5, 'A quest can have at most 5 tasks.'),
});

const questPackSchema = z.object({
  title: z.string().min(5, 'Pack title must be at least 5 characters.'),
  description: z.string().min(10, 'Pack description must be at least 10 characters.'),
  tags: z.string().refine(val => !val || val.split(',').every(tag => tag.trim().length > 0), {
    message: "Tags must be a comma-separated list of words."
  }).optional(),
  quests: z.array(questSchema).min(1, 'A pack must have at least one quest.'),
});

type QuestPackFormValues = z.infer<typeof questPackSchema>;

export default function CreateQuestPackForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestPackFormValues>({
    resolver: zodResolver(questPackSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      quests: [{
        title: '',
        description: '',
        exp_category: 'soul',
        exp_value: 10,
        tasks: [{ text: '', exp_value: 10 }]
      }],
    },
  });

  const { fields: questFields, append: appendQuest, remove: removeQuest } = useFieldArray({
    control: form.control,
    name: 'quests',
  });

  const onSubmit = async (data: QuestPackFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const packData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim().toLowerCase()) : [],
      };
      await createQuestPack(user.uid, packData);
      toast({
        title: 'Quest Pack Created!',
        description: `Your pack "${data.title}" is now live in the workshop.`,
      });
      router.push('/workshop');
    } catch (error) {
      console.error("Failed to create quest pack:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create your quest pack.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Quest Pack</CardTitle>
        <CardDescription>
          Design a set of quests and tasks that others can use to improve themselves.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pack Title</FormLabel>
                    <FormControl><Input placeholder="e.g., The Stoic's Daily Routine" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pack Description</FormLabel>
                    <FormControl><Textarea placeholder="A brief summary of what this pack is about." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl><Input placeholder="productivity, fitness, mindfulness" {...field} /></FormControl>
                    <FormDescription>Comma-separated list of tags.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel className="text-base font-semibold">Quests in this Pack</FormLabel>
              <Accordion type="multiple" defaultValue={['quest-0']} className="w-full">
                {questFields.map((field, index) => (
                  <QuestFormFields key={field.id} form={form} questIndex={index} removeQuest={removeQuest} />
                ))}
              </Accordion>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendQuest({ title: '', description: '', exp_category: 'soul', exp_value: 10, tasks: [] })}>
                <PlusCircle className="mr-2" /> Add Another Quest
              </Button>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              Publish Quest Pack
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Sub-component for a single quest's form fields
function QuestFormFields({ form, questIndex, removeQuest }: { form: any, questIndex: number, removeQuest: (index: number) => void }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `quests.${questIndex}.tasks`,
  });

  return (
    <AccordionItem value={`quest-${questIndex}`}>
      <div className="flex items-center">
        <AccordionTrigger className="flex-1">
          <span className="truncate">Quest {questIndex + 1}: {form.watch(`quests.${questIndex}.title`) || 'New Quest'}</span>
        </AccordionTrigger>
        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuest(questIndex)}><Trash2 className="text-destructive" /></Button>
      </div>
      <AccordionContent className="space-y-4 pt-2 border-t mt-2">
        <FormField control={form.control} name={`quests.${questIndex}.title`} render={({ field }) => (
          <FormItem><FormLabel>Quest Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Read a chapter" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name={`quests.${questIndex}.description`} render={({ field }) => (
          <FormItem><FormLabel>Quest Description</FormLabel><FormControl><Input {...field} placeholder="Optional: add more details" /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name={`quests.${questIndex}.exp_category`} render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{STAT_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name={`quests.${questIndex}.exp_value`} render={({ field }) => (
            <FormItem><FormLabel>Bonus XP</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 50" /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="space-y-2">
          <FormLabel>Tasks for this Quest</FormLabel>
          {fields.map((field, taskIndex) => (
            <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
              <FormField control={form.control} name={`quests.${questIndex}.tasks.${taskIndex}.text`} render={({ field }) => (
                <FormItem className="flex-1"><FormLabel className="sr-only">Task</FormLabel><FormControl><Input {...field} placeholder="e.g., Read for 20 minutes" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`quests.${questIndex}.tasks.${taskIndex}.exp_value`} render={({ field }) => (
                <FormItem className="w-24"><FormLabel className="sr-only">XP</FormLabel><FormControl><Input type="number" {...field} placeholder="XP" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(taskIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', exp_value: 10 })}>
            <PlusCircle className="mr-2" /> Add Task
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
