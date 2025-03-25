
/**
 * User progress storage utilities
 */

import { UserProgress, CheckIn } from '@/types';
import { STORAGE_KEYS, DEFAULT_MILESTONES } from './constants';

/**
 * Initialize user progress with default values
 */
export const initializeUserProgress = (): UserProgress => {
  const today = new Date().toISOString();
  
  return {
    startDate: today,
    currentStreak: 0,
    longestStreak: 0,
    totalDaysSober: 0,
    relapses: 0,
    milestones: DEFAULT_MILESTONES,
    checkIns: [],
  };
};

/**
 * Get user progress from local storage or initialize if not exists
 */
export const getUserProgress = (): UserProgress => {
  const progressString = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  
  if (!progressString) {
    const initialProgress = initializeUserProgress();
    saveUserProgress(initialProgress);
    return initialProgress;
  }
  
  return JSON.parse(progressString);
};

/**
 * Save user progress to local storage
 */
export const saveUserProgress = (progress: UserProgress): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
};

/**
 * Add a new check-in
 */
export const addCheckIn = (checkIn: Omit<CheckIn, 'id'>): CheckIn => {
  const progress = getUserProgress();
  
  const newCheckIn: CheckIn = {
    ...checkIn,
    id: Date.now().toString(),
  };
  
  progress.checkIns.push(newCheckIn);
  saveUserProgress(progress);
  
  return newCheckIn;
};

/**
 * Mark a milestone as achieved
 */
export const achieveMilestone = (milestoneId: string): void => {
  const progress = getUserProgress();
  
  const milestone = progress.milestones.find(m => m.id === milestoneId);
  if (milestone && !milestone.achieved) {
    milestone.achieved = true;
    milestone.date = new Date().toISOString();
    saveUserProgress(progress);
  }
};

/**
 * Set sobriety start date
 */
export const setSobrietyStartDate = (date: Date): void => {
  const progress = getUserProgress();
  progress.startDate = date.toISOString();
  progress.currentStreak = 0;
  
  // Reset milestones
  progress.milestones.forEach(milestone => {
    milestone.achieved = false;
    delete milestone.date;
  });
  
  saveUserProgress(progress);
};

/**
 * Update streak count
 */
export const updateStreak = (): void => {
  const progress = getUserProgress();
  const today = new Date();
  
  // Increment current streak
  progress.currentStreak += 1;
  progress.totalDaysSober += 1;
  
  // Update longest streak if needed
  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }
  
  // Check if any milestones have been reached
  progress.milestones.forEach(milestone => {
    if (!milestone.achieved && progress.currentStreak >= milestone.days) {
      milestone.achieved = true;
      milestone.date = today.toISOString();
    }
  });
  
  saveUserProgress(progress);
};

/**
 * Record a relapse
 */
export const recordRelapse = (date: Date): void => {
  const progress = getUserProgress();
  
  progress.relapses += 1;
  progress.startDate = date.toISOString();
  progress.currentStreak = 0;
  
  // Reset unachieved milestones
  progress.milestones.forEach(milestone => {
    if (!milestone.achieved) {
      delete milestone.date;
    }
  });
  
  saveUserProgress(progress);
};
