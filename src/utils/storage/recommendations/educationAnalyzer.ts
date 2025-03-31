
import { UserProgress, Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Generate educational content recommendations based on user's recovery journey
 */
export const generateEducationalContent = (
  progress: UserProgress,
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Calculate days sober
  const startDate = new Date(progress.startDate);
  const today = new Date();
  const daysSober = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Recommend science/education content if user hasn't had many check-ins
  if (progress.checkIns.length < 5) {
    const scienceResources = resources.filter(r => 
      r.tags.includes('science') || r.tags.includes('education')
    ).slice(0, 2);
    
    if (scienceResources.length > 0) {
      recommendations.push({
        id: `edu-science-${Date.now()}`,
        type: 'education',
        resourceIds: scienceResources.map(r => r.id),
        reason: 'Understanding the science behind addiction can strengthen your recovery.',
        priority: 5,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Recommend stage-appropriate content
  
  // Early recovery (0-30 days): Focus on withdrawal, PAWS, basic coping
  if (daysSober <= 30) {
    const earlyResources = resources.filter(r => 
      r.tags.some(tag => ['withdrawal', 'early-recovery', 'basics'].includes(tag))
    ).slice(0, 1);
    
    if (earlyResources.length > 0) {
      recommendations.push({
        id: `edu-early-${Date.now()}`,
        type: 'education',
        resourceIds: earlyResources.map(r => r.id),
        reason: 'This content is specifically helpful during the first month of recovery.',
        priority: 6,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Mid recovery (31-90 days): Focus on triggers, habits, lifestyle
  else if (daysSober <= 90) {
    const midResources = resources.filter(r => 
      r.tags.some(tag => ['triggers', 'habits', 'lifestyle-change'].includes(tag))
    ).slice(0, 1);
    
    if (midResources.length > 0) {
      recommendations.push({
        id: `edu-mid-${Date.now()}`,
        type: 'education',
        resourceIds: midResources.map(r => r.id),
        reason: 'At this stage of recovery, understanding your triggers and building new habits is key.',
        priority: 6,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Long-term recovery (91+ days): Focus on growth, purpose, identity
  else {
    const longTermResources = resources.filter(r => 
      r.tags.some(tag => ['growth', 'purpose', 'identity', 'long-term'].includes(tag))
    ).slice(0, 1);
    
    if (longTermResources.length > 0) {
      recommendations.push({
        id: `edu-long-${Date.now()}`,
        type: 'education',
        resourceIds: longTermResources.map(r => r.id),
        reason: 'As you progress in recovery, finding purpose and rebuilding identity becomes important.',
        priority: 6,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return recommendations;
};
