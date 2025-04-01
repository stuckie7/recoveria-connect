
/**
 * User progress initialization utilities
 */

import { UserProgress } from '@/types';
import { DEFAULT_MILESTONES } from '../constants';
import { getUserProgress, saveUserProgress } from './types';

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
 * Set sobriety start date
 */
export const setSobrietyStartDate = (date: Date): void => {
  const progress = getUserProgress();
  const { generateMonthlyMilestones } = require('./milestones');
  const { daysBetween } = require('../../dates');
  
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  progress.startDate = normalizedDate.toISOString();
  
  progress.currentStreak = daysBetween(normalizedDate);
  progress.totalDaysSober = progress.currentStreak;
  
  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }
  
  progress.milestones = generateMonthlyMilestones(progress.currentStreak);
  
  saveUserProgress(progress);
};

/**
 * Record a relapse
 */
export const recordRelapse = (date: Date): void => {
  const progress = getUserProgress();
  const { DEFAULT_MILESTONES } = require('../constants');
  
  progress.relapses += 1;
  progress.startDate = date.toISOString();
  progress.currentStreak = 0;
  progress.totalDaysSober = 0;
  
  progress.milestones = DEFAULT_MILESTONES;
  
  saveUserProgress(progress);
};
