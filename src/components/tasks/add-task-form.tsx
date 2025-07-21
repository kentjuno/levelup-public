

'use client';

import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { nanoid } from 'nanoid';
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Quest, RecurrenceType, UserTier, TierSettings } from '@/lib/types';
import { STAT_CATEGORIES, MAX_TASKS_PER_QUEST } from '@/lib/constants';

const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Task description cannot be empty.'),
  lastCompleted: z.string().nullable(),
  exp_value: z.coerce.number().min(1, 'XP must be at least 1.').max(500, 'Max XP is 500.'),
});

const recurrenceSchema = z.object({
  type: z.enum(['once', 'daily', 'bi-weekly', 'monthly', 'days_of_week']),
  days: z.array(z.number().min(0).max(6)).optional(),
}).nullable();

const questFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  exp_category: z.enum(['strength', 'intelligence', 'soul'], {
    required_error: 'You must select a category.',
  }),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  tasks: z.array(taskSchema).optional(),
  exp_value: z.coerce.number().min(0, 'XP must be non-negative.').max(500, 'Max XP is 500.').optional(),
  recurrence: recurrenceSchema,
});

type QuestFormValues = z.infer<typeof questFormSchema>;

interface AddQuestFormProps {
  onAddQuest: (questData: Omit<Quest, 'id' | 'completed' | 'created_at'>) => void;
  onUpdateQuest: (questData: Quest) => void;
  questToEdit?: Quest | null;
  tier: UserTier;
  tierSettings: TierSettings | null;
}

const recurrenceOptions: {value: RecurrenceType, label: string}[] = [
    { value: 'once', label: 'Once (One-time tasks)' },
    { value: 'daily', label: 'Daily' },
    { value: 'bi-weekly', label: 'Every 2 Weeks' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'days_of_week', label: 'Specific Days of Week' },
];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const AddQuestForm = ({ onAddQuest, onUpdateQuest, questToEdit, tier, tierSettings }: AddQuestFormProps) => {
  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: questToEdit
      ? {
          title: questToEdit.title,
          description: questToEdit.description ?? '',
          exp_category: questToEdit.exp_category,
          exp_value: questToEdit.exp_value ?? 10,
          tasks: questToEdit.tasks ?? [],
          start_date: questToEdit.start_date ? new Date(questToEdit.start_date) : new Date(),
          due_date: questToEdit.due_date ? new Date(questToEdit.due_date) : undefined,
          recurrence: questToEdit.recurrence ?? { type: 'daily' },
        }
      : {
          title: '',
          description: '',
          exp_category: 'soul',
          exp_value: 10,
          tasks: [],
          start_date: new Date(),
          due_date: undefined,
          recurrence: { type: 'daily' },
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  const taskLimit = tierSettings?.[tier]?.taskLimitPerQuest ?? MAX_TASKS_PER_QUEST;
  const canAddTask = fields.length < taskLimit;

  const watchedTasks = form.watch('tasks');
  const watchedRecurrenceType = form.watch('recurrence.type');
  const hasTasks = watchedTasks && watchedTasks.length > 0;

  const onSubmit = (data: QuestFormValues) => {
    // If recurrence is not 'days_of_week', ensure the 'days' array is not present.
    const recurrencePayload = data.recurrence?.type === 'days_of_week' 
      ? data.recurrence 
      : (data.recurrence ? { type: data.recurrence.type } : null);

    const questPayload = {
      ...data,
      start_date: data.start_date ? data.start_date.toISOString() : null,
      due_date: data.due_date ? data.due_date.toISOString() : null,
      recurrence: recurrencePayload,
    };

    if (questToEdit) {
      onUpdateQuest({ ...questToEdit, ...questPayload });
    } else {
      onAddQuest(questPayload);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Conquer the Morning Run" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add details about your quest..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="exp_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STAT_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="recurrence.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? 'daily'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select how often tasks repeat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {recurrenceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchedRecurrenceType === 'days_of_week' && (
          <FormField
            control={form.control}
            name="recurrence.days"
            render={({ field }) => (
              <FormItem>
                <FormDescription>Select the days this quest is active.</FormDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  {daysOfWeek.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={field.value?.includes(index) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const currentDays = field.value || [];
                        const newDays = currentDays.includes(index)
                          ? currentDays.filter(d => d !== index)
                          : [...currentDays, index];
                        field.onChange(newDays.sort());
                      }}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel className="mb-2">Start Date</FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel className="mb-2">Due Date (Optional)</FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < (form.getValues('start_date') || new Date(new Date().setHours(0,0,0,0)))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="exp_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{hasTasks ? 'Quest Completion Bonus XP' : 'XP Reward'}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {hasTasks
                  ? "Bonus XP awarded when the entire quest is marked as complete."
                  : "XP for completing this one-time quest."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Repeatable Tasks</FormLabel>
          <FormDescription>
            Break your quest into smaller tasks. XP is awarded per task based on recurrence.
          </FormDescription>
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                <FormField
                  control={form.control}
                  name={`tasks.${index}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs sr-only">Task Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Run for 20 minutes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tasks.${index}.exp_value`}
                  render={({ field }) => (
                    <FormItem className="w-20">
                      <FormLabel className="text-xs sr-only">XP</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove Task</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ id: nanoid(), text: '', exp_value: 10, lastCompleted: null })}
              disabled={!canAddTask}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            {!canAddTask && (
              <p className="text-xs text-muted-foreground pt-1 pl-1">
                Limit of {taskLimit} tasks per quest for your tier.
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full">
          {questToEdit ? 'Save Changes' : 'Add Quest'}
        </Button>
      </form>
    </FormProvider>
  );
};

export default AddQuestForm;
