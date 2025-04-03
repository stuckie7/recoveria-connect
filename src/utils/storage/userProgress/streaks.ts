
/**
 * Streak management utilities
 */

import { daysBetween } from '../../dates';
import { getUserProgress, saveUserProgress } from './types';

/**
 * Update streak count
 */
export const updateStreak = () => {
  const progress = getUserProgress();
  
  // Verify the start date is a valid date
  let startDate;
  try {
    startDate = new Date(progress.startDate);
    if (isNaN(startDate.getTime())) {
      console.error('Invalid start date detected in updateStreak');
      // Set to today as a fallback
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      progress.startDate = startDate.toISOString();
    }
  } catch (error) {
    console.error('Error parsing start date:', error);
    // Set to today as a fallback
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    progress.startDate = startDate.toISOString();
  }
  
  // Calculate days between start date and today
  const currentDays = daysBetween(startDate);
  console.log('Current streak days calculation:', currentDays);
  
  // Update current streak and total days sober
  progress.currentStreak = currentDays;
  progress.totalDaysSober = currentDays;
  
  // Update longest streak if current streak is longer
  if (progress.currentStreak > progress.longestStreak) {
    console.log('Updating longest streak to:', progress.currentStreak);
    progress.longestStreak = progress.currentStreak;
  }
  
  // Update milestones
  let milestonesUpdated = false;
  
  progress.milestones.forEach((milestone) => {
    if (!milestone.achieved && progress.currentStreak >= milestone.days) {
      milestone.achieved = true;
      milestone.date = new Date().toISOString();
      milestonesUpdated = true;
      console.log('Milestone achieved:', milestone.name);
    }
  });
  
  // Generate new milestones if needed
  const highestMilestone = progress.milestones.reduce((max, m) => Math.max(max, m.days), 0);
  const monthsCompleted = Math.floor(currentDays / 30);
  const highestMonthMilestone = Math.floor(highestMilestone / 30);
  
  if (monthsCompleted > highestMonthMilestone) {
    console.log('Generating new monthly milestones based on current streak:', currentDays);
    const { generateMonthlyMilestones } = require('./milestones');
    const newMilestones = generateMonthlyMilestones(currentDays);
    progress.milestones = newMilestones;
    milestonesUpdated = true;
  }
  
  // Save updated progress
  saveUserProgress(progress);
  return progress;
};

/**
 * Verify streak integrity
 * This function ensures the streak data is consistent with the sobriety start date
 */
export const verifyStreakIntegrity = () => {
  const progress = getUserProgress();
  const startDate = new Date(progress.startDate);
  
  // Check if start date is valid
  if (isNaN(startDate.getTime())) {
    console.warn('Invalid start date found in verifyStreakIntegrity');
    return false;
  }
  
  // Calculate current streak based on start date
  const calculatedStreak = daysBetween(startDate);
  
  // Check if current streak matches calculated streak
  const isCurrentStreakCorrect = progress.currentStreak === calculatedStreak;
  
  // Check if longest streak is at least as large as current streak
  const isLongestStreakCorrect = progress.longestStreak >= progress.currentStreak;
  
  // Check if total days sober matches current streak
  const isTotalDaysSoberCorrect = progress.totalDaysSober === calculatedStreak;
  
  // Fix any discrepancies
  if (!isCurrentStreakCorrect || !isLongestStreakCorrect || !isTotalDaysSoberCorrect) {
    console.log('Fixing streak integrity issues:');
    console.log('Current streak:', progress.currentStreak, 'Calculated:', calculatedStreak);
    console.log('Longest streak:', progress.longestStreak);
    console.log('Total days sober:', progress.totalDaysSober);
    
    // Update current streak and total days sober
    progress.currentStreak = calculatedStreak;
    progress.totalDaysSober = calculatedStreak;
    
    // Update longest streak if needed
    if (calculatedStreak > progress.longestStreak) {
      progress.longestStreak = calculatedStreak;
    }
    
    // Save fixed progress
    saveUserProgress(progress);
    return true;
  }
  
  return true;
};
