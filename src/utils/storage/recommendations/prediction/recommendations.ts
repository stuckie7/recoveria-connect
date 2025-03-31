
import { Resource } from '@/types';
import { Recommendation } from '../types';
import { RiskFactors } from './types';

/**
 * Generate recommendations based on risk factors
 */
export const generateInterventions = (
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
export const generateReasonText = (risk: keyof RiskFactors, level: number): string => {
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
export const generateActionText = (risk: keyof RiskFactors): string => {
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
