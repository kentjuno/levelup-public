
'use client';

import { formatDistanceToNow } from 'date-fns';
import { BookCheck, CheckSquare, List, Star } from 'lucide-react';

import type { ActivityLogEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ActivityLogCardProps {
  activities: ActivityLogEntry[];
  isLoading: boolean;
}

const iconMap: Record<ActivityLogEntry['type'], React.ElementType> = {
  TASK_COMPLETED: CheckSquare,
  QUEST_COMPLETED: BookCheck,
  HP_LOST: CheckSquare, // Using same icon for now, could be changed
};

const ActivityLogCard = ({ activities, isLoading }: ActivityLogCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><List /> Recent Activity</CardTitle>
        <CardDescription>A log of your latest accomplishments.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : activities.length > 0 ? (
          <ScrollArea className="h-72 pr-4">
            <ul className="space-y-4">
              {activities.map(entry => {
                const Icon = iconMap[entry.type] || List;
                const message = entry.type === 'QUEST_COMPLETED' 
                    ? `Completed quest: "${entry.details.questTitle}"`
                    : `Completed task: "${entry.details.taskText}"`;

                return (
                  <li key={entry.id} className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{message}</p>
                        {entry.details.xp && entry.details.xp > 0 && (
                            <Badge variant="outline" className="text-amber-600 border-amber-500 shrink-0">
                                <Star className="mr-1 h-3 w-3" /> +{entry.details.xp} XP
                            </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-8">No recent activity to show.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogCard;
