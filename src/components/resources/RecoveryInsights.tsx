
import React from 'react';
import { Resource } from '@/types';
import { BarChart3, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecoveryInsightsProps {
  resources: Resource[];
  onSelectResource: (resource: Resource) => void;
  loading?: boolean;
}

const RecoveryInsights: React.FC<RecoveryInsightsProps> = ({ 
  resources, 
  onSelectResource,
  loading = false
}) => {
  // Filter for featured resources
  const featuredResources = resources
    .filter(resource => 
      // Simple criteria for "featured" - articles about science or education
      resource.tags.includes('science') || 
      resource.tags.includes('education') || 
      resource.tags.includes('beginner')
    )
    .slice(0, 2);
  
  if (loading) {
    return (
      <div className="glass-card p-6 mb-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-muted mr-3"></div>
          <div className="h-6 w-48 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  if (featuredResources.length === 0) {
    return null;
  }
  
  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center mb-4">
        <Sparkles size={24} className="text-primary mr-3" />
        <h2 className="text-xl font-semibold">Recovery Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredResources.map((resource) => (
          <div 
            key={resource.id}
            onClick={() => onSelectResource(resource)}
            className={cn(
              "flex cursor-pointer p-4 group hover:bg-accent transition-colors rounded-xl",
              "border border-border hover:border-primary/50"
            )}
          >
            {resource.type === 'article' ? (
              <BookOpen size={40} className="text-primary mr-4 flex-shrink-0" />
            ) : (
              <BarChart3 size={40} className="text-primary mr-4 flex-shrink-0" />
            )}
            
            <div>
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {resource.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecoveryInsights;
