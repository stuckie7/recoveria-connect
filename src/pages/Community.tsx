
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import CommunitySearch from '@/components/community/CommunitySearch';
import CommunityFilter from '@/components/community/CommunityFilter';
import CommunityStats from '@/components/community/CommunityStats';
import PostsList from '@/components/community/PostsList';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';

const Community: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    posts,
    isLoading,
    isError,
    refetch,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    isFilterOpen,
    setIsFilterOpen,
    handleLikePost
  } = useCommunityPosts();
  
  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">Community</h1>
        <p className="text-muted-foreground mb-6 text-center lg:text-left">
          Connect with others on the recovery journey
        </p>
        
        {/* Search and filter */}
        <div className="glass-card mb-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <CommunitySearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              
              <CommunityFilter
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterBy={filterBy}
                setFilterBy={setFilterBy}
              />
            </div>
          </div>
        </div>
        
        {/* Community stats */}
        <CommunityStats postCount={posts?.length || 0} />
        
        {/* Posts list */}
        <PostsList 
          isLoading={isLoading} 
          isError={isError}
          posts={posts} 
          onLike={handleLikePost}
        />
        
        {/* Create post button */}
        <div className="fixed bottom-24 right-4 z-30">
          <button 
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary text-white"
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Create new post"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Community;
