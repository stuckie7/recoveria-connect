
import { Resource } from '@/types';
import { Recommendation } from './types';

/**
 * Generate educational content recommendations based on user progress
 */
export const generateEducationalContent = (
  progress: any,
  resources: Resource[]
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Get days in recovery
  const startDate = new Date(progress.startDate);
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Analyze check-ins for common themes
  const checkIns = progress.checkIns || [];
  const recentCheckIns = checkIns.slice(0, 10); // Get 10 most recent check-ins
  
  // Extract topics that might be relevant based on recent check-ins
  const relevantTopics: string[] = [];
  const triggerFrequency: Record<string, number> = {};
  
  // Analyze check-ins to identify patterns and needs
  recentCheckIns.forEach(checkIn => {
    // Track triggers
    checkIn.triggers.forEach(trigger => {
      triggerFrequency[trigger] = (triggerFrequency[trigger] || 0) + 1;
    });
    
    // Add relevant topics based on mood
    if (checkIn.mood === 'bad' || checkIn.mood === 'terrible') {
      relevantTopics.push('coping-skills', 'mental-health');
    }
    
    // Add topics based on notes (if they exist)
    if (checkIn.notes) {
      const notesLower = checkIn.notes.toLowerCase();
      if (notesLower.includes('sleep')) relevantTopics.push('sleep-health');
      if (notesLower.includes('anxious') || notesLower.includes('anxiety')) relevantTopics.push('anxiety');
      if (notesLower.includes('family')) relevantTopics.push('relationships');
      if (notesLower.includes('tired') || notesLower.includes('energy')) relevantTopics.push('energy');
    }
  });
  
  // Stage-based educational content
  let stageBasedTopics: string[] = [];
  
  // Early recovery (0-30 days)
  if (daysSinceStart <= 30) {
    stageBasedTopics = ['beginner', 'education', 'basics', 'science'];
  } 
  // Intermediate recovery (31-90 days)
  else if (daysSinceStart <= 90) {
    stageBasedTopics = ['coping', 'tools', 'habits', 'triggers'];
  } 
  // Advanced recovery (91+ days)
  else {
    stageBasedTopics = ['growth', 'purpose', 'relationships', 'healing'];
  }
  
  // Find top triggers to address
  const topTriggers = Object.entries(triggerFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Educational content based on recovery stage
  const stageEducationalResources = resources.filter(r => 
    r.type === 'article' || r.type === 'video'
  ).filter(r => 
    r.tags.some(tag => stageBasedTopics.includes(tag))
  ).slice(0, 2);
  
  if (stageEducationalResources.length > 0) {
    recommendations.push({
      id: `education-stage-${daysSinceStart}`,
      type: 'general',
      resources: stageEducationalResources.map(r => r.id),
      reason: daysSinceStart <= 30 
        ? 'Educational materials to build your recovery foundation'
        : daysSinceStart <= 90
        ? 'Content to strengthen your recovery skills at this stage'
        : 'Resources for long-term recovery and growth',
      priority: 8
    });
  }
  
  // Personalized content based on check-in patterns
  if (relevantTopics.length > 0) {
    const uniqueTopics = [...new Set(relevantTopics)];
    const personalResources = resources.filter(r => 
      r.tags.some(tag => uniqueTopics.includes(tag))
    ).slice(0, 2);
    
    if (personalResources.length > 0) {
      recommendations.push({
        id: `education-personal-${Date.now()}`,
        type: 'mood',
        resources: personalResources.map(r => r.id),
        reason: 'Educational resources selected based on your recent check-ins',
        priority: 7
      });
    }
  }
  
  // Educational content for top triggers
  if (topTriggers.length > 0) {
    const triggerResources = resources.filter(r => 
      (r.type === 'article' || r.type === 'video') && 
      r.tags.some(tag => tag === 'triggers' || tag === 'coping')
    ).slice(0, 2);
    
    if (triggerResources.length > 0) {
      recommendations.push({
        id: `education-triggers-${Date.now()}`,
        type: 'triggers',
        resources: triggerResources.map(r => r.id),
        reason: 'Educational content to help with your frequently reported triggers',
        priority: 6
      });
    }
  }
  
  return recommendations;
};
