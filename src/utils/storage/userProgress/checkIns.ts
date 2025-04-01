
/**
 * Check-in management utilities
 */

import { CheckIn } from '@/types';
import { getUserProgress, saveUserProgress } from './types';

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
