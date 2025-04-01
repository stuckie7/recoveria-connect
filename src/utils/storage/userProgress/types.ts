
import { UserProgress } from '@/types';
import { STORAGE_KEYS } from '../constants';

export interface UserPresence {
  id: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export interface UserPresenceInsert {
  id: string;
  is_online?: boolean;
  last_seen?: string;
  created_at?: string;
}

export interface UserPresenceUpdate {
  id?: string;
  is_online?: boolean;
  last_seen?: string;
  created_at?: string;
}

// Database relationship type
export interface UserPresenceRelationship {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}

// Get user progress from localStorage
export const getUserProgress = (): UserProgress => {
  const storedProgress = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  
  if (!storedProgress) {
    // If no progress exists, initialize with defaults
    const { initializeUserProgress } = require('./initialize');
    const initialProgress = initializeUserProgress();
    saveUserProgress(initialProgress);
    return initialProgress;
  }
  
  try {
    return JSON.parse(storedProgress);
  } catch (error) {
    console.error('Error parsing user progress:', error);
    // Return default progress if parsing fails
    const { initializeUserProgress } = require('./initialize');
    const initialProgress = initializeUserProgress();
    saveUserProgress(initialProgress);
    return initialProgress;
  }
};

// Save user progress to localStorage
export const saveUserProgress = (progress: UserProgress): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
};
