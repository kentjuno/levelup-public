
'use client';

import type { QuestPack } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, User } from 'lucide-react';
import { STAT_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface QuestPackPreviewDialogProps {
  pack: QuestPack | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddPack: (packId: string) => void;
}

export default function QuestPackPreviewDialog({ pack, isOpen, onOpenChange, onAddPack }: QuestPackPreviewDialogProps) {
  if (!pack) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{pack.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
             <User className="h-4 w-4" /> by {pack.creatorNickname}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{pack.description}</p>
            <div className="flex flex-wrap gap-2">
                {pack.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
                ))}
            </div>
        </div>
        
        <ScrollArea className="h-[400px] pr-6">
            <Accordion type="multiple" defaultValue={['quest-0']} className="w-full">
                {pack.quests.map((quest, index) => {
                    const categoryInfo = STAT_CATEGORIES.find(c => c.id === quest.exp_category);
                    return (
                        <AccordionItem key={index} value={`quest-${index}`}>
                            <AccordionTrigger>
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-semibold">{quest.title}</span>
                                    {quest.description && <p className="text-xs text-muted-foreground font-normal">{quest.description}</p>}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                     {categoryInfo && (
                                        <Badge variant="outline" className={cn("border-current", categoryInfo.color)}>
                                            <categoryInfo.icon className="mr-1 h-3 w-3" /> {categoryInfo.name}
                                        </Badge>
                                    )}
                                    {quest.exp_value && quest.exp_value > 0 && (
                                        <Badge variant="outline" className="text-green-600 border-green-500">
                                            Bonus: {quest.exp_value} XP
                                        </Badge>
                                    )}
                                </div>
                                
                                <ul className="space-y-2">
                                    {quest.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                                            <span>{task.text}</span>
                                             <Badge variant="outline" className="text-amber-600 border-amber-500 shrink-0">
                                                <Star className="mr-1 h-3 w-3" /> {task.exp_value} XP
                                             </Badge>
                                        </li>
                                    ))}
                                </ul>

                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </ScrollArea>
        
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button type="button" onClick={() => onAddPack(pack.id)}>Add Pack to My Quests</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
