
/**
 * Storage constants for the recovery app
 */

export const STORAGE_KEYS = {
  USER_PROGRESS: 'recovery-app-progress',
  TRIGGERS: 'recovery-app-triggers',
  COPING_STRATEGIES: 'recovery-app-strategies',
};

// Default triggers
export const DEFAULT_TRIGGERS = [
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
export const DEFAULT_STRATEGIES = [
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
export const DEFAULT_MILESTONES = [
  { id: '1', days: 1, name: 'First Day', description: 'The most important step of your journey', achieved: false, icon: 'star' },
  { id: '2', days: 7, name: 'One Week', description: 'A full week of progress', achieved: false, icon: 'medal' },
  { id: '3', days: 30, name: 'One Month', description: 'Thirty days of strength', achieved: false, icon: 'calendar' },
  { id: '4', days: 90, name: 'Three Months', description: 'A quarter year of transformation', achieved: false, icon: 'trophy' },
  { id: '5', days: 180, name: 'Six Months', description: 'Half a year of dedication', achieved: false, icon: 'award' },
  { id: '6', days: 365, name: 'One Year', description: 'A full year of renewed life', achieved: false, icon: 'crown' },
];
