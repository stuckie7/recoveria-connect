
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type RiskDisplayProps = {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
};

export const RiskDisplay: React.FC<RiskDisplayProps> = ({ 
  riskLevel, 
  riskScore 
}) => {
  // Map risk level to colors
  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };
  
  const getProgressColor = (level: string): string => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Risk Level</span>
        <span>{riskScore}%</span>
      </div>
      <Progress 
        value={riskScore} 
        className="h-2" 
        indicatorClassName={getProgressColor(riskLevel)} 
      />
    </div>
  );
};

export default RiskDisplay;
