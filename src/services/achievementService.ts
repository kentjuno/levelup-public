
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import type { UserAchievement } from '@/lib/types';

/**
 * Retrieves a user's unlocked achievements.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of user achievements.
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  if (!db) throw new Error('Firestore not initialized');
  const achievementsCollectionRef = collection(db, 'users', userId, 'achievements');
  const querySnapshot = await getDocs(achievementsCollectionRef);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      unlockedAt: data.unlockedAt?.toDate().toISOString() ?? new Date().toISOString(),
    } as UserAchievement;
  });
}

/**
 * Unlocks a specific achievement for a user if it hasn't been unlocked already.
 * @param userId The ID of the user.
 * @param achievementId The ID of the achievement to unlock.
 */
export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const achievementDocRef = doc(db, 'users', userId, 'achievements', achievementId);
    const achievementDoc = await getDoc(achievementDocRef);

    if (!achievementDoc.exists()) {
        await setDoc(achievementDocRef, {
            unlockedAt: serverTimestamp()
        });
    }
}
