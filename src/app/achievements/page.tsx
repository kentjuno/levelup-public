'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getUserAchievements } from '@/services/firestoreService';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import type { UserAchievement } from '@/lib/types';
import AchievementCard from '@/components/achievements/achievement-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AchievementsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoadingData(true);
        try {
          const userAchievements: UserAchievement[] = await getUserAchievements(user.uid);
          const unlockedIds = new Set(userAchievements.map(a => a.id));
          setUnlockedAchievements(unlockedIds);
        } catch (error) {
          console.error("Failed to fetch user achievements:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your achievements. Please try again later.",
          });
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    fetchData();
  }, [user, toast]);

  if (authLoading || (user && isLoadingData)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const sortedAchievements = [...ALL_ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    if (aUnlocked === bUnlocked) return 0;
    return aUnlocked ? -1 : 1;
  });


  return (
    <div className="min-h-screen bg-background font-body text-foreground">
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-primary font-headline">Your Achievements</h1>
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-6">
            <p className="text-center text-muted-foreground mb-6">
                You have unlocked {unlockedAchievements.size} of {ALL_ACHIEVEMENTS.length} achievements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {sortedAchievements.map(achievement => (
                    <AchievementCard 
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={unlockedAchievements.has(achievement.id)}
                    />
                ))}
            </div>
        </main>
    </div>
  );
}
