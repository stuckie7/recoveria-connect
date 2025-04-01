
/**
 * Streak management utilities
 */

import { daysBetween } from '../../dates';
import { getUserProgress, saveUserProgress } from './types';

/**
 * Update streak count
 */
export const updateStreak = (): void => {
  const progress = getUserProgress();
  const startDate = new Date(progress.startDate);
  
  const currentDays = daysBetween(startDate);
  progress.currentStreak = currentDays;
  progress.totalDaysSober = currentDays;
  
  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }
  
  let milestonesUpdated = false;
  
  progress.milestones.forEach(milestone => {
    if (!milestone.achieved && progress.currentStreak >= milestone.days) {
      milestone.achieved = true;
      milestone.date = new Date().toISOString();
      milestonesUpdated = true;
    }
  });
  
  const highestMilestone = progress.milestones.reduce((max, m) => Math.max(max, m.days), 0);
  const monthsCompleted = Math.floor(currentDays / 30);
  const highestMonthMilestone = Math.floor(highestMilestone / 30);
  
  if (monthsCompleted > highestMonthMilestone) {
    const { generateMonthlyMilestones } = require('./milestones');
    const newMilestones = generateMonthlyMilestones(currentDays);
    progress.milestones = newMilestones;
    milestonesUpdated = true;
  }
  
  saveUserProgress(progress);
};
