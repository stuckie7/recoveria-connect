
import { UserProgress, Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Add general recommendations based on recovery stage
 */
export const addGeneralRecommendations = (
  progress: UserProgress,
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Calculate days sober
  const startDate = new Date(progress.startDate);
  const today = new Date();
  const daysSober = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Early recovery (0-30 days)
  if (daysSober <= 30) {
    // Find beginner resources
    const beginnerResources = resources.filter(r => 
      r.tags.includes('beginner') || r.tags.includes('early-recovery')
    ).slice(0, 2);
    
    if (beginnerResources.length > 0) {
      recommendations.push({
        id: 'general-early',
        type: 'general',
        resourceIds: beginnerResources.map(r => r.id),
        reason: 'These resources are helpful for people in early recovery.',
        priority: 5,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Mid recovery (31-90 days)
  else if (daysSober <= 90) {
    // Find habit-building resources
    const habitResources = resources.filter(r => 
      r.tags.includes('habits') || r.tags.includes('routine') || r.tags.includes('lifestyle')
    ).slice(0, 2);
    
    if (habitResources.length > 0) {
      recommendations.push({
        id: 'general-mid',
        type: 'general',
        resourceIds: habitResources.map(r => r.id),
        reason: 'Building healthy habits is important at this stage of recovery.',
        priority: 5,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Sustained recovery (91+ days)
  else {
    // Find growth-focused resources
    const growthResources = resources.filter(r => 
      r.tags.includes('growth') || r.tags.includes('purpose') || r.tags.includes('long-term')
    ).slice(0, 2);
    
    if (growthResources.length > 0) {
      recommendations.push({
        id: 'general-sustained',
        type: 'general',
        resourceIds: growthResources.map(r => r.id),
        reason: 'These resources can help with continued growth in long-term recovery.',
        priority: 4,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Always recommend self-care
  const selfCareResources = resources.filter(r => 
    r.tags.includes('self-care') || r.tags.includes('wellness')
  ).slice(0, 1);
  
  if (selfCareResources.length > 0) {
    recommendations.push({
      id: 'general-self-care',
      type: 'general',
      resourceIds: selfCareResources.map(r => r.id),
      reason: 'Self-care is essential throughout your recovery journey.',
      priority: 3,
      createdAt: new Date().toISOString()
    });
  }
  
  return recommendations;
};
