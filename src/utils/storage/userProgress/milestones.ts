
/**
 * Milestone tracking utilities
 */

import { Milestone } from '@/types';
import { generateMilestoneName, getMilestoneIcon } from '../../dates';
import { getUserProgress, saveUserProgress } from '../types';

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
