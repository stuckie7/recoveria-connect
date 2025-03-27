
import React from 'react';
import { Resource } from '@/types';
import ResourceCard from './ResourceCard';

interface ResourceGridProps {
  resources: Resource[];
  selectedResource: Resource | null;
  loading?: boolean;
}

const ResourceGrid: React.FC<ResourceGridProps> = ({ 
  resources, 
  selectedResource,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="animate-pulse glass-card h-96 rounded-xl overflow-hidden">
            <div className="h-48 bg-muted"></div>
            <div className="p-5">
              <div className="h-5 bg-muted rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-muted rounded mb-4 w-4/6"></div>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="h-6 w-16 bg-muted rounded-full"></div>
                <div className="h-6 w-20 bg-muted rounded-full"></div>
                <div className="h-6 w-14 bg-muted rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
