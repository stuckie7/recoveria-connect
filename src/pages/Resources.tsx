
import React, { useState } from 'react';
import { Book, Video, Play, FileText, Search, Filter, Clock, BookOpen, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resource } from '@/types';

// Sample resources data
const SAMPLE_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Understanding Addiction: The Science Behind Recovery',
    description: 'Learn about the neuroscience of addiction and how understanding your brain can help your recovery journey.',
    type: 'article',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1579165466741-7f35e4755169?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['science', 'education', 'beginner'],
    duration: '10 min read'
  },
  {
    id: '2',
    title: 'Guided Meditation for Cravings',
    description: 'A calming meditation practice specifically designed to help you through moments of intense cravings.',
    type: 'audio',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['meditation', 'coping', 'audio'],
    duration: '15 min listen'
  },
  {
    id: '3',
    title: 'Rebuilding Relationships in Recovery',
    description: 'Practical advice on how to repair and strengthen relationships that may have been damaged during addiction.',
    type: 'video',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['relationships', 'healing', 'video'],
    duration: '22 min watch'
  },
  {
    id: '4',
    title: 'CBT Skills Workbook',
    description: 'Interactive exercises to develop cognitive behavioral therapy skills for managing triggers and negative thoughts.',
    type: 'exercise',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['cbt', 'exercise', 'tools'],
    duration: '45 min activity'
  },
  {
    id: '5',
    title: 'Nutrition for Recovery: Healing Your Body',
    description: 'How proper nutrition can support physical healing and stabilize mood during recovery.',
    type: 'article',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['nutrition', 'health', 'self-care'],
    duration: '12 min read'
  },
  {
    id: '6',
    title: 'Finding Purpose After Addiction',
    description: 'Stories and strategies for discovering new meaning and purpose in your life after addiction.',
    type: 'video',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tags: ['purpose', 'motivation', 'success-stories'],
    duration: '18 min watch'
  }
];

type ResourceType = 'all' | 'article' | 'video' | 'audio' | 'exercise';

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(SAMPLE_RESOURCES.flatMap(resource => resource.tags))
  ).sort();
  
  // Filter resources
  const filteredResources = SAMPLE_RESOURCES.filter(resource => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  }).filter(resource => {
    // Apply type filter
    if (selectedType !== 'all') {
      return resource.type === selectedType;
    }
    return true;
  }).filter(resource => {
    // Apply tag filter
    if (selectedTags.length > 0) {
      return selectedTags.some(tag => resource.tags.includes(tag));
    }
    return true;
  });
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
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
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">
          Learning Resources
        </h1>
        <p className="text-muted-foreground mb-6 text-center lg:text-left">
          Educational materials to support your recovery journey
        </p>
        
        {/* Search and filters */}
        <div className="glass-card mb-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl neo-input"
                />
              </div>
              
              {/* Filter button */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:w-auto w-full flex items-center justify-center space-x-2 px-4 py-2 neo-button"
              >
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
            
            {/* Filter options */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Content type */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Content Type</h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedType('all')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          selectedType === 'all' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <Book size={14} className="mr-1.5" />
                        All
                      </button>
                      
                      <button 
                        onClick={() => setSelectedType('article')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          selectedType === 'article' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <FileText size={14} className="mr-1.5" />
                        Articles
                      </button>
                      
                      <button 
                        onClick={() => setSelectedType('video')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          selectedType === 'video' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <Video size={14} className="mr-1.5" />
                        Videos
                      </button>
                      
                      <button 
                        onClick={() => setSelectedType('audio')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          selectedType === 'audio' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <Play size={14} className="mr-1.5" />
                        Audio
                      </button>
                      
                      <button 
                        onClick={() => setSelectedType('exercise')}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm",
                          selectedType === 'exercise' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-white shadow-sm hover:bg-primary/10"
                        )}
                      >
                        <BookOpen size={14} className="mr-1.5" />
                        Exercises
                      </button>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      <Tag size={14} className="inline mr-1.5" />
                      Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button 
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm",
                            selectedTags.includes(tag) 
                              ? "bg-primary/20 text-primary" 
                              : "bg-white shadow-sm hover:bg-primary/10"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Resource cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <a 
                key={resource.id} 
                href={resource.url}
                className="glass-card overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 animate-fade-in"
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
            ))
          ) : (
            <div className="col-span-full glass-card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find more resources.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
