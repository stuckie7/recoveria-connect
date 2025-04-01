
import { CheckIn, Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Analyze frequent triggers from check-ins
 */
export const analyzeFrequentTriggers = (
  checkIns: CheckIn[], 
  triggers: any[], 
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Get recent check-ins (past 30 days)
  const recentCheckIns = checkIns
    .filter(checkIn => {
      const checkInDate = new Date(checkIn.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return checkInDate >= monthAgo;
    });
  
  if (recentCheckIns.length < 2) return recommendations; // Not enough data
  
  // Count trigger occurrences
  const triggerCounts: Record<string, number> = {};
  recentCheckIns.forEach(checkIn => {
    checkIn.triggers.forEach(triggerId => {
      triggerCounts[triggerId] = (triggerCounts[triggerId] || 0) + 1;
    });
  });
  
  // Find most frequent triggers
  const triggerEntries = Object.entries(triggerCounts);
  if (triggerEntries.length === 0) return recommendations;
  
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
        resourceIds: relevantResources.map(r => r.id),
        reason: `You've frequently mentioned "${mostFrequentTrigger.name}" as a trigger. These resources may help you manage it better.`,
        priority: 8,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return recommendations;
};
