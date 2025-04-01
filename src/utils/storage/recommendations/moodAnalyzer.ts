
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
  
  // Skip if not enough check-ins
  if (checkIns.length < 3) return recommendations;
  
  // Get recent check-ins
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  
  // Map moods to numerical values
  const moodValues: Record<string, number> = {
    'terrible': 0,
    'bad': 1,
    'okay': 2,
    'good': 3,
    'great': 4
  };
  
  // Calculate average mood
  const moodScores = recentCheckIns.map(checkIn => 
    moodValues[checkIn.mood.toLowerCase()]
  );
  
  const avgMood = moodScores.reduce((sum, val) => sum + val, 0) / moodScores.length;
  
  // Check for consistently low mood
  if (avgMood < 2) {
    // Find mood-boosting resources
    const moodResources = resources.filter(r => 
      r.tags.some(tag => 
        ['mood', 'depression', 'mental-health', 'self-care', 'mindfulness'].includes(tag)
      )
    ).slice(0, 2);
    
    if (moodResources.length > 0) {
      recommendations.push({
        id: `mood-low-${Date.now()}`,
        type: 'mood',
        resourceIds: moodResources.map(r => r.id),
        reason: 'Your mood has been consistently low recently. These resources might help improve your wellbeing.',
        priority: 9,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Check for mood swings
  const moodVariance = calculateVariance(moodScores);
  if (moodVariance > 1.5) {
    // Find emotional regulation resources
    const regulationResources = resources.filter(r => 
      r.tags.some(tag => 
        ['emotional-regulation', 'coping', 'stability', 'mindfulness', 'therapy'].includes(tag)
      )
    ).slice(0, 2);
    
    if (regulationResources.length > 0) {
      recommendations.push({
        id: `mood-swing-${Date.now()}`,
        type: 'mood',
        resourceIds: regulationResources.map(r => r.id),
        reason: 'Your mood has been fluctuating recently. These resources might help with emotional regulation.',
        priority: 7,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return recommendations;
};

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  return Math.sqrt(squareDiffs.reduce((sum, val) => sum + val, 0) / values.length);
}
