
'use client';

import type { Quest } from '@/lib/types';
import { differenceInDays, isToday, startOfDay, isWithinInterval } from 'date-fns';
import { AlertTriangle, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UpcomingTasksCardProps {
  allActiveQuests: Quest[];
  todayQuests: Quest[];
}

const UpcomingTasksCard = ({ allActiveQuests, todayQuests }: UpcomingTasksCardProps) => {
  const today = startOfDay(new Date());

  const upcomingDeadlines = allActiveQuests
    .filter(quest => {
      if (!quest.due_date) return false;
      const dueDate = startOfDay(new Date(quest.due_date));
      // Check if due date is today or in the next 3 days
      return isWithinInterval(dueDate, { start: today, end: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) });
    })
    .map(quest => ({
      ...quest,
      daysLeft: differenceInDays(new Date(quest.due_date!), today),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const tasksDueToday = todayQuests.flatMap(quest => 
    (quest.tasks ?? [])
      .filter(task => {
        const lastCompleted = task.lastCompleted ? startOfDay(new Date(task.lastCompleted)) : null;
        // Task is due if it wasn't completed today
        return !lastCompleted || !isToday(lastCompleted);
      })
      .map(task => ({ ...task, questTitle: quest.title, questId: quest.id }))
  );

  if (upcomingDeadlines.length === 0 && tasksDueToday.length === 0) {
    return null; // Don't render the card if there's nothing to show
  }

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-accent-foreground/90">
          <ListChecks />
          Heads Up!
        </CardTitle>
        <CardDescription>
          Here's what's on your plate for today and the near future.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center text-sm font-semibold">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              Approaching Deadlines
            </h4>
            <ul className="space-y-1.5 text-sm">
              {upcomingDeadlines.map(quest => (
                <li key={quest.id} className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground truncate">{quest.title}</span>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 shrink-0">
                    {quest.daysLeft <= 0 ? 'Due Today' : `Due in ${quest.daysLeft}d`}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {upcomingDeadlines.length > 0 && tasksDueToday.length > 0 && <Separator />}

        {tasksDueToday.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Incomplete Tasks for Today</h4>
            <ul className="space-y-1.5 text-sm">
              {tasksDueToday.slice(0, 3).map(task => ( // Limit to 3 for brevity
                <li key={task.id} className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground truncate">{task.text}</span>
                  <span className="text-xs text-muted-foreground/80 truncate shrink-0 pl-2">from "{task.questTitle}"</span>
                </li>
              ))}
               {tasksDueToday.length > 3 && (
                 <li className="text-xs text-muted-foreground text-center pt-1">
                    ...and {tasksDueToday.length - 3} more.
                </li>
               )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksCard;
