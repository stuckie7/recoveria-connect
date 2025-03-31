
/**
 * Milestone-related date utilities
 */

import { daysBetween } from './calculations';

// Define standard milestone days for consistency across the app
// Updated to include monthly milestones (30-day intervals)
export const MILESTONE_DAYS = [
  1, 7, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 365, 730, 1095
]; // includes monthly milestones plus key milestones

/**
 * Get the next milestone date
 */
export const getNextMilestoneDate = (startDate: Date | string, currentDays: number): Date => {
  // Create a new date object to avoid modifying the original
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // Find the next milestone
  const nextMilestone = MILESTONE_DAYS.find(days => days > currentDays);
  
  // If no predefined milestone is found, calculate the next monthly milestone
  const targetDays = nextMilestone || (Math.floor(currentDays / 30) + 1) * 30;
  
  // Create a new date object based on the start date
  const targetDate = new Date(start);
  // Add the milestone days to the start date
  targetDate.setDate(targetDate.getDate() + targetDays);
  
  return targetDate;
};

/**
 * Get upcoming milestones based on current progress
 */
export const getUpcomingMilestones = (startDate: Date | string, currentDays: number, count = 3): { days: number, date: Date }[] => {
  // Create a new date object to avoid modifying the original
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // Filter to get only upcoming milestones
  const upcomingMilestones = MILESTONE_DAYS
    .filter(days => days > currentDays)
    .slice(0, count);
  
  // If we don't have enough upcoming predefined milestones, add custom monthly ones
  if (upcomingMilestones.length < count) {
    const lastMilestone = upcomingMilestones.length > 0 
      ? upcomingMilestones[upcomingMilestones.length - 1] 
      : currentDays;
    
    // Find the next monthly milestone after the last one
    const nextMonthlyMilestone = Math.ceil(lastMilestone / 30) * 30;
    
    for (let i = upcomingMilestones.length; i < count; i++) {
      // Add 30 days (1 month) for each additional milestone
      const nextMilestone = nextMonthlyMilestone + 30 * (i - upcomingMilestones.length);
      upcomingMilestones.push(nextMilestone);
    }
  }
  
  // Calculate dates for each milestone by adding days to the start date
  return upcomingMilestones.map(days => {
    const milestoneDate = new Date(start);
    milestoneDate.setDate(milestoneDate.getDate() + days);
    return { days, date: milestoneDate };
  });
};

/**
 * Get a readable milestone description
 */
export const getMilestoneDescription = (days: number): string => {
  if (days === 1) return "First day sober";
  if (days === 7) return "One week sober";
  
  // Handle monthly milestones (30-day intervals)
  if (days % 30 === 0) {
    const months = days / 30;
    if (months === 1) return "One month sober";
    if (months === 2) return "Two months sober";
    if (months === 3) return "Three months sober";
    if (months === 4) return "Four months sober";
    if (months === 5) return "Five months sober";
    if (months === 6) return "Six months sober";
    if (months === 7) return "Seven months sober";
    if (months === 8) return "Eight months sober";
    if (months === 9) return "Nine months sober";
    if (months === 10) return "Ten months sober";
    if (months === 11) return "Eleven months sober";
    if (months === 12) return "One year sober";
    return `${months} months sober`;
  }
  
  // Handle yearly milestones
  if (days === 365) return "One year sober";
  if (days === 730) return "Two years sober";
  if (days === 1095) return "Three years sober";
  
  // For custom milestones
  if (days < 30) return `${days} days sober`;
  
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  
  if (remainingDays === 0) return `${years} year${years > 1 ? 's' : ''} sober`;
  
  const remainingMonths = Math.floor(remainingDays / 30);
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''} sober`;
  
  return `${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} sober`;
};

/**
 * Generate dynamic milestone data for any period
 * This function creates milestone objects for any number of days
 */
export const generateMilestoneName = (days: number): string => {
  if (days === 1) return "First Day";
  if (days === 7) return "One Week";
  
  // Monthly milestones
  if (days % 30 === 0) {
    const months = days / 30;
    if (months === 1) return "One Month";
    if (months === 2) return "Two Months";
    if (months === 3) return "Three Months";
    if (months === 4) return "Four Months";
    if (months === 5) return "Five Months";
    if (months === 6) return "Six Months";
    if (months === 7) return "Seven Months";
    if (months === 8) return "Eight Months";
    if (months === 9) return "Nine Months";
    if (months === 10) return "Ten Months";
    if (months === 11) return "Eleven Months";
    if (months === 12) return "One Year";
    return `${months} Months`;
  }
  
  // Yearly milestones
  if (days === 365) return "One Year";
  if (days === 730) return "Two Years";
  if (days === 1095) return "Three Years";
  
  // For non-standard days
  return `${days} Days`;
};

/**
 * Generate a milestone icon based on the days
 */
export const getMilestoneIcon = (days: number): string => {
  if (days === 1) return "star";
  if (days === 7) return "medal";
  if (days === 30) return "calendar";
  if (days === 90) return "trophy";
  if (days === 180) return "award";
  if (days === 365) return "crown";
  if (days % 30 === 0) return "calendar"; // Monthly milestones get calendar
  if (days % 365 === 0) return "crown";   // Yearly milestones get crown
  return "medal"; // Default icon
};
