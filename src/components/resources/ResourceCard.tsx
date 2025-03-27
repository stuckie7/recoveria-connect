
import React from 'react';
import { Book, Video, Play, FileText, BookOpen, Clock, ExternalLink, Heart } from 'lucide-react';
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
        return <FileText size={18} className="text-white" />;
      case 'video':
        return <Video size={18} className="text-white" />;
      case 'audio':
        return <Play size={18} className="text-white" />;
      case 'exercise':
        return <BookOpen size={18} className="text-white" />;
      default:
        return <Book size={18} className="text-white" />;
    }
  };

  // Get background color based on resource type
  const getCardColor = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return 'fun-card-teal';
      case 'video':
        return 'fun-card-burgundy';
      case 'audio':
        return 'fun-card-leaf';
      case 'exercise':
        return 'fun-card-mauve';
      default:
        return 'fun-card-amber';
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
        "overflow-hidden transition-all fun-card group animate-fade-in h-full cursor-pointer",
        getCardColor(resource.type),
        isSelected ? "ring-4 ring-white ring-offset-4" : ""
      )}
      onClick={handleResourceClick}
    >
      {/* Resource image */}
      <div className="h-48 relative overflow-hidden rounded-xl">
        <img 
          src={resource.imageUrl} 
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="absolute top-0 left-0 p-3">
          <Badge variant="secondary" className="flex items-center gap-1.5 backdrop-blur-sm bg-white/90 text-foreground shadow-sm">
            {getResourceIcon(resource.type)}
            <span className="text-black font-medium">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
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
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-white">
          {resource.title}
        </h3>
        
        <p className="text-sm text-white/90 mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full hover:bg-white/30 cursor-pointer transition-colors"
              onClick={(e) => {
                // Prevent the card click from triggering
                e.stopPropagation();
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="inline-flex items-center text-sm text-white hover:text-white/80 transition-colors font-medium">
          Learn more
          <ExternalLink size={14} className="ml-1" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
