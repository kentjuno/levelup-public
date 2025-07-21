'use client';

import Image from 'next/image';
import type { Achievement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock, Unlock } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const AchievementCard = ({ achievement, isUnlocked }: AchievementCardProps) => {
  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Card className={cn("flex flex-col items-center text-center transition-all duration-300", 
                    isUnlocked ? 'border-amber-500/50 shadow-amber-500/10' : 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                )}>
                    <CardHeader className="p-4">
                        <div className="relative">
                            <Image
                                src={achievement.imageUrl}
                                alt={achievement.name}
                                width={80}
                                height={80}
                                data-ai-hint={achievement.aiHint}
                                className="rounded-full border-2 border-muted"
                                unoptimized
                            />
                            <div className={cn("absolute -bottom-1 -right-1 rounded-full p-1.5", isUnlocked ? 'bg-green-500' : 'bg-muted-foreground' )}>
                                {isUnlocked ? <Unlock className="h-4 w-4 text-white" /> : <Lock className="h-4 w-4 text-white" />}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <CardTitle className="text-base font-bold">{achievement.name}</CardTitle>
                        {isUnlocked && <CardDescription className="text-xs mt-1">{achievement.description}</CardDescription>}
                    </CardContent>
                </Card>
            </TooltipTrigger>
            {!isUnlocked && (
                <TooltipContent>
                    <p className="font-bold">{achievement.name}</p>
                    <p className="text-muted-foreground">{achievement.description}</p>
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementCard;
