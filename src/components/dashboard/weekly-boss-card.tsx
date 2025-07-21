
'use client';

import { Swords, Loader2, Award, Timer, ShieldCheck, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import type { WeeklyBoss, UserBossContribution } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { ENERGY_REGEN_MINUTES } from '@/lib/constants';

interface WeeklyBossCardProps {
  boss: WeeklyBoss;
  contribution: UserBossContribution | null;
  pendingDamage: number;
  pendingHitCount: number;
  isAttacking: boolean;
  onAttack: () => Promise<void>;
  isClaimable: boolean;
  isClaiming: boolean;
  onClaimRewards: () => void;
  currentEnergy: number;
  maxEnergy: number;
  lastEnergyRefill: string | null;
}

export default function WeeklyBossCard({ 
  boss, 
  contribution,
  pendingDamage,
  pendingHitCount, 
  isAttacking,
  onAttack,
  isClaimable,
  isClaiming,
  onClaimRewards,
  currentEnergy,
  maxEnergy,
  lastEnergyRefill,
}: WeeklyBossCardProps) {
  const currentHp = boss.currentHp ?? 0;
  const totalHp = boss.totalHp ?? 0;
  const hpPercentage = totalHp > 0 ? (currentHp / totalHp) * 100 : 0;
  const damageDealt = contribution?.damageDealt ?? 0;

  const [timeRemaining, setTimeRemaining] = useState('');
  const [countdown, setCountdown] = useState('');
  const [currentTauntIndex, setCurrentTauntIndex] = useState(0);
  
  const isExpired = boss.disappearanceDate ? new Date() > new Date(boss.disappearanceDate) : false;

  useEffect(() => {
    if (!boss.disappearanceDate) return;

    const deadline = new Date(boss.disappearanceDate);
    
    const updateTimer = () => {
      const now = new Date();
      if (now > deadline) {
        setTimeRemaining('Challenge has ended');
      } else {
        setTimeRemaining(formatDistanceToNow(deadline, { addSuffix: true }));
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 60000);

    return () => clearInterval(intervalId);
  }, [boss.disappearanceDate]);

  useEffect(() => {
    if (currentEnergy >= maxEnergy || !lastEnergyRefill) {
      setCountdown('');
      return;
    }

    const intervalId = setInterval(() => {
      const lastRefillTime = new Date(lastEnergyRefill).getTime();
      const now = Date.now();
      const elapsedMillis = now - lastRefillTime;
      const regenIntervalMillis = ENERGY_REGEN_MINUTES * 60 * 1000;
      
      const timeSinceLastPoint = elapsedMillis % regenIntervalMillis;
      const timeToNextPoint = regenIntervalMillis - timeSinceLastPoint;

      if (timeToNextPoint <= 0) {
        setCountdown('00:00');
        return;
      }
      
      const minutes = Math.floor((timeToNextPoint / 1000 / 60) % 60);
      const seconds = Math.floor((timeToNextPoint / 1000) % 60);
      
      setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentEnergy, maxEnergy, lastEnergyRefill]);
  
  useEffect(() => {
    if (!boss.taunts || boss.taunts.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTauntIndex(prevIndex => (prevIndex + 1) % boss.taunts.length);
    }, 7000); // Change taunt every 7 seconds

    return () => clearInterval(intervalId);
  }, [boss.taunts]);

  return (
    <Card className="relative bg-gradient-to-br from-destructive/10 via-background to-background border-destructive/30 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Swords />
            Weekly Boss Challenge!
          </CardTitle>
          <div className="flex flex-col items-end gap-1 text-right">
             <Badge variant="destructive">{boss.isDefeated ? 'Defeated' : (isExpired ? 'Ended' : 'Live')}</Badge>
             {timeRemaining && (
                <Badge variant="outline" className="text-muted-foreground">
                    <Timer className="mr-1 h-3 w-3" />
                    {timeRemaining}
                </Badge>
             )}
          </div>
        </div>
        <CardDescription>A communal challenge for all players. Charge your power and attack!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {boss.imageUrl && (
            <div className="relative h-64 w-full flex justify-center items-center">
                {boss.taunts && boss.taunts.length > 0 && (
                    <div className="absolute top-0 -translate-y-1/4 w-4/5 max-w-sm bg-card border border-border p-3 rounded-lg shadow-lg text-center z-10 animate-in fade-in duration-500">
                    <p className="text-sm italic text-card-foreground">"{boss.taunts[currentTauntIndex]}"</p>
                    {/* Speech bubble tail */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-card border-r-[10px] border-r-transparent -mb-[9px]"></div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-[11px] border-l-transparent border-t-[11px] border-t-border border-r-[11px] border-r-transparent -mb-[11px] -z-10"></div>
                    </div>
                )}
                <Image
                src={boss.imageUrl}
                alt={boss.title}
                fill
                className={cn(
                    "object-contain animate-boss-idle [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.5))_drop-shadow(0_0_3px_#fff)]"
                )}
                unoptimized
                />
            </div>
        )}
        <div>
          <h3 className="font-bold text-lg text-primary">{boss.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{boss.description}</p>
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                 <span className="text-sm font-medium">Boss HP</span>
                 <span className="text-xs font-mono text-muted-foreground">{Math.max(0, currentHp).toLocaleString()} / {totalHp.toLocaleString()}</span>
            </div>
            <Progress value={hpPercentage} className="h-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Your Contribution</p>
              <p className="text-lg font-bold text-primary">{damageDealt.toLocaleString()}</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Charged Power</p>
              <p className="text-lg font-bold text-primary">{pendingDamage.toLocaleString()}</p>
          </div>
           <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Zap className="w-4 h-4 text-yellow-500" /> Energy</p>
              <p className="text-lg font-bold text-primary">{currentEnergy} / {maxEnergy}</p>
              <div className="text-xs text-muted-foreground font-mono h-4 pt-1">
                {currentEnergy >= maxEnergy ? (
                  <span>Full</span>
                ) : (
                  <span>{countdown}</span>
                )}
              </div>
          </div>
        </div>

        <Button 
          onClick={onAttack} 
          disabled={isAttacking || pendingDamage <= 0 || boss.isDefeated || isExpired || currentEnergy < pendingHitCount}
          className={cn(
            "w-full transition-all duration-300",
            pendingDamage > 0 && !boss.isDefeated && !isExpired && "animate-pulse bg-destructive hover:bg-destructive/90"
          )}
        >
          {isAttacking ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <ShieldCheck className="mr-2" />
              Attack! ({pendingHitCount} Energy)
            </>
          )}
        </Button>

        {isClaimable && (
          <Button 
            onClick={onClaimRewards} 
            disabled={isClaiming}
            className="w-full"
          >
            {isClaiming ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Award className="mr-2" />
                Claim Your Reward
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
