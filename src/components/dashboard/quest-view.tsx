'use client';

import { useState, useMemo } from 'react';
import { ListTodo, ListChecks, History } from 'lucide-react';
import type { Quest } from '@/lib/types';
import { isQuestActiveOnDay } from '@/lib/quests';
import QuestCard from '@/components/tasks/task-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MotivationalQuote from './motivational-quote';

interface QuestViewProps {
  quests: Quest[];
  onToggleComplete: (questId: string, completed: boolean) => void;
  onToggleTask: (questId: string, taskId: string) => void;
  onOpenEdit: (quest: Quest) => void;
  onDelete: (questId: string) => void;
}

const QuestView = ({ quests, onToggleComplete, onToggleTask, onOpenEdit, onDelete }: QuestViewProps) => {

  const { todayQuests, allActiveQuests, completedQuests } = useMemo(() => {
    const today = new Date();
    const todayQuests = quests.filter(q => !q.completed && isQuestActiveOnDay(q, today));
    const allActiveQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);
    return { todayQuests, allActiveQuests, completedQuests };
  }, [quests]);
  
  const renderQuestList = (questList: Quest[]) => {
    if (questList.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No quests here. Time to add one!</p>;
    }
    return (
      <div className="space-y-4">
        {questList.map(quest => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onToggleComplete={onToggleComplete}
            onToggleTask={onToggleTask}
            onOpenEdit={onOpenEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <MotivationalQuote />
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">
            <ListTodo className="mr-2" /> Today ({todayQuests.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            <ListChecks className="mr-2" /> All Active ({allActiveQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <History className="mr-2" /> Completed ({completedQuests.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          {renderQuestList(todayQuests)}
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          {renderQuestList(allActiveQuests)}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderQuestList(completedQuests)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestView;
