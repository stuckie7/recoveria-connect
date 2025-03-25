
import React from 'react';
import { Resource } from '@/types';
import ResourceCard from './ResourceCard';

interface ResourceGridProps {
  resources: Resource[];
  selectedResource: Resource | null;
}

const ResourceGrid: React.FC<ResourceGridProps> = ({ resources, selectedResource }) => {
  if (resources.length === 0) {
    return (
      <div className="col-span-full glass-card p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No resources found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find more resources.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard 
          key={resource.id} 
          resource={resource}
          isSelected={selectedResource?.id === resource.id}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;
