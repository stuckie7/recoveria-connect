
/**
 * Resource recommendations storage utilities
 */

import { Resource, CheckIn } from '@/types';
import { getUserProgress, getTriggers, getCopingStrategies } from '@/utils/storage';

export type RecommendationType = 'mood' | 'triggers' | 'strategy' | 'general';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  resources: string[];  // Resource IDs
  reason: string;
  priority: number;  // 1-10, higher means more important
}

/**
 * Analyze user data and generate personalized recommendations
 */
export const generateRecommendations = (resources: Resource[]): Recommendation[] => {
  const progress = getUserProgress();
  const triggers = getTriggers();
  const strategies = getCopingStrategies();
  const recommendations: Recommendation[] = [];
  
  // Check for mood patterns from recent check-ins
  analyzeMoodPatterns(progress.checkIns, resources, recommendations);
  
  // Check for frequent triggers
  analyzeFrequentTriggers(progress.checkIns, triggers, resources, recommendations);
  
  // Check for unused but potentially helpful coping strategies
  analyzeUnusedStrategies(progress.checkIns, strategies, resources, recommendations);
  
  // Add general recommendations for new users or users with limited data
  if (progress.checkIns.length < 5 || recommendations.length < 2) {
    addGeneralRecommendations(progress, resources, recommendations);
  }
  
  // Sort by priority
  return recommendations.sort((a, b) => b.priority - a.priority);
};

/**
 * Analyze mood patterns from check-ins
 */
const analyzeMoodPatterns = (
  checkIns: CheckIn[], 
  resources: Resource[], 
  recommendations: Recommendation[]
): void => {
  // Get recent check-ins (past 14 days)
  const recentCheckIns = checkIns
    .filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return checkInDate >= twoWeeksAgo;
    })
    .slice(0, 10); // Limit to 10 most recent
  
  if (recentCheckIns.length < 3) return; // Not enough data
  
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
};

/**
 * Analyze frequent triggers from check-ins
 */
const analyzeFrequentTriggers = (
  checkIns: CheckIn[], 
  triggers: any[], 
  resources: Resource[], 
  recommendations: Recommendation[]
): void => {
  // Get recent check-ins (past 30 days)
  const recentCheckIns = checkIns
    .filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return checkInDate >= monthAgo;
    });
  
  if (recentCheckIns.length < 2) return; // Not enough data
  
  // Count trigger occurrences
  const triggerCounts: Record<string, number> = {};
  recentCheckIns.forEach(checkIn => {
    checkIn.triggers.forEach(triggerId => {
      triggerCounts[triggerId] = (triggerCounts[triggerId] || 0) + 1;
    });
  });
  
  // Find most frequent triggers
  const triggerEntries = Object.entries(triggerCounts);
  if (triggerEntries.length === 0) return;
  
  triggerEntries.sort((a, b) => b[1] - a[1]);
  const mostFrequentTriggerId = triggerEntries[0][0];
  const mostFrequentTrigger = triggers.find(t => t.id === mostFrequentTriggerId);
  
  if (mostFrequentTrigger && triggerEntries[0][1] >= 2) {
    const category = mostFrequentTrigger.category;
    const triggerName = mostFrequentTrigger.name.toLowerCase();
    
    // Find relevant resources by matching trigger category or name with resource tags
    const relevantResources = resources.filter(r => 
      r.tags.some(tag => 
        tag.includes(category) || 
        tag.includes(triggerName) || 
        tag.includes('coping') ||
        tag.includes('triggers')
      )
    ).slice(0, 3);
    
    if (relevantResources.length > 0) {
      recommendations.push({
        id: 'trigger-' + mostFrequentTriggerId,
        type: 'triggers',
        resources: relevantResources.map(r => r.id),
        reason: `You've frequently mentioned "${mostFrequentTrigger.name}" as a trigger. These resources may help you manage it better.`,
        priority: 8
      });
    }
  }
};

/**
 * Analyze unused but potentially helpful coping strategies
 */
const analyzeUnusedStrategies = (
  checkIns: CheckIn[], 
  strategies: any[], 
  resources: Resource[], 
  recommendations: Recommendation[]
): void => {
  // Skip if no check-ins or strategies
  if (checkIns.length === 0 || strategies.length === 0) return;
  
  // Get all used strategy IDs
  const usedStrategyIds = new Set();
  checkIns.forEach(checkIn => {
    checkIn.strategies.forEach(strategyId => {
      usedStrategyIds.add(strategyId);
    });
  });
  
  // Find unused strategies
  const unusedStrategies = strategies.filter(strategy => !usedStrategyIds.has(strategy.id));
  
  if (unusedStrategies.length === 0) return;
  
  // Randomly select one unused strategy
  const randomUnusedStrategy = unusedStrategies[Math.floor(Math.random() * unusedStrategies.length)];
  
  // Find resources related to this strategy
  const relevantResources = resources.filter(r => 
    r.tags.some(tag => 
      tag.includes('coping') || 
      tag.includes('strategies') || 
      tag.includes(randomUnusedStrategy.name.toLowerCase().split(' ')[0])
    )
  ).slice(0, 2);
  
  if (relevantResources.length > 0) {
    recommendations.push({
      id: 'strategy-' + randomUnusedStrategy.id,
      type: 'strategy',
      resources: relevantResources.map(r => r.id),
      reason: `You haven't tried the "${randomUnusedStrategy.name}" coping strategy yet. These resources can help you learn about it.`,
      priority: 6
    });
  }
};

/**
 * Add general recommendations for new users or users with limited data
 */
const addGeneralRecommendations = (
  progress: any, 
  resources: Resource[], 
  recommendations: Recommendation[]
): void => {
  // For new users (less than 7 days since start)
  const startDate = new Date(progress.startDate);
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceStart < 7) {
    const beginnerResources = resources.filter(r => 
      r.tags.includes('beginner') || r.tags.includes('education')
    ).slice(0, 3);
    
    if (beginnerResources.length > 0) {
      recommendations.push({
        id: 'general-beginner',
        type: 'general',
        resources: beginnerResources.map(r => r.id),
        reason: 'These fundamental resources are great for starting your recovery journey.',
        priority: 10
      });
    }
  }
  
  // For users in early recovery (1-3 months)
  if (daysSinceStart >= 7 && daysSinceStart < 90) {
    const earlyRecoveryResources = resources.filter(r => 
      r.tags.includes('coping') || r.tags.includes('tools')
    ).slice(0, 2);
    
    if (earlyRecoveryResources.length > 0) {
      recommendations.push({
        id: 'general-early',
        type: 'general',
        resources: earlyRecoveryResources.map(r => r.id),
        reason: 'These resources can help strengthen your coping skills in early recovery.',
        priority: 8
      });
    }
  }
  
  // For users in sustained recovery (3+ months)
  if (daysSinceStart >= 90) {
    const sustainedRecoveryResources = resources.filter(r => 
      r.tags.includes('growth') || r.tags.includes('purpose') || r.tags.includes('relationships')
    ).slice(0, 2);
    
    if (sustainedRecoveryResources.length > 0) {
      recommendations.push({
        id: 'general-sustained',
        type: 'general',
        resources: sustainedRecoveryResources.map(r => r.id),
        reason: 'As you continue your recovery journey, these resources focus on long-term growth and fulfillment.',
        priority: 7
      });
    }
  }
  
  // Always recommend some self-care resources
  const selfCareResources = resources.filter(r => 
    r.tags.includes('self-care') || r.tags.includes('wellness')
  ).slice(0, 2);
  
  if (selfCareResources.length > 0) {
    recommendations.push({
      id: 'general-selfcare',
      type: 'general',
      resources: selfCareResources.map(r => r.id),
      reason: 'Regular self-care is essential for maintaining recovery. Try these resources.',
      priority: 5
    });
  }
};

/**
 * Get resources by IDs
 */
export const getResourcesByIds = (resourceIds: string[], allResources: Resource[]): Resource[] => {
  return allResources.filter(resource => resourceIds.includes(resource.id));
};
