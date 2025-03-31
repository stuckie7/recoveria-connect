
import { UserProgress, CheckIn, Milestone } from '@/types';
import { STORAGE_KEYS } from '../constants';

// Re-export the storage keys for use in the user progress modules
export { STORAGE_KEYS };

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

// Import the initialization function to avoid circular dependency issues
import { initializeUserProgress } from './initialize';
