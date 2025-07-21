'use client';

import { Gem, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Stats } from '@/lib/types';
import StatsChart from '@/components/profile/stats-chart';

interface XpTrackerProps {
  stats: Stats;
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
}

const XpTracker = ({ stats, totalXp, level, xpInLevel, xpToNextLevel }: XpTrackerProps) => {
  const progressPercentage = xpToNextLevel > 0 ? (xpInLevel / xpToNextLevel) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gem className="text-accent" />
          <span>Your Progress</span>
        </CardTitle>
        <CardDescription>Complete quests to level up!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center font-bold text-lg">
          <span className="text-primary">Level {level}</span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-5 h-5" />
            <span>{totalXp.toLocaleString()} Total XP</span>
          </div>
        </div>
        <div>
          <Progress value={progressPercentage} className="w-full" />
          <div className="text-right text-sm text-muted-foreground mt-1">
            {xpInLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP to next level
          </div>
        </div>
        <div className="pt-2">
            <h4 className="font-semibold mb-2 text-center text-muted-foreground">Stats Distribution</h4>
            <StatsChart stats={stats} />
        </div>
      </CardContent>
    </Card>
  );
};

export default XpTracker;
