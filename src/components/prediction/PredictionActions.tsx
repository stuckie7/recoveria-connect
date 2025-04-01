
import React from 'react';
import { Recommendation } from '@/utils/storage/recommendations/types';

type PredictionActionsProps = {
  recommendations: Recommendation[];
};

export const PredictionActions: React.FC<PredictionActionsProps> = ({ 
  recommendations 
}) => {
  const actionRecommendations = recommendations
    .filter(rec => rec.action)
    .slice(0, 2);
  
  if (actionRecommendations.length === 0) {
    return null;
  }
  
  return (
    <>
      {actionRecommendations.map((rec, index) => (
        <div key={index} className="mt-2 p-3 bg-primary/10 rounded-md">
          <p className="text-sm">{rec.action}</p>
        </div>
      ))}
    </>
  );
};

export default PredictionActions;
