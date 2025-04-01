
import React from 'react';
import { Resource } from '@/types';
import { getResources } from '@/utils/storage/resources';
import { getResourcesByIds } from '@/utils/storage/recommendations/types';
import { Recommendation } from '@/utils/storage/recommendations/types';
import ResourceCard from '@/components/resources/ResourceCard';

type PredictionResourcesProps = {
  recommendations: Recommendation[];
};

export const PredictionResources: React.FC<PredictionResourcesProps> = ({ 
  recommendations 
}) => {
  // Get resources for recommendations
  const resources = getResources();
  const recommendedResources = recommendations
    .filter(rec => rec.resourceIds && rec.resourceIds.length > 0)
    .slice(0, 2)
    .flatMap(rec => getResourcesByIds(rec.resourceIds, resources));
  
  if (recommendedResources.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-medium">Recommended Resources:</p>
      <div className="space-y-3">
        {recommendedResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} compact />
        ))}
      </div>
    </div>
  );
};

export default PredictionResources;
