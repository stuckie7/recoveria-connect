
/**
 * Basic date calculation utilities
 */

/**
 * Calculate the number of days between two dates
 */
export const daysBetween = (start: Date | string, end: Date = new Date()): number => {
  // Create new date objects to avoid modifying the original
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
