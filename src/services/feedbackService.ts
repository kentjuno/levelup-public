
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import type { Feedback, FeedbackType } from '@/lib/types';

const FEEDBACK_COLLECTION = 'feedback';

/**
 * Submits feedback from a user.
 * @param userId The ID of the user submitting feedback.
 * @param data An object containing the feedback type and message.
 */
export async function submitFeedback(userId: string, data: { type: FeedbackType; message: string; }) {
  if (!db) throw new Error('Firestore not initialized');
  
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) throw new Error('User not found');

  const userData = userDoc.data();
  const userNickname = userData.nickname || `user_${userId.substring(0, 4)}`;
  const userEmail = userData.email || 'N/A';

  const feedbackCollectionRef = collection(db, FEEDBACK_COLLECTION);
  await addDoc(feedbackCollectionRef, {
    userId,
    userNickname,
    userEmail,
    type: data.type,
    message: data.message,
    status: 'new',
    createdAt: serverTimestamp(),
  });
}

/**
 * Retrieves all feedback entries, ordered by creation date.
 * @returns A promise that resolves to an array of all feedback.
 */
export async function getAllFeedback(): Promise<Feedback[]> {
    if (!db) throw new Error('Firestore not initialized');
    const feedbackCollectionRef = collection(db, FEEDBACK_COLLECTION);
    const q = query(feedbackCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
        } as Feedback;
    });
}
