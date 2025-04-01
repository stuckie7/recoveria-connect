
/**
 * Date formatting utilities
 */

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
