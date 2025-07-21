
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, BookOpen, HeartPulse, Brain, Sparkles, Swords, BrainCircuit, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getUserData } from '@/services/firestoreService';
import PlayerHeader from '@/components/layout/player-header';
import BottomNavBar from '@/components/layout/bottom-nav-bar';
import { MAX_ENERGY, ENERGY_REGEN_MINUTES } from '@/lib/constants';
import { calculateLevelInfo } from '@/lib/xp-system';

export default function GuidePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState(1);
  const [hp, setHp] = useState(0);
  const [maxHp, setMaxHp] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHeaderData() {
        if (user) {
            setIsLoading(true);
            const userData = await getUserData(user.uid);
            if(userData) {
                setNickname(userData.nickname);
                setHp(userData.hp);
                setMaxHp(userData.maxHp);

                const totalXp = Object.values(userData.stats).reduce((a, b) => a + b, 0);
                const levelInfo = calculateLevelInfo(totalXp);
                setLevel(levelInfo.level);

                let currentEnergy = userData.energy;
                if (userData.lastEnergyRefill && userData.energy < MAX_ENERGY) {
                    const now = Date.now();
                    const lastRefillTime = new Date(userData.lastEnergyRefill).getTime();
                    const millisPassed = now - lastRefillTime;
                    if (millisPassed > 0) {
                        const energyGained = Math.floor(millisPassed / (ENERGY_REGEN_MINUTES * 60 * 1000));
                        currentEnergy = Math.min(MAX_ENERGY, userData.energy + energyGained);
                    }
                }
                setEnergy(currentEnergy);
                setMaxEnergy(MAX_ENERGY);
            }
            setIsLoading(false);
        }
    }
    if (user) fetchHeaderData();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <PlayerHeader
        nickname={nickname}
        level={level}
        hp={hp}
        maxHp={maxHp}
        energy={energy}
        maxEnergy={maxEnergy}
      />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 container mx-auto p-4 md:p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen/> How to Play</CardTitle>
            <CardDescription>
              Turn your real-life goals into a fun RPG. Complete 'Quests' to earn 'XP' and level up yourself!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Core Concepts</h2>
              <ul className="space-y-5 text-sm">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Quests & Tasks</h3>
                    <p className="text-muted-foreground">
                      A <span className="font-semibold text-foreground">Quest</span> is your main goal (e.g., "Run a 5k"). <span className="font-semibold text-foreground">Tasks</span> are the small, repeatable actions you do to achieve it (e.g., "Run for 20 minutes"). Tasks can be scheduled to repeat daily, weekly, or on a custom schedule. Completing them gives you XP, and finishing the whole quest gives you a big bonus!
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
                     <Star className="h-5 w-5 text-amber-500" />
                  </div>
                   <div>
                    <h3 className="font-bold">XP, Levels, & Stats</h3>
                    <p className="text-muted-foreground">
                     You earn <span className="font-semibold text-foreground">XP</span> from every task and quest. More XP leads to higher <span className="font-semibold text-foreground">Levels</span>. Quests are categorized into three <span className="font-semibold text-foreground">Stats</span>: <span className="text-red-500 font-semibold">Strength</span> <HeartPulse className="inline h-4 w-4" />, <span className="text-blue-500 font-semibold">Intelligence</span> <Brain className="inline h-4 w-4" />, and <span className="text-purple-500 font-semibold">Soul</span> <Sparkles className="inline h-4 w-4" />.
                    </p>
                  </div>
                </li>
                 <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
                    <Swords className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold">Weekly Boss</h3>
                    <p className="text-muted-foreground">
                      A massive, shared challenge for the entire community! Every point of XP you earn also deals 1 point of damage to the boss. If the community wins, everyone who contributed can claim a credit reward.
                    </p>
                  </div>
                </li>
                 <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full mt-1">
                    <BrainCircuit className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Goal Coach</h3>
                    <p className="text-muted-foreground">
                      Out of ideas? Use the AI Coach to generate personalized quests based on your goals. This feature costs credits, which you can earn from defeating the Weekly Boss.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger>What's the difference between a Quest and a Task?</AccordionTrigger>
                  <AccordionContent>
                    A Quest is your main, overarching goal (e.g., "Learn to Cook Italian Food"). Tasks are the smaller, repeatable daily actions you take to get there (e.g., "Watch a pasta tutorial," "Practice knife skills for 10 mins"). This helps break down big ambitions into manageable steps.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="q2">
                  <AccordionTrigger>How many Quests and Tasks can I have?</AccordionTrigger>
                  <AccordionContent>
                    In the current free version, you can have up to 5 active (uncompleted) Quests at a time. Each Quest can have a maximum of 5 daily Tasks.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>What is the Weekly Boss?</AccordionTrigger>
                  <AccordionContent>
                    It's a shared challenge for all players. Every XP point you earn from your quests also deals 1 damage to the community boss. If the boss is defeated by the end of the week (Sunday), all contributing players can claim a credit reward from the dashboard.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger>How do I get more AI Coach credits?</AccordionTrigger>
                  <AccordionContent>
                    You start with a generous amount of free credits. Currently, the primary way to earn more is by participating in the Weekly Boss challenge and claiming your reward after the boss is defeated.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="q5">
                  <AccordionTrigger>I can't sign up. What do I do?</AccordionTrigger>
                  <AccordionContent>
                    The app is currently in a private beta and requires an invitation. You'll need to get an invitation code from an existing user to create an account.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="q6">
                  <AccordionTrigger>How do I install this app on my device (Android, iOS, PC)?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>LevelUp Life is a Progressive Web App (PWA), which means you can install it directly from your browser for a native-app-like experience! Here's how:</p>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li><span className="font-semibold text-foreground">Android (Chrome):</span> Tap the three-dot menu in the top right, then select 'Install app' or 'Add to Home screen'.</li>
                          <li><span className="font-semibold text-foreground">iOS (Safari):</span> Tap the 'Share' button (the square with an arrow pointing up), scroll down, and select 'Add to Home Screen'.</li>
                          <li><span className="font-semibold text-foreground">PC/Desktop (Chrome/Edge):</span> Look for an install icon (usually a computer with a down arrow) in the address bar on the right side. Click it and follow the prompts to install.</li>
                      </ul>
                      <p>Once installed, the app will have its own icon and run in its own window, just like a regular app!</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNavBar />
    </div>
  );
}
