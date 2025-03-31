
import { Recommendation } from '../types';

// Risk factors that contribute to relapse probability
export interface RiskFactors {
  moodDecline: number;          // 0-1 score for negative mood pattern
  triggerExposure: number;      // 0-1 score for recent trigger encounters
  isolationLevel: number;       // 0-1 score for social isolation
  stressLevel: number;          // 0-1 score for reported stress
  sleepDisruption: number;      // 0-1 score for sleep issues
  missedCheckIns: number;       // 0-1 score based on consistency of check-ins
}

export interface PredictionResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;            // 0-100 score
  primaryFactors: string[];     // Main contributing factors
  recommendations: Recommendation[];
}
