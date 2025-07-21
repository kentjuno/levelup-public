
'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Plus, Loader2, Skull } from 'lucide-react';

import type { Quest, StatCategory, Stats, Achievement, UserCounters, AiSuggestion, WeeklyBoss, UserBossContribution, UserTier, TierSettings } from '@/lib/types';
import { calculateLevelInfo, getAdjustedExp } from '@/lib/xp-system';
import { getWeekId } from '@/lib/bosses';
import { useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { AI_COACH_CREDIT_COST, MAX_ENERGY, ENERGY_REGEN_MINUTES, MAX_HP, HP_PER_TASK_COMPLETED } from '@/lib/constants';
import { isCompletedForPeriod } from '@/lib/quests';
import { DEFAULT_AVATAR_URL } from '@/lib/avatars';

import {
  getUserQuests,
  getUserData,
  getUserAchievements,
  addQuest,
  updateQuest,
  deleteQuest,
  updateUserStatsAndPendingDamage,
  unlockAchievement,
  incrementUserCounter,
  updateUserCredits,
  getAiSuggestions,
  addAiSuggestion,
  getWeeklyBoss,
  attackBoss,
  getUserBossContribution,
  reverseDamageAndStats,
  claimBossRewards,
  completeFlavorTask,
  getTierSettings,
  logActivity,
  updateUserHp,
  handleDailyLogin,
} from '@/services/firestoreService';
import { generatePersonalizedGoal, GeneratePersonalizedGoalInput, GeneratePersonalizedGoalOutput } from '@/ai/flows/generate-personalized-goal';

import PlayerHeader from '@/components/layout/player-header';
import BottomNavBar from '@/components/layout/bottom-nav-bar';
import QuestView from '@/components/dashboard/quest-view';
import BossView from '@/components/dashboard/boss-view';
import GoalSuggester from '@/components/ai/goal-suggester';
import LeaderboardView from '@/components/dashboard/leaderboard-view';
import GuideView from '@/components/dashboard/guide-view';
import DashboardModals from '@/components/dashboard/dashboard-modals';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import AddQuestForm from '@/components/tasks/add-task-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import LandingPage from '@/components/landing/landing-page';


const initialStats: Stats = {
  strength_exp: 0,
  intelligence_exp: 0,
  soul_exp: 0,
};

const initialCounters: UserCounters = {
  quests_completed: 0,
  tasks_completed: 0,
};

type MainView = 'quests' | 'boss' | 'coach' | 'leaderboard' | 'guide';

function Dashboard() {
  // --- HOOKS ---
  const { user } = useAuth(); // We know user exists here
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // --- STATE MANAGEMENT ---
  const [activeView, setActiveView] = useState<MainView>('quests');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [counters, setCounters] = useState<UserCounters>(initialCounters);
  const [credits, setCredits] = useState(0);
  const [tier, setTier] = useState<UserTier>('bronze');
  const [tierSettings, setTierSettings] = useState<TierSettings | null>(null);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR_URL);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [questToEdit, setQuestToEdit] = useState<Quest | null>(null);
  const [questToDeleteId, setQuestToDeleteId] = useState<string | null>(null);

  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number } | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Set<string>>(new Set());
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const [weeklyBoss, setWeeklyBoss] = useState<WeeklyBoss | null>(null);
  const [bossContribution, setBossContribution] = useState<UserBossContribution | null>(null);
  const [pendingBossDamage, setPendingBossDamage] = useState(0);
  const [pendingHitCount, setPendingHitCount] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [attackAnimationData, setAttackAnimationData] = useState<{ dealtDamage: number; hitCount: number } | null>(null);
  
  const [energy, setEnergy] = useState(0);
  const [lastEnergyRefill, setLastEnergyRefill] = useState<string | null>(null);
  const [displayEnergy, setDisplayEnergy] = useState(0);

  const [hp, setHp] = useState(MAX_HP);
  const [maxHp, setMaxHp] = useState(MAX_HP);
  
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [isFormSheetOpen, setFormSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // --- DERIVED STATE ---
  const currentWeekId = useMemo(() => getWeekId(new Date()), []);

  const activeQuestsCount = useMemo(() => quests.filter(q => !q.completed).length, [quests]);
  const questLimit = useMemo(() => {
    if (!tier || !tierSettings) return 0;
    const limit = tierSettings[tier]?.questLimit;
    return limit === null ? Infinity : limit;
  }, [tier, tierSettings]);
  const canAddQuest = useMemo(() => questLimit === Infinity || activeQuestsCount < questLimit, [activeQuestsCount, questLimit]);

  const questToDelete = useMemo(() => quests.find(q => q.id === questToDeleteId), [questToDeleteId, quests]);

  const totalXp = useMemo(() => Object.values(stats).reduce((sum, current) => sum + current, 0), [stats]);
  const { level } = useMemo(() => calculateLevelInfo(totalXp), [totalXp]);
  
  const isBossClaimable = weeklyBoss && weeklyBoss.isDefeated && (bossContribution?.damageDealt ?? 0) > 0 && !bossContribution?.rewardsClaimed;

  // --- DATA FETCHING & INITIALIZATION ---
  const fetchData = useCallback(async (userId: string, showGlobalLoader = true) => {
    if (showGlobalLoader) setIsLoadingData(true);
    try {
      const [userData, userAchievements, userQuests, userAiSuggestions, boss, contribution, settings] = await Promise.all([
        getUserData(userId),
        getUserAchievements(userId),
        getUserQuests(userId),
        getAiSuggestions(userId),
        getWeeklyBoss(currentWeekId),
        getUserBossContribution(userId, currentWeekId),
        getTierSettings(),
      ]);
      
      setUnlockedAchievementIds(new Set(userAchievements.map(a => a.id)));
      setTierSettings(settings);
      setQuests(userQuests);
      
      if(userData) {
        setStats(userData.stats);
        setCounters(userData.counters);
        setCredits(userData.credits);
        setTier(userData.tier);
        setNickname(userData.nickname);
        setAvatarUrl(userData.avatarUrl);
        setPendingBossDamage(userData.pendingBossDamage);
        setPendingHitCount(userData.pendingHitCount);
        setEnergy(userData.energy);
        setLastEnergyRefill(userData.lastEnergyRefill);
        setHp(userData.hp);
        setMaxHp(userData.maxHp);
        setUnreadNotificationCount(userData.unreadNotificationCount);
      }

      setAiSuggestions(userAiSuggestions);
      setWeeklyBoss(boss);
      setBossContribution(contribution);

    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load your data." });
    } finally {
      if (showGlobalLoader) setIsLoadingData(false);
    }
  }, [toast, currentWeekId]);

  useEffect(() => {
    if (user?.uid) {
        const runInitialChecks = async () => {
            await fetchData(user.uid, true);
            const notificationsAdded = await handleDailyLogin(user.uid);
            if (notificationsAdded) {
                // Refetch data without global loader to update notification count seamlessly
                await fetchData(user.uid, false);
            }
        };
        runInitialChecks();
    }
  }, [user, fetchData]);

  useEffect(() => {
    const viewParam = searchParams.get('view') as MainView | null;
    setActiveView(viewParam && ['quests', 'boss', 'coach', 'leaderboard', 'guide'].includes(viewParam) ? viewParam : 'quests');
  }, [searchParams]);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (lastEnergyRefill === null || energy >= MAX_ENERGY) {
      setDisplayEnergy(energy);
      return;
    };

    const calculateCurrentEnergy = () => {
        const now = Date.now();
        const lastRefillTime = new Date(lastEnergyRefill).getTime();
        const millisPassed = now - lastRefillTime;
        if (millisPassed < 0) return;
        const energyGained = Math.floor(millisPassed / (ENERGY_REGEN_MINUTES * 60 * 1000));
        setDisplayEnergy(Math.min(MAX_ENERGY, energy + energyGained));
    };

    calculateCurrentEnergy();
    const interval = setInterval(calculateCurrentEnergy, 10000);
    return () => clearInterval(interval);
  }, [energy, lastEnergyRefill]);

  // --- GAME LOGIC HANDLERS ---
  const handleAchievementUnlocked = useCallback((achievement: Achievement) => {
    setUnlockedAchievement(achievement);
    setShowConfetti(true);
    new Audio('/sounds/level-up.mp3').play().catch(e => console.error("Error playing sound:", e));
  }, []);

  const checkAndUnlockAchievements = useCallback(async (newCounters: UserCounters) => {
    if (!user) return;
    const achievementsToTest = [
        { id: 'quest_1', threshold: 1, type: 'questCount' as const }, { id: 'quest_10', threshold: 10, type: 'questCount' as const }, { id: 'quest_100', threshold: 100, type: 'questCount' as const },
        { id: 'task_1', threshold: 1, type: 'taskCount' as const }, { id: 'task_25', threshold: 25, type: 'taskCount' as const }, { id: 'task_100', threshold: 100, type: 'taskCount' as const },
    ];
    for (const ach of achievementsToTest) {
        if (unlockedAchievementIds.has(ach.id)) continue;
        const conditionMet = (ach.type === 'questCount' && newCounters.quests_completed >= ach.threshold) || (ach.type === 'taskCount' && newCounters.tasks_completed >= ach.threshold);
        if (conditionMet) {
            const achievementToUnlock = ALL_ACHIEVEMENTS.find(a => a.id === ach.id);
            if (achievementToUnlock) {
                await unlockAchievement(user.uid, ach.id);
                setUnlockedAchievementIds(prev => new Set(prev).add(ach.id));
                handleAchievementUnlocked(achievementToUnlock);
                return; 
            }
        }
    }
  }, [user, unlockedAchievementIds, handleAchievementUnlocked]);

  const handleXpChange = async (xpChange: number, category: StatCategory, hitCount: number = 1) => {
    if (!user) return;
    const adjustedXp = xpChange > 0 ? getAdjustedExp(xpChange, hp) : xpChange;
    if (adjustedXp === 0) return;

    const oldLevelInfo = calculateLevelInfo(totalXp);
    const newStats = { ...stats, [`${category}_exp`]: Math.max(0, stats[`${category}_exp`] + adjustedXp) };
    setStats(newStats);
    
    const newLevelInfo = calculateLevelInfo(Object.values(newStats).reduce((s, c) => s + c, 0));
    if (newLevelInfo.level > oldLevelInfo.level) {
      setLevelUpInfo({ newLevel: newLevelInfo.level });
      setShowConfetti(true);
      new Audio('/sounds/level-up.mp3').play().catch(e => console.error("Error playing sound:", e));
    }
    
    if (adjustedXp > 0) {
      setPendingBossDamage(prev => prev + adjustedXp);
      setPendingHitCount(prev => prev + hitCount);
      await updateUserStatsAndPendingDamage(user.uid, newStats, adjustedXp, hitCount);
    } else {
      await reverseDamageAndStats(user.uid, currentWeekId, newStats, adjustedXp, hitCount);
      await fetchData(user.uid, false); // Refresh data after reversal
    }
  };

  // --- QUEST HANDLERS ---
  const handleAddQuest = async (questData: Omit<Quest, 'id' | 'completed' | 'created_at'>) => {
    if (!user || !canAddQuest) {
      toast({ variant: 'destructive', title: 'Limit Reached', description: `You've reached your quest limit for the ${tier} tier.` });
      return;
    }
    const newQuestFromDb = await addQuest(user.uid, questData);
    setQuests(prev => [newQuestFromDb, ...prev]);
    setFormSheetOpen(false);
    toast({ title: 'Quest Added!', description: `You've embarked on: "${newQuestFromDb.title}"` });
  };

  const handleUpdateQuest = async (updatedQuestData: Quest) => {
    if (!user) return;
    setQuests(prev => prev.map(t => (t.id === updatedQuestData.id ? updatedQuestData : t)));
    setFormSheetOpen(false);
    setQuestToEdit(null);
    toast({ title: 'Quest Updated!', description: `Changes to "${updatedQuestData.title}" saved.` });
    await updateQuest(user.uid, updatedQuestData.id, updatedQuestData);
  }

  const handleConfirmDelete = async () => {
    if (!questToDelete || !user) return;
    await deleteQuest(user.uid, questToDelete.id);
    setQuests(prev => prev.filter(t => t.id !== questToDelete.id));
    if (questToDelete.completed && questToDelete.exp_value) {
      await handleXpChange(-questToDelete.exp_value, questToDelete.exp_category, 1);
      toast({ variant: 'destructive', title: 'Quest Deleted', description: `Bonus XP deducted.` });
    } else {
      toast({ title: 'Quest Deleted' });
    }
    setQuestToDeleteId(null);
  };

  const handleToggleComplete = async (questId: string, completed: boolean) => {
    if (!user) return;
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const xpChange = completed ? (quest.exp_value ?? 0) : -(quest.exp_value ?? 0);
    setQuests(prev => prev.map(t => t.id === questId ? { ...t, completed } : t));
    await updateQuest(user.uid, questId, { completed });

    if (xpChange > 0) {
        new Audio('/sounds/task-complete.mp3').play().catch(e => console.error("Error playing sound:", e));
        
        // Restore HP on quest completion
        const hpRestored = 10; // Flat 10 HP for completing a whole quest
        const newHp = Math.min(maxHp, hp + hpRestored);
        setHp(newHp);
        await updateUserHp(user.uid, newHp);
        
        // Log with adjusted XP
        await logActivity(user.uid, 'QUEST_COMPLETED', { questId, questTitle: quest.title, xp: getAdjustedExp(quest.exp_value ?? 0, hp), category: quest.exp_category });
        
        // Handle XP and stats change
        await handleXpChange(xpChange, quest.exp_category, 1);

    } else if (xpChange < 0) {
        // When un-completing a quest, we shouldn't penalize HP. The XP reversal is enough.
        await handleXpChange(xpChange, quest.exp_category, 1);
    }
    
    if (completed) {
      const newCounters = { ...counters, quests_completed: counters.quests_completed + 1 };
      await incrementUserCounter(user.uid, 'quests_completed');
      setCounters(newCounters);
      await checkAndUnlockAchievements(newCounters);
    }
  };

  const handleToggleTask = async (questId: string, taskId: string) => {
    if (!user) return;
    const quest = quests.find(q => q.id === questId);
    const task = quest?.tasks?.find(t => t.id === taskId);
    if (!quest || !task) return;

    const wasCompleted = isCompletedForPeriod(task.lastCompleted, quest.recurrence);
    const xpChange = wasCompleted ? -task.exp_value : task.exp_value;
    const newTasks = quest.tasks!.map(item => item.id === taskId ? { ...item, lastCompleted: wasCompleted ? null : new Date().toISOString() } : item);
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, tasks: newTasks } : q));
    await updateQuest(user.uid, questId, { tasks: newTasks });

    if (xpChange > 0) {
        new Audio('/sounds/task-complete.mp3').play().catch(e => console.error("Error playing sound:", e));
        const newHp = Math.min(maxHp, hp + HP_PER_TASK_COMPLETED);
        setHp(newHp);
        await updateUserHp(user.uid, newHp);
        await logActivity(user.uid, 'TASK_COMPLETED', { questId, questTitle: quest.title, taskId, taskText: task.text, xp: getAdjustedExp(task.exp_value, hp), category: quest.exp_category });
        const newCounters = { ...counters, tasks_completed: counters.tasks_completed + 1 };
        await incrementUserCounter(user.uid, 'tasks_completed');
        setCounters(newCounters);
        await checkAndUnlockAchievements(newCounters);
    }
    if (xpChange !== 0) await handleXpChange(xpChange, quest.exp_category, 1);
  };
  
  // --- BOSS BATTLE HANDLERS ---
  const handleAttack = async () => {
    if (!user || !weeklyBoss || pendingBossDamage <= 0) return;
    setIsAttacking(true);
    try {
        const attackResult = await attackBoss(user.uid, weeklyBoss.id);
        if (attackResult.dealtDamage > 0) {
            const userData = await getUserData(user.uid);
            if(userData) {
              setEnergy(userData.energy);
              setLastEnergyRefill(userData.lastEnergyRefill);
            }
            setPendingBossDamage(0);
            setPendingHitCount(0);
            setWeeklyBoss(prev => prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - attackResult.dealtDamage), isDefeated: Math.max(0, prev.currentHp - attackResult.dealtDamage) <= 0 } : null);
            setBossContribution(prev => ({ ...prev!, damageDealt: (prev?.damageDealt || 0) + attackResult.dealtDamage, weekId: weeklyBoss.id }));
            setAttackAnimationData(attackResult);
        }
    } catch (error) {
        const description = error instanceof Error && error.message.includes("Not enough energy") ? "You don't have enough energy!" : "Could not deal damage to the boss.";
        toast({ variant: "destructive", title: "Attack Failed", description });
    } finally {
        setIsAttacking(false);
    }
  };

  const handleCompleteFlavorTask = async (taskId: string, damage: number) => {
    if (!user || !weeklyBoss || bossContribution?.completedFlavorTasks?.includes(taskId)) return;
    setBossContribution(prev => ({ ...prev!, completedFlavorTasks: [...(prev?.completedFlavorTasks ?? []), taskId], weekId: weeklyBoss.id }));
    setPendingBossDamage(prev => prev + damage);
    setPendingHitCount(prev => prev + 1);
    new Audio('/sounds/task-complete.mp3').play().catch(e => console.error("Error playing sound:", e));
    try {
        await completeFlavorTask(user.uid, weeklyBoss.id, taskId, damage);
        toast({ title: 'Weakness Exploited!', description: `You dealt an extra ${damage} damage!` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not apply damage boost.' });
        setBossContribution(prev => ({ ...prev!, completedFlavorTasks: (prev?.completedFlavorTasks ?? []).filter(id => id !== taskId) }));
        setPendingBossDamage(prev => prev - damage);
        setPendingHitCount(prev => prev - 1);
    }
  };

  const handleClaimRewards = async () => {
    if (!user || !weeklyBoss || !isBossClaimable) return;
    setIsClaimingReward(true);
    try {
      const creditsAwarded = await claimBossRewards(user.uid, weeklyBoss.id);
      setCredits(prev => prev + creditsAwarded);
      setBossContribution(prev => prev ? { ...prev, rewardsClaimed: true } : null);
      toast({
        title: "Reward Claimed!",
        description: `You have received ${creditsAwarded} credits for your contribution!`,
      });
      setShowConfetti(true);
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      toast({
        variant: 'destructive',
        title: 'Claim Failed',
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  // --- AI COACH HANDLERS ---
  const handleGenerateGoal = async (input: GeneratePersonalizedGoalInput): Promise<GeneratePersonalizedGoalOutput | null> => {
    if (!user) return null;
    if (credits < AI_COACH_CREDIT_COST) {
      toast({ variant: 'destructive', title: 'Not enough credits', description: `You need ${AI_COACH_CREDIT_COST} credits.` });
      return null;
    }
    try {
      const result = await generatePersonalizedGoal(input);
      if (result) {
        const newSuggestion: AiSuggestion = { ...result, id: nanoid(), createdAt: new Date().toISOString() };
        await Promise.all([ addAiSuggestion(user.uid, newSuggestion), updateUserCredits(user.uid, -AI_COACH_CREDIT_COST) ]);
        setAiSuggestions(prev => [newSuggestion, ...prev].slice(0, 5));
        setCredits(prev => prev - AI_COACH_CREDIT_COST);
        toast({ title: 'Suggestion Generated!', description: 'Your new quest suggestion is ready.' });
        return result;
      }
      return null;
    } catch (error) {
      console.error('Failed to generate goal:', error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate a suggestion.' });
      return null;
    }
  };

  // --- UI HANDLERS ---
  const handleOpenNewQuestSheet = () => { setQuestToEdit(null); setFormSheetOpen(true); };
  const handleOpenEditQuestSheet = (quest: Quest) => { setQuestToEdit(quest); setFormSheetOpen(true); };
  const handleDeleteRequest = (questId: string) => setQuestToDeleteId(questId);

  // --- RENDER ---
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <PlayerHeader 
        nickname={nickname}
        avatarUrl={avatarUrl}
        level={level}
        activeView={activeView}
        hp={hp}
        maxHp={maxHp}
        energy={displayEnergy}
        maxEnergy={MAX_ENERGY}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="container mx-auto pt-6">
            <div className="max-w-3xl mx-auto space-y-4">
                {activeView === 'quests' && (
                  <QuestView
                    quests={quests}
                    onToggleComplete={handleToggleComplete}
                    onToggleTask={handleToggleTask}
                    onOpenEdit={handleOpenEditQuestSheet}
                    onDelete={handleDeleteRequest}
                  />
                )}

                {activeView === 'boss' && (
                  weeklyBoss ? (
                    <BossView
                      weeklyBoss={weeklyBoss}
                      bossContribution={bossContribution}
                      pendingDamage={pendingBossDamage}
                      pendingHitCount={pendingHitCount}
                      isAttacking={isAttacking}
                      onAttack={handleAttack}
                      isClaimable={!!isBossClaimable}
                      isClaiming={isClaiming}
                      onClaimRewards={handleClaimRewards}
                      onCompleteFlavorTask={handleCompleteFlavorTask}
                      currentEnergy={displayEnergy}
                      maxEnergy={MAX_ENERGY}
                      lastEnergyRefill={lastEnergyRefill}
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Skull /> No Active Boss</CardTitle>
                        <CardDescription>
                          The weekly boss hasn't appeared yet. Check back later!
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center py-8">
                          A new challenge awaits soon...
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}

                {activeView === 'coach' && <GoalSuggester credits={credits} history={aiSuggestions} onGenerate={handleGenerateGoal} onAddQuest={handleAddQuest} />}
                
                {activeView === 'leaderboard' && <LeaderboardView />}

                {activeView === 'guide' && <GuideView />}
            </div>
        </div>
      </main>

      <Sheet open={isFormSheetOpen} onOpenChange={setFormSheetOpen}>
        <SheetTrigger asChild>
          <Button onClick={handleOpenNewQuestSheet} disabled={!canAddQuest} className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-30" size="icon">
              <Plus className="h-6 w-6" /><span className="sr-only">Add New Quest</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{questToEdit ? 'Edit Quest' : 'Define a New Quest'}</SheetTitle></SheetHeader>
          <AddQuestForm key={questToEdit?.id || 'new'} onAddQuest={handleAddQuest} onUpdateQuest={handleUpdateQuest} questToEdit={questToEdit} tier={tier} tierSettings={tierSettings} />
        </SheetContent>
      </Sheet>

      <BottomNavBar activeView={activeView} />

      <DashboardModals
        showConfetti={showConfetti}
        onConfettiComplete={(c) => { setShowConfetti(false); c?.reset(); }}
        windowSize={windowSize}
        levelUpInfo={levelUpInfo}
        onCloseLevelUp={() => { setLevelUpInfo(null); setShowConfetti(false); }}
        unlockedAchievement={unlockedAchievement}
        onCloseAchievement={() => { setUnlockedAchievement(null); setShowConfetti(false); }}
        questToDelete={questToDelete}
        onCancelDelete={() => setQuestToDeleteId(null)}
        onConfirmDelete={handleConfirmDelete}
        attackAnimationData={attackAnimationData}
        weeklyBoss={weeklyBoss}
        onAttackAnimationComplete={() => { toast({ title: `💥 Pow! ${attackAnimationData?.dealtDamage.toLocaleString()} Damage!`, description: "The boss stumbles from your mighty blow!" }); setAttackAnimationData(null); }}
        isClient={isClient}
      />
    </div>
  );
}

function HomePageContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard />;
}

export default function Home() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    }>
        <HomePageContent />
    </Suspense>
  )
}
