
/**
 * Coping strategies storage utilities
 */

import { CopingStrategy } from '@/types';
import { STORAGE_KEYS, DEFAULT_STRATEGIES } from './constants';

/**
 * Get coping strategies from local storage or return defaults
 */
export const getCopingStrategies = (): CopingStrategy[] => {
  const strategiesString = localStorage.getItem(STORAGE_KEYS.COPING_STRATEGIES);
  
  if (!strategiesString) {
    saveCopingStrategies(DEFAULT_STRATEGIES);
    return DEFAULT_STRATEGIES;
  }
  
  return JSON.parse(strategiesString);
};

/**
 * Save coping strategies to local storage
 */
export const saveCopingStrategies = (strategies: CopingStrategy[]): void => {
  localStorage.setItem(STORAGE_KEYS.COPING_STRATEGIES, JSON.stringify(strategies));
};
