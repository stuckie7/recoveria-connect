
import React from 'react';
import { Resource } from '@/types';
import { BookOpen, Video, Headphones, Dumbbell, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ResourceCardProps {
  resource: Resource;
  onClick?: () => void;
  isSelected?: boolean;
  compact?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onClick, 
  isSelected = false,
  compact = false
}) => {
  const { title, description, type, url, imageUrl, tags, duration } = resource;
  
  const TypeIcon = {
    article: BookOpen,
    video: Video,
    audio: Headphones,
    exercise: Dumbbell
  }[type] || BookOpen;
  
  // Truncate description to a certain length
  const shortenedDescription = compact 
    ? description.length > 60 ? `${description.substring(0, 60)}...` : description
    : description.length > 100 ? `${description.substring(0, 100)}...` : description;
  
  return (
    <Card 
      className={`h-full transition-all duration-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'} ${compact ? 'shadow-sm' : 'shadow'}`}
      id={`resource-${resource.id}`}
      onClick={onClick}
    >
      {!compact && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <TypeIcon className="h-3 w-3" />
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </Badge>
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white">
                {duration}
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className={compact ? "p-3 pb-1" : "pb-2"}>
        <div className="flex items-start justify-between">
          <CardTitle className={`${compact ? 'text-base' : 'text-lg'} font-semibold line-clamp-2`}>
            {title}
          </CardTitle>
          {compact && (
            <TypeIcon className="h-4 w-4 ml-2 mt-1 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        {!compact && duration && (
          <CardDescription className="text-sm">{duration}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={compact ? "p-3 pt-0 pb-1" : ""}>
        <p className={`text-sm text-muted-foreground ${compact ? 'line-clamp-2 mt-1' : 'mt-2'}`}>
          {shortenedDescription}
        </p>
        
        {!compact && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className={compact ? "p-3 pt-1" : ""}>
        <Button 
          size={compact ? "sm" : "default"} 
          variant={compact ? "ghost" : "default"} 
          className={`${compact ? 'px-2 text-xs' : 'w-full'} flex items-center justify-center gap-2`}
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <span>View {type}</span>
            <ExternalLink className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
export type { ResourceCardProps };
