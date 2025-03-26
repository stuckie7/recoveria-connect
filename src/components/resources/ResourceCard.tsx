
import React from 'react';
import { Book, Video, Play, FileText, BookOpen, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resource } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isSelected }) => {
  // Get icon for resource type
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return <FileText size={18} className="text-blue-500" />;
      case 'video':
        return <Video size={18} className="text-red-500" />;
      case 'audio':
        return <Play size={18} className="text-green-500" />;
      case 'exercise':
        return <BookOpen size={18} className="text-purple-500" />;
      default:
        return <Book size={18} className="text-gray-500" />;
    }
  };

  const handleResourceClick = () => {
    // Open the resource URL in a new tab
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      id={`resource-${resource.id}`}
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg group border-border hover:border-primary/30 animate-fade-in h-full cursor-pointer",
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      )}
      onClick={handleResourceClick}
    >
      {/* Resource image */}
      <div className="h-48 relative overflow-hidden">
        <img 
          src={resource.imageUrl} 
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-0 left-0 p-3">
          <Badge variant="secondary" className="flex items-center gap-1.5 backdrop-blur-sm bg-white/90 text-foreground shadow-sm">
            {getResourceIcon(resource.type)}
            <span>{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
          </Badge>
        </div>
        <div className="absolute bottom-0 right-0 p-3">
          <div className="bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-medium flex items-center">
            <Clock size={12} className="mr-1.5" />
            {resource.duration}
          </div>
        </div>
      </div>
      
      {/* Resource content */}
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-muted text-xs rounded-full hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              onClick={(e) => {
                // Prevent the card click from triggering
                e.stopPropagation();
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium">
          Learn more
          <ExternalLink size={14} className="ml-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
