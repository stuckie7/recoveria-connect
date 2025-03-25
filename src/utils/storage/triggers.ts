
/**
 * Triggers storage utilities
 */

import { Trigger } from '@/types';
import { STORAGE_KEYS, DEFAULT_TRIGGERS } from './constants';

/**
 * Get triggers from local storage or return defaults
 */
export const getTriggers = (): Trigger[] => {
  const triggersString = localStorage.getItem(STORAGE_KEYS.TRIGGERS);
  
  if (!triggersString) {
    saveTriggers(DEFAULT_TRIGGERS);
    return DEFAULT_TRIGGERS;
  }
  
  return JSON.parse(triggersString);
};

/**
 * Save triggers to local storage
 */
export const saveTriggers = (triggers: Trigger[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRIGGERS, JSON.stringify(triggers));
};
