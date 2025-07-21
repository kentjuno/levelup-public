
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Zap, Heart, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlayerStatusProps {
  nickname: string;
  level: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
}

export default function PlayerStatus({ nickname, level, hp, maxHp, energy, maxEnergy }: PlayerStatusProps) {
  const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const energyPercentage = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;

  return (
    <Card className="fixed top-20 left-4 z-50 hidden w-72 md:block">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          <Link href="/profile">
              <Avatar className="h-14 w-14 cursor-pointer">
                  <AvatarFallback className="text-xl">
                      {nickname ? nickname.charAt(0).toUpperCase() : <User />}
                  </AvatarFallback>
              </Avatar>
          </Link>
          <div className="w-full overflow-hidden">
              <CardTitle className="truncate text-xl">{nickname}</CardTitle>
              <p className="text-sm font-bold text-primary">Level {level}</p>
          </div>
      </CardHeader>
      <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5" title="Health Points">
                  <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div className="w-full">
                      <Progress value={hpPercentage} className="h-2 [&>div]:bg-red-500" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{hp}/{maxHp}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Energy">
                  <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <div className="w-full">
                      <Progress value={energyPercentage} className="h-2" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{energy}/{maxEnergy}</span>
              </div>
          </div>
      </CardContent>
    </Card>
  );
}
