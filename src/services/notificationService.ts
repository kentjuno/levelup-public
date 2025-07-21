
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, writeBatch, serverTimestamp, query, orderBy, increment, limit, getDocs, where, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { isToday, subDays } from 'date-fns';
import type { Notification, ActivityLogEntry, Quest, Announcement } from '@/lib/types';
import { MAX_HP, HP_LOST_PER_MISSED_TASK } from '@/lib/constants';
import { generateDailySummary } from '@/ai/flows/generate-daily-summary';
import { isQuestActiveOnDay, isCompletedForPeriod } from '@/lib/quests';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

/**
 * Adds a notification for a user and increments their unread count.
 * @param userId The ID of the user.
 * @param notificationData The notification content.
 */
export async function addNotification(userId: string, notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    if (!db) return;
    const batch = writeBatch(db);
    const notificationsRef = doc(collection(db, 'users', userId, 'notifications'));
    batch.set(notificationsRef, { ...notificationData, createdAt: serverTimestamp(), isRead: false });
    
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { unreadNotificationCount: increment(1) });
    
    await batch.commit();
}

/**
 * Retrieves notifications for a user.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of notifications.
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
    if (!db) throw new Error('Firestore not initialized');
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() ?? new Date().toISOString(),
    } as Notification));
}

/**
 * Marks all of a user's notifications as read.
 * @param userId The ID of the user.
 */
export async function markNotificationsAsRead(userId: string) {
    if (!db) return;
    const userRef = doc(db, 'users', userId);
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('isRead', '==', false));
    
    const unreadSnapshot = await getDocs(q);
    if (unreadSnapshot.empty) {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().unreadNotificationCount > 0) {
            await updateDoc(userRef, { unreadNotificationCount: 0 });
        }
        return;
    }

    const batch = writeBatch(db);
    unreadSnapshot.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    batch.update(userRef, { unreadNotificationCount: 0 });

    await batch.commit();
}

/**
 * Logs a significant user activity.
 * @param userId The ID of the user.
 * @param type The type of activity.
 * @param details Additional details about the activity.
 */
export async function logActivity(userId: string, type: ActivityLogEntry['type'], details: ActivityLogEntry['details']): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const activityLogRef = collection(db, 'users', userId, 'activity_log');
  await addDoc(activityLogRef, {
    timestamp: serverTimestamp(),
    type,
    details,
  });
}

/**
 * Retrieves the most recent activity log entries for a user.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of activity log entries.
 */
export async function getUserActivityLog(userId: string): Promise<ActivityLogEntry[]> {
    if (!db) throw new Error('Firestore not initialized');
    const activityLogRef = collection(db, 'users', userId, 'activity_log');
    const q = query(activityLogRef, orderBy('timestamp', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate().toISOString() ?? new Date().toISOString(),
        } as ActivityLogEntry;
    });
}

/**
 * Gathers data for the daily summary from yesterday's activity log.
 * @param userId The ID of the user.
 * @param date The date to summarize (typically yesterday).
 * @returns An object with counts of completed/missed items and XP earned.
 */
async function getDailySummaryData(userId:string, date: Date): Promise<{ tasksCompleted: number; questsCompleted: number; xpEarned: number; tasksMissed: number; hpLost: number; }> {
    if (!db) throw new Error('Firestore not initialized');

    const startOfDayTs = new Date(date);
    startOfDayTs.setHours(0, 0, 0, 0);
    const endOfDayTs = new Date(date);
    endOfDayTs.setHours(23, 59, 59, 999);

    const activityLogRef = collection(db, 'users', userId, 'activity_log');
    const q = query(activityLogRef, where('timestamp', '>=', startOfDayTs), where('timestamp', '<=', endOfDayTs));
    const querySnapshot = await getDocs(q);

    let tasksCompleted = 0, questsCompleted = 0, xpEarned = 0, tasksMissed = 0, hpLost = 0;
    const uniqueQuestIds = new Set<string>();

    querySnapshot.forEach(doc => {
        const entry = doc.data() as ActivityLogEntry;
        if (entry.type === 'TASK_COMPLETED') {
            tasksCompleted++;
            xpEarned += entry.details.xp ?? 0;
        } else if (entry.type === 'QUEST_COMPLETED' && entry.details.questId && !uniqueQuestIds.has(entry.details.questId)) {
            questsCompleted++;
            uniqueQuestIds.add(entry.details.questId);
            xpEarned += entry.details.xp ?? 0;
        } else if (entry.type === 'HP_LOST') {
            tasksMissed++;
            hpLost += Math.abs(entry.details.hpChange ?? 0);
        }
    });
    return { tasksCompleted, questsCompleted, xpEarned, tasksMissed, hpLost };
}


/**
 * Handles daily login logic, including checking for missed tasks and generating a daily summary.
 * @param userId The ID of the user logging in.
 * @returns A boolean indicating if any new notifications were added.
 */
export async function handleDailyLogin(userId: string): Promise<boolean> {
    if (!db) throw new Error("Firestore not initialized");

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    const lastUpdate = userData.lastHpUpdate?.toDate();
    
    if (lastUpdate && isToday(lastUpdate)) return false; // Already processed today
    
    let notificationsAdded = false;
    const yesterday = subDays(new Date(), 1);

    // 1. Process HP Loss for missed tasks from yesterday
    const questsRef = collection(db, 'users', userId, 'quests');
    const questsSnapshot = await getDocs(query(questsRef, where("completed", "==", false)));
    let missedTasksCount = 0;
    
    for (const questDoc of questsSnapshot.docs) {
        const quest = questDoc.data() as Quest;
        if (quest.tasks?.length && isQuestActiveOnDay(quest, yesterday)) {
            for (const task of quest.tasks) {
                if (!isCompletedForPeriod(task.lastCompleted, quest.recurrence, yesterday)) {
                    missedTasksCount++;
                }
            }
        }
    }

    if (missedTasksCount > 0) {
        const hpLost = missedTasksCount * HP_LOST_PER_MISSED_TASK;
        const newHp = Math.max(0, (userData.hp ?? MAX_HP) - hpLost);
        await updateDoc(userRef, { hp: newHp });
        await addNotification(userId, { type: 'hp-loss', title: 'Ouch! HP Lost', message: `You lost ${hpLost} HP for missing ${missedTasksCount} task(s) yesterday.` });
        notificationsAdded = true;
    }

    // 2. Generate and store Daily Summary for yesterday
    const summaryData = await getDailySummaryData(userId, yesterday);
    if (Object.values(summaryData).some(val => val > 0)) {
        try {
            const summary = await generateDailySummary({ nickname: userData.nickname, ...summaryData });
            await addNotification(userId, { type: 'daily-summary', title: summary.title, message: summary.message });
            notificationsAdded = true;
        } catch (e) {
            console.error("Failed to generate daily summary:", e);
        }
    }
    
    // 3. Update timestamp to prevent re-running today
    await updateDoc(userRef, { lastHpUpdate: serverTimestamp() });
    return notificationsAdded;
}

/**
 * Sends an announcement to all users in the system.
 * This is an admin-only function.
 * @param title The title of the announcement.
 * @param message The message content of the announcement.
 */
export async function sendAnnouncementToAllUsers(title: string, message: string): Promise<{ success: boolean; userCount: number }> {
    if (!db) throw new Error("Firestore not initialized");

    // 1. Log the announcement in a top-level collection for history
    const announcementDocRef = doc(collection(db, ANNOUNCEMENTS_COLLECTION));
    await setDoc(announcementDocRef, {
        title,
        message,
        createdAt: serverTimestamp(),
    });

    // 2. Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
        return { success: true, userCount: 0 };
    }

    // 3. Batch-write notifications to all users
    const userDocs = usersSnapshot.docs;
    const batchPromises = [];
    const BATCH_SIZE = 500; // Firestore batch limit

    for (let i = 0; i < userDocs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const userChunk = userDocs.slice(i, i + BATCH_SIZE);

        for (const userDoc of userChunk) {
            const userId = userDoc.id;
            const userRef = doc(db, 'users', userId);
            const notificationRef = doc(collection(db, 'users', userId, 'notifications'));

            batch.set(notificationRef, {
                title,
                message,
                type: 'announcement',
                isRead: false,
                createdAt: serverTimestamp(),
            });
            batch.update(userRef, { unreadNotificationCount: increment(1) });
        }
        batchPromises.push(batch.commit());
    }

    await Promise.all(batchPromises);

    return { success: true, userCount: userDocs.length };
}

/**
 * Retrieves all global announcements sent by admins.
 * @returns A promise resolving to an array of announcements.
 */
export async function getGlobalAnnouncements(): Promise<Announcement[]> {
    if (!db) throw new Error('Firestore not initialized');
    const announcementsRef = collection(db, ANNOUNCEMENTS_COLLECTION);
    const q = query(announcementsRef, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            message: data.message,
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        } as Announcement;
    });
}
