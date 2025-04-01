
import { UserProgress, Resource } from '@/types';
import { RiskFactors, PredictionResult } from './types';
import { 
  analyzeMoodPatterns, 
  analyzeTriggerExposure, 
  analyzeIsolation, 
  calculateMissedCheckIns,
  calculateStressAndSleep,
  getPrimaryFactors,
  getRiskLevel
} from './riskFactors';
import { generateInterventions } from './recommendations';

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
