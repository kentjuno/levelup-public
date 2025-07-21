
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, getDocs, where, limit, query } from 'firebase/firestore';
import { subDays, format, isAfter } from 'date-fns';
import { MAX_ENERGY, MAX_HP } from '@/lib/constants';
import type { UserTier } from '@/lib/types';

/**
 * Checks if a user is an admin by verifying their UID in the 'admin_users' collection.
 * @param userId The ID of the user to check.
 * @returns A boolean indicating if the user is an admin.
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore not initialized, denying all admin checks.');
    return false;
  }
  try {
    const adminDocRef = doc(db, 'admin_users', userId);
    const docSnap = await getDoc(adminDocRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking for admin status:", error);
    return false;
  }
}

/**
 * Searches for users by a partial email string.
 * @param partialEmail The partial email to search for.
 * @returns A promise that resolves to an array of user objects with uid and email.
 */
export async function searchUsersByEmail(partialEmail: string): Promise<{ uid: string; email: string }[]> {
    if (!db || !partialEmail) return [];

    const usersRef = collection(db, 'users');
    // Firestore query to simulate "starts with"
    const q = query(
        usersRef, 
        where('email', '>=', partialEmail),
        where('email', '<=', partialEmail + '\uf8ff'),
        limit(5) // Limit to 5 suggestions
    );

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            uid: doc.id,
            email: doc.data().email,
        }));
    } catch (error) {
        console.error("Error searching users by email. Ensure you have created the necessary Firestore index.", error);
        return [];
    }
}


/**
 * Finds a user by their email address.
 * @param email The email of the user to find.
 * @returns A user object or null if not found.
 */
export async function findUserByEmail(email: string): Promise<{ uid: string; email: string; nickname: string; tier: UserTier; energy: number; lastEnergyRefill: string | null; hp: number; maxHp: number; } | null> {
    if (!db) throw new Error('Firestore not initialized');

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const lastRefillRaw = userData.lastEnergyRefill;
    const lastRefillIso = lastRefillRaw?.toDate ? lastRefillRaw.toDate().toISOString() : (typeof lastRefillRaw === 'string' ? lastRefillRaw : null);

    return {
        uid: userDoc.id,
        email: userData.email,
        nickname: userData.nickname || `user_${userDoc.id.substring(0,4)}`,
        tier: userData.tier || 'bronze',
        energy: userData.energy ?? MAX_ENERGY,
        lastEnergyRefill: lastRefillIso,
        hp: userData.hp ?? MAX_HP,
        maxHp: userData.maxHp ?? MAX_HP,
    };
}

/**
 * Updates a user's tier.
 * @param userId The ID of the user to update.
 * @param tier The new tier to assign.
 */
export async function updateUserTier(userId: string, tier: UserTier): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { tier });
}

/**
 * Retrieves aggregated statistics about users for an admin dashboard.
 * @returns An object containing total users, active users, tier distribution, and signup history.
 */
export async function getAdminDashboardStats() {
    if (!db) throw new Error('Firestore not initialized');
    
    const usersRef = collection(db, 'users');
    const userSnapshot = await getDocs(usersRef);

    const totalUsers = userSnapshot.size;
    const tierDistribution: Record<UserTier | 'unknown', number> = {
        bronze: 0,
        silver: 0,
        gold: 0,
        diamond: 0,
        unknown: 0,
    };
    const signupsByDay: { [key: string]: number } = {};
    let activeLast7Days = 0;

    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);

    userSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Tier Distribution
        const tier = data.tier || 'unknown';
        if (tier in tierDistribution) {
            tierDistribution[tier as UserTier]++;
        } else {
            tierDistribution.unknown++;
        }

        // Signups
        const createdAt = data.createdAt?.toDate();
        if (createdAt && isAfter(createdAt, thirtyDaysAgo)) {
            const dateStr = format(createdAt, 'yyyy-MM-dd');
            signupsByDay[dateStr] = (signupsByDay[dateStr] || 0) + 1;
        }

        // Active Users
        const lastLogin = data.lastLogin?.toDate();
        if (lastLogin && isAfter(lastLogin, sevenDaysAgo)) {
            activeLast7Days++;
        }
    });

    // Format signups for chart
    const signupsLast30Days = [];
    for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        signupsLast30Days.push({
            date: format(date, 'MMM d'),
            count: signupsByDay[dateStr] || 0,
        });
    }

    return {
        totalUsers,
        tierDistribution,
        signupsLast30Days,
        activeLast7Days,
    };
}
