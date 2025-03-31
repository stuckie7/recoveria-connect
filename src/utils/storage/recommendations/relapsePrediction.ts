
import { CheckIn, UserProgress } from '@/types';
import { Resource } from '@/types';
import { Recommendation } from './types';

// Risk factors that contribute to relapse probability
export interface RiskFactors {
  moodDecline: number;          // 0-1 score for negative mood pattern
  triggerExposure: number;      // 0-1 score for recent trigger encounters
  isolationLevel: number;       // 0-1 score for social isolation
  stressLevel: number;          // 0-1 score for reported stress
  sleepDisruption: number;      // 0-1 score for sleep issues
  missedCheckIns: number;       // 0-1 score based on consistency of check-ins
}

export interface PredictionResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;            // 0-100 score
  primaryFactors: string[];     // Main contributing factors
  recommendations: Recommendation[];
}

/**
 * Analyze check-in patterns to detect mood changes
 */
const analyzeMoodPatterns = (checkIns: CheckIn[]): number => {
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
const analyzeTriggerExposure = (checkIns: CheckIn[]): number => {
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
const analyzeIsolation = (checkIns: CheckIn[]): number => {
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
const calculateMissedCheckIns = (checkIns: CheckIn[]): number => {
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
const calculateStressAndSleep = (checkIns: CheckIn[]): { stress: number, sleep: number } => {
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
 * Generate recommendations based on risk factors
 */
const generateInterventions = (
  riskFactors: RiskFactors, 
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Determine top risk factors
  const riskEntries = Object.entries(riskFactors) as [keyof RiskFactors, number][];
  const sortedRisks = riskEntries.sort((a, b) => b[1] - a[1]);
  const topRisks = sortedRisks.slice(0, 2);
  
  // Map risk factors to resource types
  const riskToResourceType: Record<keyof RiskFactors, string[]> = {
    moodDecline: ['coping', 'mindfulness', 'therapy'],
    triggerExposure: ['trigger-management', 'avoidance-strategies', 'coping'],
    isolationLevel: ['community', 'support-groups', 'connection'],
    stressLevel: ['relaxation', 'stress-management', 'mindfulness'],
    sleepDisruption: ['sleep-hygiene', 'relaxation', 'health'],
    missedCheckIns: ['motivation', 'habit-building', 'accountability']
  };
  
  // For each top risk factor, add appropriate recommendations
  topRisks.forEach(([risk, level]) => {
    // Only add interventions for significant risk factors (level > 0.4)
    if (level < 0.4) return;
    
    const resourceTypes = riskToResourceType[risk] || ['coping'];
    
    // Find matching resources
    const matchingResources = resources.filter(resource => 
      resource.tags?.some(tag => resourceTypes.includes(tag.toLowerCase()))
    ).slice(0, 2);
    
    // Create recommendations
    matchingResources.forEach(resource => {
      recommendations.push({
        id: `relapse-pred-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        resourceIds: [resource.id],
        type: 'relapse-prevention',
        reason: generateReasonText(risk, level),
        priority: Math.round(level * 10),
        createdAt: new Date().toISOString()
      });
    });
    
    // Add a general recommendation if no specific resources found
    if (matchingResources.length === 0) {
      recommendations.push({
        id: `relapse-pred-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        resourceIds: [],
        type: 'relapse-prevention',
        reason: generateReasonText(risk, level),
        action: generateActionText(risk),
        priority: Math.round(level * 10),
        createdAt: new Date().toISOString()
      });
    }
  });
  
  return recommendations;
};

/**
 * Generate reason text based on risk factor
 */
const generateReasonText = (risk: keyof RiskFactors, level: number): string => {
  const intensity = level > 0.7 ? 'significant' : 'moderate';
  
  switch (risk) {
    case 'moodDecline':
      return `You've shown ${intensity} changes in your mood recently`;
    case 'triggerExposure':
      return `You've encountered ${intensity} exposure to triggers lately`;
    case 'isolationLevel':
      return `Your social connection patterns show ${intensity} isolation`;
    case 'stressLevel':
      return `You're experiencing ${intensity} stress levels`;
    case 'sleepDisruption':
      return `Your sleep patterns show ${intensity} disruption`;
    case 'missedCheckIns':
      return `You've missed several check-ins recently`;
    default:
      return `Our system detected a ${intensity} risk factor`;
  }
};

/**
 * Generate action text based on risk factor
 */
const generateActionText = (risk: keyof RiskFactors): string => {
  switch (risk) {
    case 'moodDecline':
      return 'Practice self-care and mindfulness techniques';
    case 'triggerExposure':
      return 'Review your trigger management plan';
    case 'isolationLevel':
      return 'Reach out to a supportive friend or join a group meeting';
    case 'stressLevel':
      return 'Try stress reduction techniques like deep breathing or meditation';
    case 'sleepDisruption':
      return 'Improve your sleep hygiene by maintaining a regular schedule';
    case 'missedCheckIns':
      return 'Set a daily reminder for check-ins to maintain consistency';
    default:
      return 'Consider reaching out to your support network';
  }
};

/**
 * Calculate risk level label from numerical score
 */
const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' | 'critical' => {
  if (score < 30) return 'low';
  if (score < 50) return 'moderate';
  if (score < 70) return 'high';
  return 'critical';
};

/**
 * Get the primary factors contributing to relapse risk
 */
const getPrimaryFactors = (riskFactors: RiskFactors): string[] => {
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
 * Main function to analyze user data and predict relapse risk
 */
export const predictRelapseRisk = (progress: UserProgress, resources: Resource[]): PredictionResult => {
  // Calculate individual risk factors
  const moodDecline = analyzeMoodPatterns(progress.checkIns);
  const triggerExposure = analyzeTriggerExposure(progress.checkIns);
  const isolationLevel = analyzeIsolation(progress.checkIns);
  const missedCheckIns = calculateMissedCheckIns(progress.checkIns);
  
  const { stress: stressLevel, sleep: sleepDisruption } = calculateStressAndSleep(progress.checkIns);
  
  // Combine risk factors
  const riskFactors: RiskFactors = {
    moodDecline,
    triggerExposure,
    isolationLevel,
    stressLevel,
    sleepDisruption,
    missedCheckIns
  };
  
  // Calculate overall risk score (0-100)
  const weights = {
    moodDecline: 0.3,
    triggerExposure: 0.25,
    isolationLevel: 0.15,
    stressLevel: 0.15,
    sleepDisruption: 0.1,
    missedCheckIns: 0.05
  };
  
  let riskScore = 0;
  Object.entries(riskFactors).forEach(([factor, value]) => {
    const key = factor as keyof RiskFactors;
    riskScore += value * (weights[key] * 100);
  });
  
  // Round to nearest integer
  riskScore = Math.round(riskScore);
  
  // Generate interventions based on risk factors
  const recommendations = generateInterventions(riskFactors, resources);
  
  // Get the primary contributing factors
  const primaryFactors = getPrimaryFactors(riskFactors);
  
  // Return prediction result
  return {
    riskLevel: getRiskLevel(riskScore),
    riskScore,
    primaryFactors,
    recommendations
  };
};
