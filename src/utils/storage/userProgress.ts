/**
 * User progress storage utilities
 */

import { UserProgress, CheckIn, Milestone } from '@/types';
import { STORAGE_KEYS, DEFAULT_MILESTONES } from './constants';
import { daysBetween, generateMilestoneName, getMilestoneIcon } from '@/utils/dates';

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
 * Generate monthly milestones based on days sober
 * This dynamically creates milestone entries for each month
 */
export const generateMonthlyMilestones = (daysSober: number): Milestone[] => {
  const completedMonths = Math.floor(daysSober / 30);
  const milestones: Milestone[] = [];
  
  if (daysSober >= 1) {
    milestones.push({
      id: '1',
      days: 1,
      name: 'First Day',
      description: 'The most important step of your journey',
      achieved: true,
      date: new Date(Date.now() - (daysSober - 1) * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'star'
    });
  }
  
  if (daysSober >= 7) {
    milestones.push({
      id: '7',
      days: 7,
      name: 'One Week',
      description: 'A full week of progress',
      achieved: true,
      date: new Date(Date.now() - (daysSober - 7) * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'medal'
    });
  }
  
  for (let month = 1; month <= completedMonths; month++) {
    const days = month * 30;
    if (days <= daysSober) {
      milestones.push({
        id: `${days}`,
        days,
        name: generateMilestoneName(days),
        description: `${month} month${month > 1 ? 's' : ''} of dedication`,
        achieved: true,
        date: new Date(Date.now() - (daysSober - days) * 24 * 60 * 60 * 1000).toISOString(),
        icon: getMilestoneIcon(days)
      });
    }
  }
  
  for (let i = 1; i <= 3; i++) {
    const nextMonth = completedMonths + i;
    const days = nextMonth * 30;
    milestones.push({
      id: `${days}`,
      days,
      name: generateMilestoneName(days),
      description: `${nextMonth} month${nextMonth > 1 ? 's' : ''} of dedication`,
      achieved: false,
      icon: getMilestoneIcon(days)
    });
  }
  
  return milestones;
};

/**
 * Set sobriety start date
 */
export const setSobrietyStartDate = (date: Date): void => {
  const progress = getUserProgress();
  
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
    const newMilestones = generateMonthlyMilestones(currentDays);
    progress.milestones = newMilestones;
    milestonesUpdated = true;
  }
  
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
  progress.totalDaysSober = 0;
  
  progress.milestones = DEFAULT_MILESTONES;
  
  saveUserProgress(progress);
};
