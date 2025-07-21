

'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronDown, Check, Pencil, Trophy, CalendarClock, CalendarPlus, Trash2, Repeat } from 'lucide-react';
import { format } from 'date-fns';

import type { Quest, Recurrence } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STAT_CATEGORIES } from '@/lib/constants';
import { isQuestActiveOnDay, isCompletedForPeriod } from '@/lib/quests';

interface QuestCardProps {
  quest: Quest;
  onToggleComplete: (questId: string, completed: boolean) => void;
  onToggleTask: (questId:string, taskId: string) => void;
  onOpenEdit: (quest: Quest) => void;
  onDelete: (questId: string) => void;
}

const getRecurrenceText = (recurrence: Recurrence | null | undefined) => {
  if (!recurrence) return "Once";
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  switch (recurrence.type) {
    case 'once': return "Once";
    case 'daily': return "Daily";
    case 'bi-weekly': return "Every 2 Weeks";
    case 'monthly': return "Monthly";
    case 'days_of_week':
      if (!recurrence.days || recurrence.days.length === 0) return "Specific Days";
      if (recurrence.days.length === 7) return "Daily";
      if (recurrence.days.length === 2 && recurrence.days.includes(0) && recurrence.days.includes(6)) return "Weekends";
      if (recurrence.days.length === 5 && !recurrence.days.includes(0) && !recurrence.days.includes(6)) return "Weekdays";
      return recurrence.days.sort().map(d => days[d]).join(', ');
    default: return "Once";
  }
}

const QuestCard = ({ quest, onToggleComplete, onToggleTask, onOpenEdit, onDelete }: QuestCardProps) => {
  const categoryInfo = STAT_CATEGORIES.find(c => c.id === quest.exp_category);
  const tasks = Array.isArray(quest.tasks) ? quest.tasks : [];
  const hasTasks = tasks.length > 0;
  
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCompletedRef = useRef(quest.completed);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(item => isCompletedForPeriod(item.lastCompleted, quest.recurrence)).length;
  
  useEffect(() => {
    if (quest.completed && !prevCompletedRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600); 
      return () => clearTimeout(timer);
    }
    prevCompletedRef.current = quest.completed;
  }, [quest.completed]);
  
  const recurrenceText = getRecurrenceText(quest.recurrence);

  return (
    <Card className={cn('transition-all', quest.completed ? 'bg-muted/50' : 'bg-card', isAnimating && 'animate-task-complete')}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <div className="mt-1">
          <Checkbox
            id={`quest-${quest.id}`}
            checked={quest.completed}
            onCheckedChange={checked => onToggleComplete(quest.id, !!checked)}
            aria-label={`Mark quest ${quest.title} as permanently ${quest.completed ? 'active' : 'complete'}`}
          />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className={cn('text-lg', quest.completed && 'line-through text-muted-foreground')}>
                {quest.title}
              </CardTitle>
              {quest.description && (
                <CardDescription className={cn(quest.completed && 'line-through')}>
                  {quest.description}
                </CardDescription>
              )}
            </div>
             <div className="flex shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onOpenEdit(quest)} disabled={quest.completed}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Quest</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(quest.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Quest</span>
                </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
             {quest.exp_value && !hasTasks ? (
                <Badge variant="outline" className="text-amber-600 border-amber-500">
                  <Star className="mr-1 h-3 w-3" /> {quest.exp_value} XP
                </Badge>
             ) : quest.exp_value && quest.exp_value > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-500">
                    <Trophy className="mr-1 h-3 w-3" /> Bonus: {quest.exp_value} XP
                </Badge>
             ) : null}
            {categoryInfo && (
               <Badge variant="outline" className={cn("border-current", categoryInfo.color)}>
                 <categoryInfo.icon className="mr-1 h-3 w-3" /> {categoryInfo.name}
              </Badge>
            )}
            {hasTasks && (
                <Badge variant="secondary">
                    <Check className="mr-1 h-3 w-3" /> {completedTasks}/{totalTasks} Done
                </Badge>
            )}
             <Badge variant="secondary">
              <Repeat className="mr-1 h-3 w-3" /> {recurrenceText}
            </Badge>
            {quest.start_date && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <CalendarPlus className="mr-1 h-3 w-3" />
                Starts: {format(new Date(quest.start_date), 'MMM d')}
              </Badge>
            )}
            {quest.due_date && (
              <Badge variant="secondary">
                <CalendarClock className="mr-1 h-3 w-3" />
                Due: {format(new Date(quest.due_date), 'MMM d')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {hasTasks && (
        <CardContent className="p-0 px-4 pb-4">
          <Accordion type="single" collapsible defaultValue="tasks" className="w-full">
            <AccordionItem value="tasks" className="border-none">
              <AccordionTrigger className="text-sm py-1 justify-start gap-1 hover:no-underline data-[state=open]:text-primary">
                <span>Tasks</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="pt-2 pl-4 space-y-2">
                {tasks.map(item => {
                  const isCompleted = isCompletedForPeriod(item.lastCompleted, quest.recurrence);
                  const isActionable = !isCompleted && isQuestActiveOnDay(quest, new Date());
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 pr-2">
                      <div className="flex items-center gap-3">
                          <Checkbox
                          id={`task-${item.id}`}
                          checked={isCompleted}
                          onCheckedChange={() => onToggleTask(quest.id, item.id)}
                          aria-label={item.text}
                          disabled={quest.completed || !isActionable}
                          />
                          <label
                          htmlFor={`task-${item.id}`}
                          className={cn(
                              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                              (isCompleted || quest.completed) && 'line-through text-muted-foreground',
                              !isActionable && !isCompleted && 'text-muted-foreground/50 italic'
                          )}
                          >
                          {item.text}
                          </label>
                      </div>
                       <Badge variant="outline" className="text-amber-600 border-amber-500 shrink-0">
                          <Star className="mr-1 h-3 w-3" /> {item.exp_value} XP
                      </Badge>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
};

export default QuestCard;
