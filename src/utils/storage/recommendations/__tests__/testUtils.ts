
import { Resource, CheckIn, Trigger, CopingStrategy } from '@/types';

// Test resources for recommendation engine testing
export const testResources: Resource[] = [
  {
    id: 'r1',
    title: 'Stress Management Guide',
    description: 'Techniques to manage stress in recovery',
    type: 'article',
    url: 'https://example.com/stress',
    tags: ['stress', 'coping', 'mental-health', 'beginner'],
    duration: '10 min'
  },
  {
    id: 'r2',
    title: 'Meditation Basics',
    description: 'Introduction to meditation for recovery',
    type: 'video',
    url: 'https://example.com/meditation',
    tags: ['meditation', 'self-care', 'wellness'],
    duration: '15 min'
  },
  {
    id: 'r3',
    title: 'Building Support Networks',
    description: 'How to create and maintain support systems',
    type: 'article',
    url: 'https://example.com/support',
    tags: ['relationships', 'social', 'growth'],
    duration: '12 min'
  },
  {
    id: 'r4',
    title: 'Coping with Triggers',
    description: 'Strategies for dealing with common triggers',
    type: 'audio',
    url: 'https://example.com/triggers',
    tags: ['triggers', 'coping', 'tools'],
    duration: '20 min'
  },
  {
    id: 'r5',
    title: 'Recovery Motivation',
    description: 'Staying motivated in your recovery journey',
    type: 'video',
    url: 'https://example.com/motivation',
    tags: ['motivation', 'purpose', 'success-stories'],
    duration: '18 min'
  }
];

// Test check-ins for recommendation engine testing
export const createTestCheckIns = (days: number, options: {
  moodPattern?: 'improving' | 'declining' | 'stable' | 'mixed',
  commonTriggers?: string[],
  includeStrategies?: boolean
}): CheckIn[] => {
  const { moodPattern = 'mixed', commonTriggers = [], includeStrategies = true } = options;
  const now = new Date();
  const checkIns: CheckIn[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Determine mood based on pattern
    let mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
    if (moodPattern === 'improving') {
      const moodIndex = Math.min(4, Math.floor(i / 2));
      const moodArray: Array<'terrible' | 'bad' | 'okay' | 'good' | 'great'> = 
        ['terrible', 'bad', 'okay', 'good', 'great'];
      mood = moodArray[moodIndex];
    } else if (moodPattern === 'declining') {
      const moodIndex = Math.min(4, Math.floor(i / 2));
      const moodArray: Array<'great' | 'good' | 'okay' | 'bad' | 'terrible'> = 
        ['great', 'good', 'okay', 'bad', 'terrible'];
      mood = moodArray[moodIndex];
    } else if (moodPattern === 'stable') {
      mood = 'okay';
    } else {
      // Mixed/random
      const moodOptions: Array<'great' | 'good' | 'okay' | 'bad' | 'terrible'> = 
        ['great', 'good', 'okay', 'bad', 'terrible'];
      mood = moodOptions[Math.floor(Math.random() * moodOptions.length)];
    }
    
    // Add some triggers (including common ones if specified)
    const triggers: string[] = [];
    if (commonTriggers.length > 0 && Math.random() > 0.3) {
      triggers.push(commonTriggers[Math.floor(Math.random() * commonTriggers.length)]);
    }
    // Maybe add another random trigger
    if (Math.random() > 0.5) {
      triggers.push(`trigger${Math.floor(Math.random() * 5) + 1}`);
    }
    
    // Add strategies if enabled
    const strategies: string[] = [];
    if (includeStrategies && Math.random() > 0.3) {
      strategies.push(`strategy${Math.floor(Math.random() * 4) + 1}`);
    }
    
    // Define proper types for sleep quality and energy level
    type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';
    type EnergyLevel = 'high' | 'medium' | 'low' | 'depleted';
    
    const sleepQualityOptions: SleepQuality[] = ['excellent', 'good', 'fair', 'poor', 'terrible'];
    const energyLevelOptions: EnergyLevel[] = ['high', 'medium', 'low', 'depleted'];
    
    checkIns.push({
      id: `checkin-${i}`,
      date: date.toISOString(),
      mood,
      sleepQuality: sleepQualityOptions[Math.floor(Math.random() * sleepQualityOptions.length)],
      energyLevel: energyLevelOptions[Math.floor(Math.random() * energyLevelOptions.length)],
      triggers,
      notes: `Test check-in for day ${i}`,
      strategies,
      feelingBetter: Math.random() > 0.5
    });
  }
  
  return checkIns;
};

// Mock triggers for testing
export const testTriggers: Trigger[] = [
  { id: 'trigger1', name: 'Stress', category: 'emotional', description: 'Work or life stress' },
  { id: 'trigger2', name: 'Social Events', category: 'social', description: 'Gatherings with alcohol' },
  { id: 'trigger3', name: 'Negative Emotions', category: 'emotional', description: 'Feeling down or upset' },
  { id: 'trigger4', name: 'Financial Issues', category: 'environmental', description: 'Money problems' },
  { id: 'trigger5', name: 'Boredom', category: 'mental', description: 'Lack of engaging activities' }
];

// Mock coping strategies for testing
export const testStrategies: CopingStrategy[] = [
  { 
    id: 'strategy1', 
    name: 'Deep Breathing', 
    description: 'Slow, deliberate breathing to reduce stress', 
    forTriggers: ['trigger1', 'trigger3'] 
  },
  { 
    id: 'strategy2', 
    name: 'Call a Friend', 
    description: 'Reach out to support network', 
    forTriggers: ['trigger2', 'trigger3', 'trigger5'] 
  },
  { 
    id: 'strategy3', 
    name: 'Physical Exercise', 
    description: 'Go for a walk or workout', 
    forTriggers: ['trigger1', 'trigger5'] 
  },
  { 
    id: 'strategy4', 
    name: 'Mindfulness Meditation', 
    description: 'Practice being present in the moment', 
    forTriggers: ['trigger1', 'trigger3', 'trigger4'] 
  }
];

// Mock user progress for testing
export const createTestUserProgress = (options: {
  daysSince: number,
  checkIns: CheckIn[]
}) => {
  const { daysSince, checkIns } = options;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysSince);
  
  return {
    startDate: startDate.toISOString(),
    currentStreak: Math.min(daysSince, 10),
    longestStreak: Math.min(daysSince, 15),
    totalDaysSober: daysSince,
    relapses: Math.floor(daysSince / 30),
    milestones: [],
    checkIns
  };
};

// Mock storage access functions - without using jest
export const mockStorageAccess = (progress: any, triggers: Trigger[], strategies: CopingStrategy[]) => {
  // Use a different approach to mock storage functions to avoid Jest reference issues
  return {
    getUserProgress: () => progress,
    getTriggers: () => triggers,
    getCopingStrategies: () => strategies
  };
};
