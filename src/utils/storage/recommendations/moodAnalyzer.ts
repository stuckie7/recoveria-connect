
import { CheckIn, Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Analyze mood patterns from check-ins
 */
export const analyzeMoodPatterns = (
  checkIns: CheckIn[], 
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Get recent check-ins (past 14 days)
  const recentCheckIns = checkIns
    .filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return checkInDate >= twoWeeksAgo;
    })
    .slice(0, 10); // Limit to 10 most recent
  
  if (recentCheckIns.length < 3) return recommendations; // Not enough data
  
  // Count moods
  const moodCounts: Record<string, number> = {};
  recentCheckIns.forEach(checkIn => {
    moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1;
  });
  
  // Check for persistent negative moods
  const badMoodCount = (moodCounts['bad'] || 0) + (moodCounts['terrible'] || 0);
  const checkInCount = recentCheckIns.length;
  
  if (badMoodCount / checkInCount > 0.5) {
    // More than 50% bad/terrible moods
    const relevantResources = resources.filter(r => 
      r.tags.some(tag => ['coping', 'mental-health', 'self-care', 'meditation'].includes(tag))
    ).slice(0, 3);
    
    if (relevantResources.length > 0) {
      recommendations.push({
        id: 'mood-neg-' + Date.now().toString(),
        type: 'mood',
        resources: relevantResources.map(r => r.id),
        reason: 'You\'ve been reporting lower moods recently. These resources may help improve your well-being.',
        priority: 9
      });
    }
  }
  
  // Check for improving moods
  const recentMoods = recentCheckIns.map(c => {
    switch (c.mood) {
      case 'great': return 5;
      case 'good': return 4;
      case 'okay': return 3;
      case 'bad': return 2;
      case 'terrible': return 1;
      default: return 3;
    }
  });
  
  // Check if recent moods are trending upward
  let improvingTrend = true;
  for (let i = 2; i < recentMoods.length; i++) {
    const threePointAvg = (recentMoods[i] + recentMoods[i-1] + recentMoods[i-2]) / 3;
    const prevThreePointAvg = (recentMoods[i-1] + recentMoods[i-2] + recentMoods[i-3]) / 3;
    
    if (threePointAvg <= prevThreePointAvg) {
      improvingTrend = false;
      break;
    }
  }
  
  if (improvingTrend && recentMoods.length >= 6) {
    const relevantResources = resources.filter(r => 
      r.tags.some(tag => ['motivation', 'growth', 'progress', 'success-stories'].includes(tag))
    ).slice(0, 2);
    
    if (relevantResources.length > 0) {
      recommendations.push({
        id: 'mood-pos-' + Date.now().toString(),
        type: 'mood',
        resources: relevantResources.map(r => r.id),
        reason: 'Your mood has been improving! These resources can help maintain your positive momentum.',
        priority: 7
      });
    }
  }
  
  return recommendations;
};
