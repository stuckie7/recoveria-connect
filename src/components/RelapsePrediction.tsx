
import React, { useEffect, useState } from 'react';
import { getUserProgress } from '@/utils/storage';
import { getResources } from '@/utils/storage/resources';
import { predictRelapseRisk, PredictionResult } from '@/utils/storage/recommendations/relapsePrediction';
import { AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getResourcesByIds } from '@/utils/storage/recommendations/types';
import ResourceCard from './resources/ResourceCard';

const RelapsePrediction: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const calculatePrediction = () => {
      try {
        setIsLoading(true);
        const progress = getUserProgress();
        const resources = getResources();
        
        // Only generate prediction if there's enough data
        if (progress.checkIns.length >= 3) {
          const result = predictRelapseRisk(progress, resources);
          setPrediction(result);
        } else {
          setPrediction(null);
        }
      } catch (error) {
        console.error('Error calculating relapse prediction:', error);
        setPrediction(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculatePrediction();
    
    // Recalculate whenever the component mounts
    const timer = setInterval(calculatePrediction, 24 * 60 * 60 * 1000); // Refresh daily
    
    return () => clearInterval(timer);
  }, []);
  
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
  
  const getProgressColor = (level: string): string => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };
  
  // Get resources for recommendations
  const resources = getResources();
  const recommendedResources = prediction.recommendations
    .filter(rec => rec.resourceIds && rec.resourceIds.length > 0)
    .slice(0, 2)
    .flatMap(rec => getResourcesByIds(rec.resourceIds, resources));
  
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
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Risk Level</span>
            <span>{prediction.riskScore}%</span>
          </div>
          <Progress 
            value={prediction.riskScore} 
            className="h-2" 
            indicatorClassName={getProgressColor(prediction.riskLevel)} 
          />
        </div>
        
        {prediction.primaryFactors.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Contributing Factors:</p>
            <ul className="text-sm text-muted-foreground">
              {prediction.primaryFactors.map((factor, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {showDetails && recommendedResources.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium">Recommended Resources:</p>
            <div className="space-y-3">
              {recommendedResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} compact />
              ))}
            </div>
          </div>
        )}
        
        {showDetails && prediction.recommendations
          .filter(rec => rec.action)
          .slice(0, 2)
          .map((rec, index) => (
            <div key={index} className="mt-2 p-3 bg-primary/10 rounded-md">
              <p className="text-sm">{rec.action}</p>
            </div>
          ))
        }
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
