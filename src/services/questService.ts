
'use client';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Quest } from '@/lib/types';

/**
 * Retrieves all quests for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of quests.
 */
export async function getUserQuests(userId: string): Promise<Quest[]> {
  if (!db) throw new Error('Firestore not initialized');
  const questsCollectionRef = collection(db, 'users', userId, 'quests');
  const q = query(questsCollectionRef, orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const quests = querySnapshot.docs.map(doc => {
    const data = doc.data();
    const createdAtRaw = data.created_at;
    const createdAtIso = createdAtRaw?.toDate ? createdAtRaw.toDate().toISOString() : createdAtRaw;
    
    return {
      id: doc.id,
      ...data,
      created_at: createdAtIso ?? new Date().toISOString(),
    } as Quest;
  });
  
  return Array.isArray(quests) ? quests : [];
}

/**
 * Adds a new quest for a user.
 * @param userId The ID of the user.
 * @param questData The data for the new quest.
 * @returns A promise that resolves to the newly created quest object.
 */
export async function addQuest(userId: string, questData: Omit<Quest, 'id' | 'completed' | 'created_at'>): Promise<Quest> {
  if (!db) throw new Error('Firestore not initialized');
  const questsCollectionRef = collection(db, 'users', userId, 'quests');
  const newQuestPayload = {
    ...questData,
    completed: false,
    created_at: serverTimestamp()
  };
  const docRef = await addDoc(questsCollectionRef, newQuestPayload);
  
  return {
    ...questData,
    id: docRef.id,
    completed: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Updates an existing quest for a user.
 * @param userId The ID of the user.
 * @param questId The ID of the quest to update.
 * @param questData An object containing the fields to update.
 */
export async function updateQuest(userId: string, questId: string, questData: Partial<Omit<Quest, 'id' | 'created_at'>>): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const questDocRef = doc(db, 'users', userId, 'quests', questId);
  await updateDoc(questDocRef, questData);
}

/**
 * Deletes a quest for a user.
 * @param userId The ID of the user.
 * @param questId The ID of the quest to delete.
 */
export async function deleteQuest(userId: string, questId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const questDocRef = doc(db, 'users', userId, 'quests', questId);
  await deleteDoc(questDocRef);
}
