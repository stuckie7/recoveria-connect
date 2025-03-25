
/**
 * Local storage utilities for the recovery app
 */

import { UserProgress, CheckIn, Milestone, Trigger, CopingStrategy } from '@/types';

const STORAGE_KEYS = {
  USER_PROGRESS: 'recovery-app-progress',
  TRIGGERS: 'recovery-app-triggers',
  COPING_STRATEGIES: 'recovery-app-strategies',
};

// Default triggers
const DEFAULT_TRIGGERS: Trigger[] = [
  { id: '1', name: 'Stress', category: 'emotional', description: 'Feeling overwhelmed or pressured' },
  { id: '2', name: 'Social gatherings', category: 'social', description: 'Events where substances may be present' },
  { id: '3', name: 'Negative emotions', category: 'emotional', description: 'Sadness, anger, frustration, etc.' },
  { id: '4', name: 'Celebrations', category: 'social', description: 'Happy events that traditionally involve substances' },
  { id: '5', name: 'Boredom', category: 'mental', description: 'Lack of stimulation or activities' },
  { id: '6', name: 'Fatigue', category: 'physical', description: 'Feeling physically exhausted' },
  { id: '7', name: 'Financial problems', category: 'environmental', description: 'Money-related stress' },
  { id: '8', name: 'Relationship issues', category: 'social', description: 'Conflicts with partners, family, or friends' },
];

// Default coping strategies
const DEFAULT_STRATEGIES: CopingStrategy[] = [
  {
    id: '1',
    name: 'Deep breathing',
    description: 'Slow, deep breaths to reduce stress',
    steps: ['Find a comfortable position', 'Breathe in deeply through your nose for 4 seconds', 'Hold for 2 seconds', 'Exhale slowly through your mouth for 6 seconds', 'Repeat for 5 minutes'],
    forTriggers: ['1', '3', '6'],
  },
  {
    id: '2',
    name: 'Call a support person',
    description: 'Reach out to someone in your support network',
    steps: ['Identify who to call', "Explain how you're feeling", 'Ask for their support or just listen'],
    forTriggers: ['2', '3', '4', '8'],
  },
  {
    id: '3',
    name: 'Go for a walk',
    description: 'Physical activity to shift focus and reduce cravings',
    steps: ['Put on comfortable shoes', 'Choose a pleasant route', 'Walk for at least 15 minutes', 'Focus on your surroundings'],
    forTriggers: ['1', '3', '5', '6'],
  },
  {
    id: '4',
    name: 'Practice mindfulness',
    description: 'Focus on the present moment',
    steps: ['Find a quiet place', 'Close your eyes', 'Focus on your breathing', 'Notice thoughts without judgment', 'Bring attention back to breath when mind wanders'],
    forTriggers: ['1', '3', '5', '7'],
  },
];

// Default milestones
const DEFAULT_MILESTONES: Milestone[] = [
  { id: '1', days: 1, name: 'First Day', description: 'The most important step of your journey', achieved: false, icon: 'star' },
  { id: '2', days: 7, name: 'One Week', description: 'A full week of progress', achieved: false, icon: 'medal' },
  { id: '3', days: 30, name: 'One Month', description: 'Thirty days of strength', achieved: false, icon: 'calendar' },
  { id: '4', days: 90, name: 'Three Months', description: 'A quarter year of transformation', achieved: false, icon: 'trophy' },
  { id: '5', days: 180, name: 'Six Months', description: 'Half a year of dedication', achieved: false, icon: 'award' },
  { id: '6', days: 365, name: 'One Year', description: 'A full year of renewed life', achieved: false, icon: 'crown' },
];

/**
 * Initialize user progress with default values
 */
export const initializeUserProgress = (): UserProgress => {
  const today = new Date().toISOString();
  
  return {
    startDate: today,
    currentStreak: 0,
    longestStreak: 0,
    totalDaysSober: 0,
    relapses: 0,
    milestones: DEFAULT_MILESTONES,
    checkIns: [],
  };
};

/**
 * Get user progress from local storage or initialize if not exists
 */
export const getUserProgress = (): UserProgress => {
  const progressString = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  
  if (!progressString) {
    const initialProgress = initializeUserProgress();
    saveUserProgress(initialProgress);
    return initialProgress;
  }
  
  return JSON.parse(progressString);
};

/**
 * Save user progress to local storage
 */
export const saveUserProgress = (progress: UserProgress): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
};

/**
 * Add a new check-in
 */
export const addCheckIn = (checkIn: Omit<CheckIn, 'id'>): CheckIn => {
  const progress = getUserProgress();
  
  const newCheckIn: CheckIn = {
    ...checkIn,
    id: Date.now().toString(),
  };
  
  progress.checkIns.push(newCheckIn);
  saveUserProgress(progress);
  
  return newCheckIn;
};

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

/**
 * Reset all app data (for testing purposes)
 */
export const resetAppData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.TRIGGERS);
  localStorage.removeItem(STORAGE_KEYS.COPING_STRATEGIES);
};

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
 * Set sobriety start date
 */
export const setSobrietyStartDate = (date: Date): void => {
  const progress = getUserProgress();
  progress.startDate = date.toISOString();
  progress.currentStreak = 0;
  
  // Reset milestones
  progress.milestones.forEach(milestone => {
    milestone.achieved = false;
    delete milestone.date;
  });
  
  saveUserProgress(progress);
};

/**
 * Update streak count
 */
export const updateStreak = (): void => {
  const progress = getUserProgress();
  const today = new Date();
  
  // Increment current streak
  progress.currentStreak += 1;
  progress.totalDaysSober += 1;
  
  // Update longest streak if needed
  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }
  
  // Check if any milestones have been reached
  progress.milestones.forEach(milestone => {
    if (!milestone.achieved && progress.currentStreak >= milestone.days) {
      milestone.achieved = true;
      milestone.date = today.toISOString();
    }
  });
  
  saveUserProgress(progress);
};

/**
 * Record a relapse
 */
export const recordRelapse = (date: Date): void => {
  const progress = getUserProgress();
  
  progress.relapses += 1;
  progress.startDate = date.toISOString();
  progress.currentStreak = 0;
  
  // Reset unachieved milestones
  progress.milestones.forEach(milestone => {
    if (!milestone.achieved) {
      delete milestone.date;
    }
  });
  
  saveUserProgress(progress);
};
