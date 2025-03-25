
import React from 'react';
import { Search, Filter, Book, FileText, Video, Play, BookOpen, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

type ResourceType = 'all' | 'article' | 'video' | 'audio' | 'exercise';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: ResourceType;
  setSelectedType: (type: ResourceType) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  allTags: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedTags,
  setSelectedTags,
  isFilterOpen,
  setIsFilterOpen,
  allTags,
}) => {
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
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
  );
};

export default SearchAndFilter;
