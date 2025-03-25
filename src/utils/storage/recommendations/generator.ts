
import { Resource, CheckIn } from '@/types';
import { getUserProgress, getTriggers, getCopingStrategies } from '@/utils/storage';
import { Recommendation, RecommendationType } from './types';
import { analyzeMoodPatterns } from './moodAnalyzer';
import { analyzeFrequentTriggers } from './triggerAnalyzer';
import { analyzeUnusedStrategies } from './strategyAnalyzer';
import { addGeneralRecommendations } from './generalAnalyzer';

/**
 * Analyze user data and generate personalized recommendations
 */
export const generateRecommendations = (resources: Resource[]): Recommendation[] => {
  const progress = getUserProgress();
  const triggers = getTriggers();
  const strategies = getCopingStrategies();
  let recommendations: Recommendation[] = [];
  
  // Run all analyzers and collect recommendations
  recommendations = [
    ...analyzeMoodPatterns(progress.checkIns, resources),
    ...analyzeFrequentTriggers(progress.checkIns, triggers, resources),
    ...analyzeUnusedStrategies(progress.checkIns, strategies, resources)
  ];
  
  // Add general recommendations for new users or users with limited data
  if (progress.checkIns.length < 5 || recommendations.length < 2) {
    recommendations = [
      ...recommendations,
      ...addGeneralRecommendations(progress, resources)
    ];
  }
  
  // Sort by priority
  return recommendations.sort((a, b) => b.priority - a.priority);
};
