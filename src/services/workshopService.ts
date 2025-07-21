
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, increment, query, orderBy, limit, runTransaction, serverTimestamp, where, deleteDoc } from 'firebase/firestore';
import type { QuestPack } from '@/lib/types';
import { getUserProfile } from './userService';

const QUEST_PACKS_COLLECTION = 'quest_packs';
const USER_QUESTS_COLLECTION = 'quests';

/**
 * Retrieves a list of quest packs based on sorting options.
 * @param options - Filtering and sorting options.
 * @returns A promise that resolves to an array of quest packs.
 */
export async function getQuestPacks(options: { sortBy: 'newest' | 'popular' | 'trending' | 'user', userId?: string, limitCount?: number }): Promise<QuestPack[]> {
    if (!db) throw new Error("Firestore not initialized");

    const { sortBy, userId, limitCount = 12 } = options;
    let q;
    const packsRef = collection(db, QUEST_PACKS_COLLECTION);

    if (sortBy === 'user') {
        if (!userId) {
            throw new Error("A userId must be provided when sorting by user.");
        }
        q = query(packsRef, where('creatorId', '==', userId), orderBy('createdAt', 'desc'), limit(limitCount));
    } else {
        switch (sortBy) {
            case 'popular':
                q = query(packsRef, orderBy('downloads', 'desc'), limit(limitCount));
                break;
            case 'trending':
                // Simple trending: combination of upvotes and recent creation.
                // A more complex algorithm would be needed for true trending.
                q = query(packsRef, orderBy('upvotes', 'desc'), limit(limitCount));
                break;
            case 'newest':
            default:
                q = query(packsRef, orderBy('createdAt', 'desc'), limit(limitCount));
                break;
        }
    }


    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        } as QuestPack;
    });
}


/**
 * Allows a user to upvote a quest pack. A user can only upvote a pack once.
 * @param packId The ID of the quest pack to upvote.
 * @param userId The ID of the user upvoting.
 * @returns A promise that resolves when the transaction is complete.
 */
export async function upvoteQuestPack(packId: string, userId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");

    const packRef = doc(db, QUEST_PACKS_COLLECTION, packId);
    const upvoteRef = doc(db, QUEST_PACKS_COLLECTION, packId, 'upvotes', userId);

    await runTransaction(db, async (transaction) => {
        const upvoteDoc = await transaction.get(upvoteRef);
        if (upvoteDoc.exists()) {
            // User has already upvoted, so we remove the upvote
            transaction.delete(upvoteRef);
            transaction.update(packRef, { upvotes: increment(-1) });
        } else {
            // User has not upvoted, so we add the upvote
            transaction.set(upvoteRef, { timestamp: new Date() });
            transaction.update(packRef, { upvotes: increment(1) });
        }
    });
}

/**
 * Adds a quest pack to a user's quest list and increments the download count.
 * @param packId The ID of the quest pack to add.
 * @param userId The ID of the user adding the pack.
 * @returns A promise that resolves when the pack has been added.
 */
export async function addQuestPackToUser(packId: string, userId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const packRef = doc(db, QUEST_PACKS_COLLECTION, packId);
  const userQuestsRef = collection(db, 'users', userId, USER_QUESTS_COLLECTION);

  await runTransaction(db, async (transaction) => {
    const packDoc = await transaction.get(packRef);
    if (!packDoc.exists()) {
      throw new Error("Quest pack not found.");
    }
    
    const packData = packDoc.data() as QuestPack;
    
    // Batch add all quests from the pack to the user's quest list
    const batch = writeBatch(db); // Note: Use a new batch within the transaction for this part
    packData.quests.forEach(questTemplate => {
      const newQuestRef = doc(userQuestsRef);
      batch.set(newQuestRef, {
        ...questTemplate,
        user_id: userId,
        goal_id: packId, // Link back to the original pack
        completed: false,
        created_at: new Date(),
      });
    });
    
    await batch.commit();

    // Increment download count on the pack itself
    transaction.update(packRef, { downloads: increment(1) });
  });
}

/**
 * Creates a new quest pack in the workshop.
 * @param userId The ID of the user creating the pack.
 * @param packData The data for the new quest pack.
 * @returns The ID of the newly created quest pack.
 */
export async function createQuestPack(
  userId: string,
  packData: Omit<QuestPack, 'id' | 'creatorId' | 'creatorNickname' | 'downloads' | 'upvotes' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const userProfile = await getUserProfile(userId);

  const newPackData = {
    ...packData,
    creatorId: userId,
    creatorNickname: userProfile.nickname,
    downloads: 0,
    upvotes: 0,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, QUEST_PACKS_COLLECTION), newPackData);
  return docRef.id;
}


/**
 * Deletes a quest pack from the workshop. Only the creator can delete it.
 * @param packId The ID of the quest pack to delete.
 * @param userId The ID of the user attempting to delete the pack.
 */
export async function deleteQuestPack(packId: string, userId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");

    const packRef = doc(db, QUEST_PACKS_COLLECTION, packId);
    
    await runTransaction(db, async (transaction) => {
        const packDoc = await transaction.get(packRef);
        if (!packDoc.exists()) {
            throw new Error("Quest pack not found.");
        }

        const packData = packDoc.data();
        if (packData.creatorId !== userId) {
            throw new Error("You are not authorized to delete this quest pack.");
        }
        
        transaction.delete(packRef);
    });
}
