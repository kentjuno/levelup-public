

import { startOfDay, isBefore, isAfter, differenceInCalendarWeeks, getDate, getDaysInMonth, isToday, isSameMonth, isSameDay } from 'date-fns';
import type { Quest, Recurrence } from './types';

/**
 * Checks if a quest is active on a given day based on its recurrence rules.
 * @param quest The quest object to check.
 * @param day The date to check against.
 * @returns A boolean indicating if the quest is active.
 */
export const isQuestActiveOnDay = (quest: Quest, day: Date): boolean => {
    const checkDay = startOfDay(day);
    const startDate = quest.start_date ? startOfDay(new Date(quest.start_date)) : startOfDay(new Date(quest.created_at));

    if (isBefore(checkDay, startDate)) {
        return false;
    }

    if (quest.due_date) {
        const dueDate = startOfDay(new Date(quest.due_date));
        if (isAfter(checkDay, dueDate)) {
            return false;
        }
    }
    
    if (!quest.recurrence) {
        return true; 
    }
    
    switch (quest.recurrence.type) {
        case 'once':
        case 'daily':
            return true;
        case 'bi-weekly':
            const weeksSinceStart = differenceInCalendarWeeks(checkDay, startDate, { weekStartsOn: 1 });
            return weeksSinceStart % 2 === 0;
        case 'monthly':
            const startDayOfMonth = getDate(startDate);
            const todayDayOfMonth = getDate(checkDay);

            if (startDayOfMonth > getDaysInMonth(checkDay)) {
                return todayDayOfMonth === getDaysInMonth(checkDay);
            }
            return todayDayOfMonth === startDayOfMonth;
        case 'days_of_week':
            if (!quest.recurrence.days || quest.recurrence.days.length === 0) {
                return true;
            }
            const todayDayIndex = checkDay.getDay(); // Sunday is 0
            return quest.recurrence.days.includes(todayDayIndex);
        default:
            return true;
    }
};

/**
 * Checks if a task is considered complete for the current period based on its recurrence.
 * @param lastCompleted The ISO string of the last completion date.
 * @param recurrence The recurrence rule of the parent quest.
 * @param checkDate The date to check against (defaults to now).
 * @returns A boolean indicating if the task is complete for the current period.
 */
export const isCompletedForPeriod = (lastCompleted: string | null, recurrence: Recurrence | null | undefined, checkDate: Date = new Date()): boolean => {
  if (!lastCompleted) return false;
  
  const lastCompletedDate = new Date(lastCompleted);
  
  const getBiWeeklyBucket = (date: Date) => Math.floor(differenceInCalendarWeeks(date, new Date(0), { weekStartsOn: 1 }) / 2);

  switch (recurrence?.type) {
    case 'once':
        return !!lastCompleted; // If it has ever been completed, it's done for good.
    case 'bi-weekly': 
      return getBiWeeklyBucket(checkDate) === getBiWeeklyBucket(lastCompletedDate);
    case 'monthly': return isSameMonth(lastCompletedDate, checkDate);
    case 'days_of_week':
    case 'daily':
    default: return isSameDay(lastCompletedDate, checkDate);
  }
};
