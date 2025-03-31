
import { useEffect, useState } from 'react';
import { getUserProgress } from '@/utils/storage';
import { getResources } from '@/utils/storage/resources';
import { predictRelapseRisk, PredictionResult } from '@/utils/storage/recommendations/prediction';

export function usePrediction() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
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
  
  return {
    prediction,
    isLoading
  };
}
