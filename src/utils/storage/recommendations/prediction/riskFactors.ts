
import { CheckIn } from '@/types';
import { RiskFactors } from './types';

/**
 * Analyze check-in patterns to detect mood changes
 */
export const analyzeMoodPatterns = (checkIns: CheckIn[]): number => {
  if (checkIns.length < 3) return 0;
  
  // Get the 5 most recent check-ins
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Map mood strings to numerical values
  const moodValues: Record<string, number> = {
    'terrible': 0,
    'poor': 0.25,
    'okay': 0.5,
    'good': 0.75,
    'great': 1
  };
  
  // Calculate the trend of mood over recent check-ins
  const moodScores = recentCheckIns.map(checkIn => 
    moodValues[checkIn.mood?.toLowerCase() || 'okay'] || 0.5
  );
  
  // Check for declining pattern - earlier values higher than later ones
  let declineCount = 0;
  for (let i = 0; i < moodScores.length - 1; i++) {
    if (moodScores[i] < moodScores[i + 1]) {
      declineCount++;
    }
  }
  
  // Average mood score (lower is worse)
  const avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
  
  // Decline factor (higher with more consistent decline)
  const declineFactor = declineCount / (moodScores.length - 1);
  
  // Combine factors - higher number means higher risk
  // Invert avgMood so lower moods result in higher risk
  return Math.min(((1 - avgMood) * 0.7) + (declineFactor * 0.3), 1);
};

/**
 * Analyze trigger exposure from check-ins
 */
export const analyzeTriggerExposure = (checkIns: CheckIn[]): number => {
  if (checkIns.length < 2) return 0;
  
  // Get the 7 most recent check-ins
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  
  // Count check-ins with reported triggers
  const checkInsWithTriggers = recentCheckIns.filter(
    checkIn => checkIn.triggers && checkIn.triggers.length > 0
  );
  
  // Calculate ratio of check-ins with triggers
  return Math.min(checkInsWithTriggers.length / recentCheckIns.length, 1);
};

/**
 * Analyze social isolation based on reported activities
 */
export const analyzeIsolation = (checkIns: CheckIn[]): number => {
  if (checkIns.length < 3) return 0.3; // Default moderate risk with insufficient data
  
  // Use check-in notes to estimate isolation
  // This is a simplified analysis; a real system would use more data points
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Simple keyword analysis to detect isolation indicators
  const isolationKeywords = [
    'alone', 'lonely', 'isolated', 'by myself', 'no one', 
    'stayed home', 'didn\'t go out', 'cancelled plans'
  ];
  
  let isolationMentions = 0;
  recentCheckIns.forEach(checkIn => {
    const notes = checkIn.notes?.toLowerCase() || '';
    isolationKeywords.forEach(keyword => {
      if (notes.includes(keyword)) {
        isolationMentions++;
      }
    });
  });
  
  return Math.min(isolationMentions / (recentCheckIns.length * 2), 1);
};

/**
 * Calculate missing/skipped check-ins
 */
export const calculateMissedCheckIns = (checkIns: CheckIn[]): number => {
  if (checkIns.length < 3) return 0.3; // Default moderate risk with insufficient data
  
  // Check for gaps in daily check-ins
  const sortedDates = checkIns
    .map(checkIn => new Date(checkIn.date).toISOString().split('T')[0])
    .sort();
  
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
  
  // Count days in past week
  let expectedCheckIns = 0;
  let currentDate = new Date(oneWeekAgoStr);
  const todayDate = new Date(today);
  
  while (currentDate <= todayDate) {
    expectedCheckIns++;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count actual check-ins in past week
  const recentCheckIns = sortedDates.filter(date => 
    date >= oneWeekAgoStr && date <= today
  );
  
  const missedRatio = 1 - (recentCheckIns.length / expectedCheckIns);
  return Math.min(missedRatio, 1);
};

/**
 * Calculate stress and sleep disturbance levels
 * Note: Simplified implementation that would use more data points in a real system
 */
export const calculateStressAndSleep = (checkIns: CheckIn[]): { stress: number, sleep: number } => {
  if (checkIns.length < 3) return { stress: 0.3, sleep: 0.3 }; // Default with insufficient data
  
  // Get recent check-ins
  const recentCheckIns = [...checkIns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Stress keywords
  const stressKeywords = [
    'stress', 'anxious', 'anxiety', 'worried', 'overwhelmed',
    'pressure', 'tense', 'nervous', 'panic'
  ];
  
  // Sleep keywords
  const sleepKeywords = [
    'tired', 'exhausted', 'insomnia', 'nightmares', 'couldn\'t sleep',
    'sleep problems', 'woke up', 'restless', 'fatigue'
  ];
  
  let stressMentions = 0;
  let sleepMentions = 0;
  
  recentCheckIns.forEach(checkIn => {
    const notes = checkIn.notes?.toLowerCase() || '';
    
    stressKeywords.forEach(keyword => {
      if (notes.includes(keyword)) stressMentions++;
    });
    
    sleepKeywords.forEach(keyword => {
      if (notes.includes(keyword)) sleepMentions++;
    });
  });
  
  return {
    stress: Math.min(stressMentions / (recentCheckIns.length * 2), 1),
    sleep: Math.min(sleepMentions / (recentCheckIns.length * 2), 1)
  };
};

/**
 * Get the primary factors contributing to relapse risk
 */
export const getPrimaryFactors = (riskFactors: RiskFactors): string[] => {
  const factors: string[] = [];
  
  if (riskFactors.moodDecline > 0.5) factors.push('Mood changes');
  if (riskFactors.triggerExposure > 0.5) factors.push('Trigger exposure');
  if (riskFactors.isolationLevel > 0.5) factors.push('Social isolation');
  if (riskFactors.stressLevel > 0.5) factors.push('High stress');
  if (riskFactors.sleepDisruption > 0.5) factors.push('Sleep disruption');
  if (riskFactors.missedCheckIns > 0.5) factors.push('Inconsistent check-ins');
  
  return factors.length > 0 ? factors : ['Multiple subtle factors'];
};

/**
 * Calculate risk level label from numerical score
 */
export const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' | 'critical' => {
  if (score < 30) return 'low';
  if (score < 50) return 'moderate';
  if (score < 70) return 'high';
  return 'critical';
};
