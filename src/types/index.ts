
export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';

export type EnergyLevel = 'high' | 'medium' | 'low' | 'depleted';

export type Activity = {
  type: 'meditation' | 'exercise' | 'therapy' | 'group' | 'other';
  durationMinutes: number;
  notes?: string;
};

export type Trigger = {
  id: string;
  name: string;
  description?: string;
  category: 'emotional' | 'social' | 'environmental' | 'physical' | 'mental';
};

export type CopingStrategy = {
  id: string;
  name: string;
  description: string;
  steps?: string[];
  forTriggers: string[]; // Trigger IDs this strategy works for
};

export type CheckIn = {
  id: string;
  date: string;
  mood: Mood;
  sleepQuality?: SleepQuality;
  energyLevel?: EnergyLevel;
  activities?: Activity[];
  triggers: string[]; // Trigger IDs
  notes: string;
  strategies: string[]; // Strategy IDs that were used
  feelingBetter: boolean;
};

export type Milestone = {
  id: string;
  days: number;
  name: string;
  description: string;
  achieved: boolean;
  date?: string; // Date achieved
  icon?: string; // Icon name
};

export type UserProgress = {
  startDate: string; // ISO date string
  currentStreak: number;
  longestStreak: number;
  totalDaysSober: number;
  relapses: number;
  milestones: Milestone[];
  checkIns: CheckIn[];
};

export type CommunityPost = {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'exercise';
  url: string;
  imageUrl?: string;
  tags: string[];
  duration?: string; // How long it takes to consume this resource
};
