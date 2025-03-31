
import { CheckIn, Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Analyze unused but potentially helpful coping strategies
 */
export const analyzeUnusedStrategies = (
  checkIns: CheckIn[], 
  strategies: any[], 
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Skip if no check-ins or strategies
  if (checkIns.length === 0 || strategies.length === 0) return recommendations;
  
  // Get all used strategy IDs
  const usedStrategyIds = new Set();
  checkIns.forEach(checkIn => {
    checkIn.strategies.forEach(strategyId => {
      usedStrategyIds.add(strategyId);
    });
  });
  
  // Find unused strategies
  const unusedStrategies = strategies.filter(strategy => !usedStrategyIds.has(strategy.id));
  
  if (unusedStrategies.length === 0) return recommendations;
  
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
      type: 'strategies',
      resourceIds: relevantResources.map(r => r.id),
      reason: `You haven't tried the "${randomUnusedStrategy.name}" coping strategy yet. These resources can help you learn about it.`,
      priority: 6,
      createdAt: new Date().toISOString()
    });
  }
  
  return recommendations;
};
