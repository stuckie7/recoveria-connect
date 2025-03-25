
import React from 'react';
import { Book, Video, Play, FileText, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resource } from '@/types';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isSelected }) => {
  // Get icon for resource type
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return <FileText size={20} className="text-blue-500" />;
      case 'video':
        return <Video size={20} className="text-red-500" />;
      case 'audio':
        return <Play size={20} className="text-green-500" />;
      case 'exercise':
        return <BookOpen size={20} className="text-purple-500" />;
      default:
        return <Book size={20} className="text-gray-500" />;
    }
  };

  return (
    <a 
      id={`resource-${resource.id}`}
      href={resource.url}
      className={cn(
        "glass-card overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 animate-fade-in",
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      )}
    >
      {/* Resource image */}
      <div className="h-48 relative overflow-hidden">
        <img 
          src={resource.imageUrl} 
          alt={resource.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 p-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center">
            {getResourceIcon(resource.type)}
            <span className="ml-1.5">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-2">
          <div className="bg-black/70 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-medium flex items-center">
            <Clock size={12} className="mr-1.5" />
            {resource.duration}
          </div>
        </div>
      </div>
      
      {/* Resource content */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2 line-clamp-2">
          {resource.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {resource.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-muted text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
};

export default ResourceCard;
