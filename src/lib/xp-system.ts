// The base XP required for the first level-up (from 1 to 2).
const BASE_XP = 100;

// The exponent that controls how quickly the XP requirement increases.
// A value of 1.5 provides a moderate, steady increase in difficulty.
const LEVEL_EXPONENT = 1.5;

/**
 * Calculates the XP needed to advance from (level - 1) to the given level.
 * @param level The target level.
 * @returns The amount of XP required to reach that level from the previous one.
 */
export const getXpForLevelup = (level: number): number => {
    if (level <= 1) return 0; // Level 1 requires 0 XP.
    // The formula for a smooth, exponential curve.
    return Math.floor(BASE_XP * ((level - 1) ** LEVEL_EXPONENT));
}

/**
 * Calculates all relevant level information based on a user's total XP.
 * @param totalXp The user's total accumulated experience points.
 * @returns An object containing the current level, XP within that level, and XP needed for the next level.
 */
export const calculateLevelInfo = (totalXp: number): { level: number; xpInLevel: number; xpToNextLevel: number } => {
    let level = 1;
    let accumulatedXp = 0;
    let xpForNextLevelup = getXpForLevelup(level + 1);

    // Loop until we find the current level by seeing where the totalXp falls.
    while (totalXp >= accumulatedXp + xpForNextLevelup) {
        accumulatedXp += xpForNextLevelup;
        level++;
        xpForNextLevelup = getXpForLevelup(level + 1);
    }

    // The XP the user has earned *within* their current level.
    const xpInLevel = totalXp - accumulatedXp;
    
    // The total XP required for the current level's progress bar.
    const xpToNextLevel = xpForNextLevelup;

    return {
        level,
        xpInLevel,
        xpToNextLevel,
    };
}

/**
 * Adjusts the XP gained from a task based on the user's current HP.
 * A penalty is applied if HP is below 50.
 * @param baseExp The base experience points of the task.
 * @param currentHP The user's current health points.
 * @returns The adjusted experience points, rounded to the nearest integer.
 */
export function getAdjustedExp(baseExp: number, currentHP: number): number {
  // No penalty if HP is above 50
  if (currentHP > 50) {
    return baseExp;
  }
  // Hard floor: if HP is very low, you still get 1 XP for the effort
  if (currentHP < 10) {
    return 1;
  }

  // Linear scale from 40% to 100% XP between 10 and 50 HP.
  // Formula: start_scale + ( (current_hp - min_hp) / (max_hp - min_hp) ) * (end_scale - start_scale)
  const minHpForScaling = 10;
  const maxHpForScaling = 50;
  const minScale = 0.4; // 40% XP at 10 HP
  const maxScale = 1.0; // 100% XP at 50 HP
  
  const scale = minScale + ((currentHP - minHpForScaling) / (maxHpForScaling - minHpForScaling)) * (maxScale - minScale);
  
  const adjusted = Math.round(baseExp * scale);
  // Ensure it's at least 1 XP
  return Math.max(1, adjusted);
}
