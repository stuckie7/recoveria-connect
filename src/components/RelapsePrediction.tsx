
import React, { useState } from 'react';
import { Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePrediction } from '@/hooks/usePrediction';
import RiskDisplay from './prediction/RiskDisplay';
import FactorsDisplay from './prediction/FactorsDisplay';
import PredictionResources from './prediction/PredictionResources';
import PredictionActions from './prediction/PredictionActions';

const RelapsePrediction: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { prediction, isLoading } = usePrediction();
  
  if (isLoading) {
    return (
      <Card className="w-full bg-background/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Shield className="mr-2 h-5 w-5 text-muted-foreground" />
            Relapse Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Not enough data to show prediction
  if (!prediction) {
    return (
      <Card className="w-full bg-background/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Shield className="mr-2 h-5 w-5 text-muted-foreground" />
            Relapse Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete more daily check-ins to enable AI-powered relapse prediction.
          </p>
        </CardContent>
      </Card>
    );
  }
  
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
  
  return (
    <Card className="w-full bg-background/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            {prediction.riskLevel === 'low' || prediction.riskLevel === 'moderate' ? (
              <Shield className="mr-2 h-5 w-5 text-primary" />
            ) : (
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            )}
            Relapse Risk Assessment
          </div>
          <span className={cn("text-sm font-medium", getRiskColor(prediction.riskLevel))}>
            {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Risk
          </span>
        </CardTitle>
        <CardDescription>
          AI-powered analysis based on your recent patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <RiskDisplay 
          riskLevel={prediction.riskLevel} 
          riskScore={prediction.riskScore} 
        />
        
        <FactorsDisplay factors={prediction.primaryFactors} />
        
        {showDetails && (
          <>
            <PredictionResources recommendations={prediction.recommendations} />
            <PredictionActions recommendations={prediction.recommendations} />
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-xs font-normal"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide details' : 'View recommended actions'}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RelapsePrediction;
