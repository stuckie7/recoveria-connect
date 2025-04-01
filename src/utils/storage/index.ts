
/**
 * Storage utilities index file
 */

// Re-export all storage utilities
export * from './constants';
export * from './userProgress/index';  // Updated to use the index file
export * from './triggers';
export * from './strategies';
export * from './resources';

/**
 * Reset all app data (for testing purposes)
 */
export const resetAppData = (): void => {
  const { STORAGE_KEYS } = require('./constants');
  localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.TRIGGERS);
  localStorage.removeItem(STORAGE_KEYS.COPING_STRATEGIES);
};
