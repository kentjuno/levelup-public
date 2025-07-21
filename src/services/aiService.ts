
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, writeBatch, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import type { AiSuggestion } from '@/lib/types';
import type { GeneratePersonalizedGoalOutput } from '@/ai/flows/generate-personalized-goal';

/**
 * Retrieves the most recent AI-generated suggestions for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of AI suggestions.
 */
export async function getAiSuggestions(userId: string): Promise<AiSuggestion[]> {
  if (!db) throw new Error('Firestore not initialized');
  const suggestionsRef = collection(db, 'users', userId, 'ai_suggestions');
  const q = query(suggestionsRef, orderBy('createdAt', 'desc'), limit(5));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data() as GeneratePersonalizedGoalOutput & { createdAt: { toDate: () => Date } };
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
    } as AiSuggestion;
  });
}

/**
 * Adds a new AI suggestion to a user's history and manages the history limit.
 * @param userId The ID of the user.
 * @param suggestion The new suggestion to add.
 */
export async function addAiSuggestion(userId: string, suggestion: GeneratePersonalizedGoalOutput) {
  if (!db) throw new Error('Firestore not initialized');
  const suggestionsRef = collection(db, 'users', userId, 'ai_suggestions');
  
  const newSuggestionData = {
    ...suggestion,
    createdAt: serverTimestamp()
  };

  const q = query(suggestionsRef, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  
  const batch = writeBatch(db);

  // Keep history limited to 5 suggestions
  if (querySnapshot.size >= 5) {
    const oldestDoc = querySnapshot.docs[0];
    batch.delete(oldestDoc.ref);
  }

  const newDocRef = doc(suggestionsRef);
  batch.set(newDocRef, newSuggestionData);

  await batch.commit();
}
