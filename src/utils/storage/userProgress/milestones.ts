// Solution for milestone integration with user's sober date
// This modified version ensures milestones correspond to the user's inputted sober date

import { generateMilestoneName, getMilestoneIcon } from '../../dates';
import { getUserProgress, saveUserProgress } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Mark a milestone as achieved
 */
export const achieveMilestone = (milestoneId: string) => {
  const progress = getUserProgress();
  const milestone = progress.milestones.find((m) => m.id === milestoneId);
  
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
export const generateMonthlyMilestones = (daysSober: number) => {
  const completedMonths = Math.floor(daysSober / 30);
  const milestones = [];
  
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
 * Fetch and sync milestones with user's profile sobriety date
 * This ensures milestones correspond to the date input during onboarding
 */
export const syncMilestonesWithProfile = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Fetch sobriety date from user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('sobriety_start_date')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching sobriety date for milestones:', error);
      return null;
    }
    
    if (data && data.sobriety_start_date) {
      const profileDate = new Date(data.sobriety_start_date);
      
      if (!isNaN(profileDate.getTime())) {
        // Calculate days sober based on profile date
        const now = new Date();
        const daysSober = Math.floor((now.getTime() - profileDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Generate milestones based on this date
        const milestones = generateMonthlyMilestones(daysSober);
        
        // Update local storage
        const progress = getUserProgress();
        progress.startDate = profileDate.toISOString();
        progress.currentStreak = daysSober;
        progress.milestones = milestones;
        saveUserProgress(progress);
        
        return milestones;
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error syncing milestones with profile:', err);
    return null;
  }
};
