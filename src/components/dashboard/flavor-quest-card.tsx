'use client';

import { Star, Dices } from 'lucide-react';

import type { Quest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STAT_CATEGORIES } from '@/lib/constants';

interface FlavorQuestCardProps {
  quest: Quest['flavorQuest'];
  completedTasks: string[];
  onToggleTask: (taskId: string, damage: number) => void;
}

const FlavorQuestCard = ({ quest, completedTasks, onToggleTask }: FlavorQuestCardProps) => {
  if (!quest) return null;

  const categoryInfo = STAT_CATEGORIES.find(c => c.id === quest.exp_category);
  const tasks = Array.isArray(quest.tasks) ? quest.tasks : [];

  return (
    <Card className={cn('transition-all border-dashed border-primary/50 bg-primary/5 shadow-inner')}>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-primary">
            <Dices />
            {quest.title}
        </CardTitle>
        <CardDescription>
          {quest.description}
        </CardDescription>
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {categoryInfo && (
            <Badge variant="outline" className={cn("border-current", categoryInfo.color)}>
              <categoryInfo.icon className="mr-1 h-3 w-3" /> {categoryInfo.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Exploit Weaknesses (Deals Bonus Damage)</h4>
        <div className="space-y-2">
            {tasks.map(item => {
                const isCompleted = completedTasks.includes(item.id);
                return (
                <div key={item.id} className="flex items-center justify-between gap-3 pr-2">
                    <div className="flex items-center gap-3">
                        <Checkbox
                        id={`flavor-task-${item.id}`}
                        checked={isCompleted}
                        onCheckedChange={() => onToggleTask(item.id, item.exp_value)}
                        aria-label={item.text}
                        disabled={isCompleted}
                        />
                        <label
                        htmlFor={`flavor-task-${item.id}`}
                        className={cn(
                            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                            isCompleted && 'line-through text-muted-foreground'
                        )}
                        >
                        {item.text}
                        </label>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-500 shrink-0">
                        <Star className="mr-1 h-3 w-3" /> +{item.exp_value} Damage
                    </Badge>
                </div>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlavorQuestCard;
