
/**
 * Date utilities for the recovery app
 */

/**
 * Calculate the number of days between two dates
 */
export const daysBetween = (start: Date | string, end: Date = new Date()): number => {
  const startDate = typeof start === 'string' ? new Date(start) : new Date(start);
  const endDate = new Date(end);
  
  // Reset hours to ensure accurate day calculation
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  // Convert milliseconds to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Format a date as a relative time (e.g., "2 days ago", "just now")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Format a date as a readable string (e.g., "Monday, January 1, 2023")
 */
export const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions = {}): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Get the next milestone date
 */
export const getNextMilestoneDate = (startDate: Date | string, currentDays: number): Date => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  // Common milestones in days
  const milestones = [1, 7, 30, 60, 90, 180, 365, 730, 1095]; // 1d, 1w, 1m, 2m, 3m, 6m, 1y, 2y, 3y
  
  // Find the next milestone
  const nextMilestone = milestones.find(days => days > currentDays) || (currentDays + 30);
  
  // Calculate the target date
  const targetDate = new Date(start);
  targetDate.setDate(targetDate.getDate() + nextMilestone);
  
  return targetDate;
};

/**
 * Get upcoming milestones based on current progress
 */
export const getUpcomingMilestones = (startDate: Date | string, currentDays: number, count = 3): { days: number, date: Date }[] => {
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  
  // Common milestones in days
  const milestones = [1, 7, 30, 60, 90, 180, 365, 730, 1095]; // 1d, 1w, 1m, 2m, 3m, 6m, 1y, 2y, 3y
  
  // Filter to get only upcoming milestones
  const upcomingMilestones = milestones
    .filter(days => days > currentDays)
    .slice(0, count);
  
  // If we don't have enough upcoming predefined milestones, add custom ones
  if (upcomingMilestones.length < count) {
    const lastMilestone = upcomingMilestones.length > 0 
      ? upcomingMilestones[upcomingMilestones.length - 1] 
      : currentDays;
    
    for (let i = upcomingMilestones.length; i < count; i++) {
      upcomingMilestones.push(lastMilestone + 30 * (i - upcomingMilestones.length + 1));
    }
  }
  
  // Calculate dates for each milestone
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
  if (days === 30) return "One month sober";
  if (days === 60) return "Two months sober";
  if (days === 90) return "Three months sober";
  if (days === 180) return "Six months sober";
  if (days === 365) return "One year sober";
  if (days === 730) return "Two years sober";
  if (days === 1095) return "Three years sober";
  
  // For custom milestones
  if (days < 30) return `${days} days sober`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} sober`;
  }
  
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  if (remainingDays === 0) return `${years} year${years > 1 ? 's' : ''} sober`;
  
  const remainingMonths = Math.floor(remainingDays / 30);
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''} sober`;
  
  return `${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} sober`;
};
