
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, writeBatch, serverTimestamp, increment, query, where, limit, getDocs, runTransaction } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import type { Quest, Stats, UserCounters, UserTier, PublicUserProfile, UserAchievement } from '@/lib/types';
import { MAX_ENERGY, MAX_HP } from '@/lib/constants';
import { calculateLevelInfo } from '@/lib/xp-system';
import { DEFAULT_AVATAR_URL } from '@/lib/avatars';

const initialStats: Stats = { strength_exp: 0, intelligence_exp: 0, soul_exp: 0 };
const initialCounters: UserCounters = { quests_completed: 0, tasks_completed: 0 };

/**
 * Checks if an invitation code is valid by seeing if it exists for any user.
 * @param code The invitation code to validate.
 * @returns A boolean indicating if the code is valid.
 */
export async function isValidInvitationCode(code: string): Promise<boolean> {
  if (!db || !code) return false;
  const q = query(collection(db, 'users'), where('invitationCode', '==', code.toUpperCase()), limit(1));
  try {
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error validating invitation code (check Firestore index):", error);
    return false;
  }
}

/**
 * Initializes data for a new user or ensures all fields exist for an existing user.
 * @param userId The ID of the user.
 * @param email The user's email.
 */
export async function initializeUserData(userId: string, email: string | null) {
  if (!db) throw new Error('Firestore not initialized');
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const batch = writeBatch(db);
    batch.set(userDocRef, { 
      email: email,
      nickname: email?.split('@')[0] || `user_${userId.substring(0, 4)}`,
      stats: initialStats,
      ...initialCounters,
      credits: 500,
      tier: 'bronze',
      pendingBossDamage: 0,
      pendingHitCount: 0,
      invitationCode: nanoid(8).toUpperCase(),
      energy: MAX_ENERGY,
      lastEnergyRefill: serverTimestamp(),
      hp: MAX_HP,
      maxHp: MAX_HP,
      lastHpUpdate: serverTimestamp(),
      unreadNotificationCount: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      avatarUrl: DEFAULT_AVATAR_URL,
    });
    await batch.commit();
  } else {
    // This part can be expanded to migrate existing users if new fields are added.
    if (!userDoc.data().avatarUrl) {
        await updateDoc(userDocRef, { avatarUrl: DEFAULT_AVATAR_URL });
    }
  }
}

/**
 * Retrieves the full dataset for a user, used by the main dashboard.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the user's data object or null.
 */
export async function getUserData(userId: string) {
    if (!db) throw new Error('Firestore not initialized');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const data = userDoc.data();
        const lastRefillRaw = data.lastEnergyRefill;
        const lastRefillIso = lastRefillRaw?.toDate ? lastRefillRaw.toDate().toISOString() : (typeof lastRefillRaw === 'string' ? lastRefillRaw : null);
        return {
            stats: data.stats || initialStats,
            counters: { quests_completed: data.quests_completed ?? 0, tasks_completed: data.tasks_completed ?? 0 },
            credits: data.credits ?? 0, tier: (data.tier || 'bronze'), nickname: data.nickname || data.email?.split('@')[0] || '',
            pendingBossDamage: data.pendingBossDamage ?? 0, pendingHitCount: data.pendingHitCount ?? 0,
            energy: data.energy ?? MAX_ENERGY, lastEnergyRefill: lastRefillIso,
            hp: data.hp ?? MAX_HP, maxHp: data.maxHp ?? MAX_HP,
            unreadNotificationCount: data.unreadNotificationCount ?? 0,
            avatarUrl: data.avatarUrl || DEFAULT_AVATAR_URL,
        };
    }
    return null;
}

/**
 * Retrieves a user's public profile data.
 * @param userId The ID of the user.
 * @returns A promise resolving to the public profile object or null.
 */
export async function getUserProfile(userId: string): Promise<{ nickname: string; email: string, tier: UserTier, invitationCode: string, avatarUrl: string }> {
  if (!db) throw new Error('Firestore not initialized');
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      nickname: data.nickname || data.email?.split('@')[0] || '',
      email: data.email || '',
      tier: data.tier || 'bronze',
      invitationCode: data.invitationCode || '',
      avatarUrl: data.avatarUrl || DEFAULT_AVATAR_URL,
    };
  }
  return { nickname: `user_${userId.substring(0, 4)}`, email: '', tier: 'bronze', invitationCode: '', avatarUrl: DEFAULT_AVATAR_URL };
}

/**
 * Updates a user's nickname.
 * @param userId The ID of the user.
 * @param nickname The new nickname.
 */
export async function updateUserNickname(userId: string, nickname: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  if (!nickname || nickname.trim().length === 0) throw new Error("Nickname cannot be empty.");
  await updateDoc(doc(db, 'users', userId), { nickname: nickname.trim() });
}

/**
 * Updates a user's avatar URL.
 * @param userId The ID of the user.
 * @param avatarUrl The new avatar URL.
 */
export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  if (!avatarUrl) throw new Error("Avatar URL cannot be empty.");
  await updateDoc(doc(db, 'users', userId), { avatarUrl });
}


/**
 * Retrieves a user's stats (XP in different categories).
 * @param userId The ID of the user.
 * @returns A promise resolving to the user's stats object.
 */
export async function getUserStats(userId: string): Promise<Stats> {
  if (!db) throw new Error('Firestore not initialized');
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? (userDoc.data().stats as Stats) : initialStats;
}

/**
 * Updates a user's stats and atomically increments their pending boss damage.
 * @param userId The ID of the user.
 * @param stats The new stats object.
 * @param xpChange The amount of XP to add to pending damage.
 * @param hitCount The number of hits to add to the pending count.
 */
export async function updateUserStatsAndPendingDamage(userId: string, stats: Stats, xpChange: number, hitCount: number): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await updateDoc(doc(db, 'users', userId), { 
      stats,
      pendingBossDamage: increment(xpChange),
      pendingHitCount: increment(hitCount),
  });
}

/**
 * Increments a specific counter for a user (e.g., 'quests_completed').
 * @param userId The ID of the user.
 * @param counterName The name of the counter to increment.
 */
export async function incrementUserCounter(userId: string, counterName: keyof UserCounters) {
  if (!db) throw new Error('Firestore not initialized');
  await updateDoc(doc(db, 'users', userId), { [counterName]: increment(1) });
}

/**
 * Updates a user's credits balance by a given amount.
 * @param userId The ID of the user.
 * @param amountToIncrement The amount to add (can be negative).
 */
export async function updateUserCredits(userId: string, amountToIncrement: number): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await updateDoc(doc(db, 'users', userId), { credits: increment(amountToIncrement) });
}

/**
 * Updates a user's energy, clamping to min/max values and resetting the refill timer.
 * @param userId The ID of the user.
 * @param energy The new energy value.
 */
export async function updateUserEnergy(userId: string, energy: number): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const newEnergy = Math.max(0, Math.min(energy, MAX_ENERGY));
    await updateDoc(doc(db, 'users', userId), { 
        energy: newEnergy,
        lastEnergyRefill: serverTimestamp()
    });
}

/**
 * Updates a user's HP using a transaction to ensure atomicity.
 * @param userId The ID of the user.
 * @param hp The new HP value.
 */
export async function updateUserHp(userId: string, hp: number): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const userDocRef = doc(db, 'users', userId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw new Error("User document does not exist!");
            }
            const maxHp = userDoc.data().maxHp ?? MAX_HP;
            const newHp = Math.max(0, Math.min(hp, maxHp));
            transaction.update(userDocRef, { hp: newHp });
        });
    } catch (error) {
        console.error("Update HP transaction failed:", error);
        throw error; // Re-throw the error to be caught by the calling function
    }
}


/**
 * Retrieves a summarized public profile for a user, for leaderboards or public views.
 * @param userId The ID of the user.
 * @returns A promise resolving to the public user profile or null.
 */
export async function getPublicUserProfile(userId: string): Promise<PublicUserProfile | null> {
  if (!db) throw new Error('Firestore not initialized');
  try {
    const [userDoc, achievementsSnapshot] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      getDocs(collection(db, 'users', userId, 'achievements'))
    ]);

    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const stats = userData.stats || initialStats;
    const totalXp = Object.values(stats).reduce((sum: number, current) => sum + (current as number), 0);
    const levelInfo = calculateLevelInfo(totalXp);
    
    const achievements: UserAchievement[] = achievementsSnapshot.docs.map(d => {
        const data = d.data();
        const unlockedAt = data.unlockedAt?.toDate() ?? new Date();
        return { id: d.id, unlockedAt: unlockedAt.toISOString() };
    });

    // Sort achievements by date descending in the code
    achievements.sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime());

    return {
      userId: userId,
      nickname: userData.nickname || `User...`,
      tier: userData.tier || 'bronze',
      hp: userData.hp ?? MAX_HP,
      maxHp: userData.maxHp ?? MAX_HP,
      stats,
      counters: { quests_completed: userData.quests_completed || 0, tasks_completed: userData.tasks_completed || 0 },
      achievements,
      levelInfo: { level: levelInfo.level, totalXp },
      avatarUrl: userData.avatarUrl || DEFAULT_AVATAR_URL,
    };
  } catch (error) {
    console.error(`Error fetching public profile for ${userId}:`, error);
    return null;
  }
}

/**
 * Updates the last login timestamp for a user.
 * @param userId The ID of the user.
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
    if (!db) return;
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
    } catch (e) {
        // This can fail if the document doesn't exist yet (e.g., on first sign-up).
        // This is okay because initializeUserData will set the initial lastLogin timestamp.
        console.log("Could not update last login, likely a new user being created.");
    }
}
