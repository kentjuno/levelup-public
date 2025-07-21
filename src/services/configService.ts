
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { TierSettings } from '@/lib/types';

const DEFAULT_TIER_SETTINGS: TierSettings = {
  bronze: { questLimit: 5, taskLimitPerQuest: 5 },
  silver: { questLimit: 10, taskLimitPerQuest: 5 },
  gold: { questLimit: 20, taskLimitPerQuest: 7 },
  diamond: { questLimit: null, taskLimitPerQuest: 10 },
};

/**
 * Retrieves the tier settings from Firestore, or creates default settings if none exist.
 * @returns A promise that resolves to the tier settings object.
 */
export async function getTierSettings(): Promise<TierSettings> {
  if (!db) throw new Error('Firestore not initialized');
  const configDocRef = doc(db, 'app_config', 'tier_settings');
  const docSnap = await getDoc(configDocRef);

  if (!docSnap.exists()) {
    await setDoc(configDocRef, DEFAULT_TIER_SETTINGS);
    return DEFAULT_TIER_SETTINGS;
  }
  
  const data = docSnap.data();
  // Merge with defaults to ensure all fields are present
  return {
      bronze: { ...DEFAULT_TIER_SETTINGS.bronze, ...data.bronze },
      silver: { ...DEFAULT_TIER_SETTINGS.silver, ...data.silver },
      gold: { ...DEFAULT_TIER_SETTINGS.gold, ...data.gold },
      diamond: { ...DEFAULT_TIER_SETTINGS.diamond, ...data.diamond },
  };
}

/**
 * Updates the tier settings in Firestore.
 * @param settings The new tier settings to save.
 */
export async function updateTierSettings(settings: TierSettings): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const configDocRef = doc(db, 'app_config', 'tier_settings');
    await setDoc(configDocRef, settings, { merge: true });
}
