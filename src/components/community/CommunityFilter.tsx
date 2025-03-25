
import React from 'react';
import { Filter, Clock, Heart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'recent' | 'popular' | 'trending';
export type FilterOption = 'all' | 'questions' | 'stories' | 'resources';

interface CommunityFilterProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  filterBy: FilterOption;
  setFilterBy: (option: FilterOption) => void;
}

const CommunityFilter: React.FC<CommunityFilterProps> = ({
  isFilterOpen,
  setIsFilterOpen,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy
}) => {
  return (
    <>
      <button 
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="lg:w-auto w-full flex items-center justify-center space-x-2 px-4 py-2 neo-button"
      >
        <Filter size={18} />
        <span>Filter</span>
      </button>
      
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sort options */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sort by</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSortBy('recent')}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-full text-sm",
                    sortBy === 'recent' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  <Clock size={14} className="mr-1.5" />
                  Recent
                </button>
                
                <button 
                  onClick={() => setSortBy('popular')}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-full text-sm",
                    sortBy === 'popular' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  <Heart size={14} className="mr-1.5" />
                  Popular
                </button>
                
                <button 
                  onClick={() => setSortBy('trending')}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-full text-sm",
                    sortBy === 'trending' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  <TrendingUp size={14} className="mr-1.5" />
                  Trending
                </button>
              </div>
            </div>
            
            {/* Filter options */}
            <div>
              <h4 className="text-sm font-medium mb-2">Filter by</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterBy('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm",
                    filterBy === 'all' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  All
                </button>
                
                <button 
                  onClick={() => setFilterBy('questions')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm",
                    filterBy === 'questions' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  Questions
                </button>
                
                <button 
                  onClick={() => setFilterBy('stories')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm",
                    filterBy === 'stories' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  Success Stories
                </button>
                
                <button 
                  onClick={() => setFilterBy('resources')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm",
                    filterBy === 'resources' 
                      ? "bg-primary/20 text-primary" 
                      : "bg-white shadow-sm hover:bg-primary/10"
                  )}
                >
                  Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommunityFilter;
