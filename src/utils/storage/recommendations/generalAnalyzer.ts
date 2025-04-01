
import { Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Add general recommendations for new users or users with limited data
 */
export const addGeneralRecommendations = (
  progress: any, 
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
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
  
  return recommendations;
};
