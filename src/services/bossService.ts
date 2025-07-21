
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, updateDoc, writeBatch, serverTimestamp, query, orderBy, increment, limit, runTransaction, where, collectionGroup } from 'firebase/firestore';
import { startOfWeek, endOfWeek } from 'date-fns';
import { nanoid } from 'nanoid';
import type { WeeklyBoss, UserBossContribution, LeaderboardEntry } from '@/lib/types';
import { MAX_ENERGY, ENERGY_PER_HIT, ENERGY_REGEN_MINUTES } from '@/lib/constants';
import type { WeeklyBossAiOutput } from '@/ai/flows/generate-weekly-boss';
import { DEFAULT_AVATAR_URL } from '@/lib/avatars';

const BOSS_COLLECTION = 'weekly_bosses';

/**
 * Retrieves the weekly boss data for a given week ID.
 * @param weekId The ID of the week (e.g., "2024-28").
 * @returns A promise that resolves to the weekly boss object or null if not found.
 */
export async function getWeeklyBoss(weekId: string): Promise<WeeklyBoss | null> {
  if (!db) throw new Error('Firestore not initialized');
  const bossDocRef = doc(db, BOSS_COLLECTION, weekId);
  const docSnap = await getDoc(bossDocRef);

  if (!docSnap.exists() || !docSnap.data().flavorQuest) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    description: data.description,
    totalHp: data.totalHp,
    currentHp: data.currentHp,
    appearanceDate: data.appearanceDate?.toDate ? data.appearanceDate.toDate().toISOString() : data.appearanceDate,
    disappearanceDate: data.disappearanceDate?.toDate ? data.disappearanceDate.toDate().toISOString() : data.disappearanceDate,
    isDefeated: data.isDefeated,
    taunts: data.taunts ?? [],
    flavorQuest: { 
      ...data.flavorQuest,
      tasks: data.flavorQuest.tasks
    },
    imageUrl: data.imageUrl,
  };
}

/**
 * Sets the weekly boss data in Firestore. The image URL is assumed to be already uploaded.
 * @param weekId The ID of the week.
 * @param bossDetails The AI-generated boss details and the final image URL.
 * @param customDeadline Optional custom deadline for testing.
 */
export async function setWeeklyBoss(
  weekId: string, 
  bossDetails: WeeklyBossAiOutput & { imageUrl: string },
  customDeadline?: Date
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  
  const bossDocRef = doc(db, BOSS_COLLECTION, weekId);
  const now = new Date();
  
  const disappearanceDate = customDeadline 
    ? customDeadline.toISOString() 
    : endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const bossData: Omit<WeeklyBoss, 'id'> = {
    ...bossDetails,
    currentHp: bossDetails.totalHp,
    appearanceDate: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    disappearanceDate: disappearanceDate,
    isDefeated: false,
    imageUrl: bossDetails.imageUrl, // Directly use the provided URL
    flavorQuest: {
      ...bossDetails.flavorQuest,
      tasks: bossDetails.flavorQuest.tasks.map(task => ({ ...task, id: task.id || nanoid() })),
    },
  };
  await setDoc(bossDocRef, bossData);
}

/**
 * Retrieves a user's damage contribution for a specific weekly boss.
 * @param userId The ID of the user.
 * @param weekId The ID of the week.
 * @returns A promise resolving to the user's contribution object.
 */
export async function getUserBossContribution(userId: string, weekId: string): Promise<UserBossContribution | null> {
    if (!db) throw new Error('Firestore not initialized');
    const contributionDocRef = doc(db, 'users', userId, 'boss_contributions', weekId);
    const docSnap = await getDoc(contributionDocRef);
    if (!docSnap.exists()) {
        return { weekId, damageDealt: 0, rewardsClaimed: false, completedFlavorTasks: [] };
    }
    const data = docSnap.data();
    return {
        weekId: data.weekId ?? weekId,
        damageDealt: data.damageDealt ?? 0,
        rewardsClaimed: data.rewardsClaimed ?? false,
        completedFlavorTasks: data.completedFlavorTasks ?? [],
    };
}

/**
 * Atomically attacks the boss with the user's pending damage.
 * @param userId The ID of the attacking user.
 * @param weekId The ID of the week's boss.
 * @returns A promise resolving to an object with the damage dealt and hit count.
 */
export async function attackBoss(userId: string, weekId: string): Promise<{ dealtDamage: number; hitCount: number; }> {
  if (!db) throw new Error("Firestore not initialized");
  const userDocRef = doc(db, 'users', userId);
  const bossDocRef = doc(db, BOSS_COLLECTION, weekId);
  const contributionDocRef = doc(db, 'users', userId, 'boss_contributions', weekId);

  try {
    const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        const bossDoc = await transaction.get(bossDocRef);

        if (!userDoc.exists()) throw new Error("User not found.");
        if (!bossDoc.exists()) throw new Error("Weekly boss not found.");

        const userData = userDoc.data();
        const bossData = bossDoc.data() as WeeklyBoss;
        
        if (bossData.isDefeated) {
            // If boss is already defeated, clear pending damage but do nothing else.
            transaction.update(userDocRef, { pendingBossDamage: 0, pendingHitCount: 0 });
            return { dealtDamage: 0, hitCount: 0 };
        }
        
        const pendingDamage = userData.pendingBossDamage ?? 0;
        const pendingHitCount = userData.pendingHitCount ?? 0;
        if (pendingDamage <= 0) return { dealtDamage: 0, hitCount: 0 };
        
        const lastRefillRaw = userData.lastEnergyRefill;
        const lastRefillDate = lastRefillRaw?.toDate ? lastRefillRaw.toDate() : new Date(lastRefillRaw ?? Date.now());
        
        const now = new Date();
        const energyGained = Math.floor((now.getTime() - lastRefillDate.getTime()) / (ENERGY_REGEN_MINUTES * 60 * 1000));
        const currentEnergy = Math.min(MAX_ENERGY, (userData.energy ?? 0) + energyGained);
        const energyCost = pendingHitCount * ENERGY_PER_HIT;

        if (currentEnergy < energyCost) throw new Error("Not enough energy.");
      
        const newEnergy = currentEnergy - energyCost;
        const newHp = bossData.currentHp - pendingDamage;
        const clampedHp = Math.max(0, newHp);
        const isDefeated = clampedHp <= 0;

        transaction.update(userDocRef, { pendingBossDamage: 0, pendingHitCount: 0, energy: newEnergy, lastEnergyRefill: serverTimestamp() });
        transaction.update(bossDocRef, { currentHp: clampedHp, isDefeated });
        transaction.set(contributionDocRef, { damageDealt: increment(pendingDamage), weekId: weekId }, { merge: true });
        
        return { dealtDamage: pendingDamage, hitCount: Math.max(1, pendingHitCount) };
    });
    return result || { dealtDamage: 0, hitCount: 0 };
  } catch (error) {
    console.error("Attack boss transaction failed:", error);
    throw error;
  }
}

/**
 * Reverses damage and stats, for when a user un-completes a task/quest.
 * @param userId The ID of the user.
 * @param weekId The ID of the week's boss.
 * @param stats The new stats object for the user.
 * @param xpToReverse The amount of XP (and damage) to reverse (should be negative).
 * @param hitsToReverse The number of hits to reverse.
 */
export async function reverseDamageAndStats(userId: string, weekId: string, stats: any, xpToReverse: number, hitsToReverse: number): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const userDocRef = doc(db, 'users', userId);
  const bossDocRef = doc(db, BOSS_COLLECTION, weekId);
  const contributionDocRef = doc(db, 'users', userId, 'boss_contributions', weekId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    if (!userDoc.exists()) throw new Error("User not found.");

    const userData = userDoc.data();
    const absoluteXpToReverse = Math.abs(xpToReverse);
    const currentPendingDamage = userData.pendingBossDamage ?? 0;
    
    // Reverse from pending damage first
    const damageToDeductFromPending = Math.min(absoluteXpToReverse, currentPendingDamage);
    const hitsToDeductFromPending = damageToDeductFromPending > 0 ? Math.min(hitsToReverse, userData.pendingHitCount ?? 0) : 0;
    
    // Any remaining amount needs to be reversed from the boss and contribution
    const damageToReverseFromBoss = absoluteXpToReverse - damageToDeductFromPending;

    // Update user stats and pending damage
    const userUpdatePayload = {
        stats,
        pendingBossDamage: increment(-damageToDeductFromPending),
        pendingHitCount: increment(-hitsToDeductFromPending),
    };
    transaction.update(userDocRef, userUpdatePayload);
    
    // If we need to reverse damage that was already dealt
    if (damageToReverseFromBoss > 0) {
        const bossDoc = await transaction.get(bossDocRef);
        if (bossDoc.exists()) {
            const bossData = bossDoc.data() as WeeklyBoss;
            const newHp = Math.min(bossData.totalHp, bossData.currentHp + damageToReverseFromBoss);
            transaction.update(bossDocRef, { currentHp: newHp, isDefeated: newHp <= 0 });
            transaction.set(contributionDocRef, { damageDealt: increment(-damageToReverseFromBoss), weekId }, { merge: true });
        }
    }
  });
}

/**
 * Claims the rewards for defeating a weekly boss based on leaderboard rank.
 * @param userId The ID of the user claiming rewards.
 * @param weekId The ID of the week.
 * @returns A promise that resolves to the number of credits awarded.
 */
export async function claimBossRewards(userId: string, weekId: string): Promise<number> {
    if (!db) throw new Error("Firestore not initialized");

    const leaderboard = await getWeeklyLeaderboard(weekId);
    const playerRank = leaderboard.find(player => player.userId === userId);

    if (!playerRank) {
        throw new Error("You did not rank in the top 10. No credits awarded.");
    }

    const rewardAmount = Math.max(0, 100 - (playerRank.rank - 1) * 10);

    if (rewardAmount <= 0) {
        throw new Error("Your rank is not high enough for a credit reward.");
    }

    const userDocRef = doc(db, 'users', userId);
    const bossDocRef = doc(db, BOSS_COLLECTION, weekId);
    const contributionDocRef = doc(db, 'users', userId, 'boss_contributions', weekId);

    try {
        await runTransaction(db, async (transaction) => {
            const bossDoc = await transaction.get(bossDocRef);
            const contributionDoc = await transaction.get(contributionDocRef);

            if (!bossDoc.exists()) throw new Error("Boss for this week not found.");
            if (!contributionDoc.exists()) throw new Error("You did not contribute to this boss fight.");

            const bossData = bossDoc.data();
            const contributionData = contributionDoc.data();

            if (!bossData.isDefeated) throw new Error("The boss has not been defeated yet!");
            if (contributionData.rewardsClaimed) throw new Error("You have already claimed your reward for this boss.");
            if ((contributionData.damageDealt ?? 0) <= 0) throw new Error("You must deal damage to claim a reward.");

            transaction.update(userDocRef, { credits: increment(rewardAmount) });
            transaction.update(contributionDocRef, { rewardsClaimed: true });
        });
        return rewardAmount;
    } catch (error) {
        console.error("Claim boss rewards transaction failed:", error);
        throw error;
    }
}


/**
 * Marks a "flavor" task as completed, adding bonus damage to the user's pending attack.
 * @param userId The ID of the user.
 * @param weekId The ID of the week.
 * @param taskId The ID of the flavor task.
 * @param damage The bonus damage to add.
 */
export async function completeFlavorTask(userId: string, weekId: string, taskId: string, damage: number): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const contributionDocRef = doc(db, 'users', userId, 'boss_contributions', weekId);
  const userDocRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const contributionDoc = await transaction.get(contributionDocRef);
    const completedTasks = contributionDoc.data()?.completedFlavorTasks ?? [];
    if (completedTasks.includes(taskId)) return;
    
    transaction.set(contributionDocRef, { completedFlavorTasks: [...completedTasks, taskId], weekId }, { merge: true });
    transaction.update(userDocRef, { pendingBossDamage: increment(damage), pendingHitCount: increment(1) });
  });
}

/**
 * Retrieves the top 10 players for the weekly leaderboard.
 * @param weekId The ID of the week.
 * @returns A promise that resolves to an array of leaderboard entries.
 */
export async function getWeeklyLeaderboard(weekId: string): Promise<LeaderboardEntry[]> {
    if (!db) throw new Error('Firestore not initialized');
    const contributionsRef = collectionGroup(db, 'boss_contributions');
    const q = query(contributionsRef, where('weekId', '==', weekId), orderBy('damageDealt', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];
    
    const leaderboardPromises = querySnapshot.docs.map(async (doc, index) => {
        const userId = doc.ref.parent.parent!.id;
        const userDoc = await getDoc(doc.ref.parent.parent!);
        const userData = userDoc.data();
        const name = userData?.nickname || `User ${userId.substring(0, 4)}`;
        const avatarUrl = userData?.avatarUrl || DEFAULT_AVATAR_URL;
        return { rank: index + 1, name, damageDealt: doc.data().damageDealt ?? 0, userId, avatarUrl };
    });
    return Promise.all(leaderboardPromises);
}
