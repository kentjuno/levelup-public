import { getWeek } from 'date-fns';

/**
 * Generates a unique ID for the current week.
 * @param date The date to get the week ID for.
 * @returns A string in the format "YYYY-WW".
 */
export function getWeekId(date: Date): string {
  const year = date.getFullYear();
  // ISO week number
  const week = getWeek(date, { weekStartsOn: 1 }); 
  return `${year}-${week.toString().padStart(2, '0')}`;
}
