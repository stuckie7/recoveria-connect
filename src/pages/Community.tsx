
import React, { useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import CreatePostModal from '@/components/community/CreatePostModal';
import CommunitySearch from '@/components/community/CommunitySearch';
import CommunityFilter from '@/components/community/CommunityFilter';
import CommunityStats from '@/components/community/CommunityStats';
import PostsList from '@/components/community/PostsList';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Community: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
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
  
  // Filter posts for questions section
  const questionPosts = posts.filter(post => post.type === 'question');
  
  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">Community</h1>
            <p className="text-muted-foreground mb-0 text-center lg:text-left">
              Connect with others on the recovery journey
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="mt-4 lg:mt-0 w-full lg:w-auto"
          >
            <Plus size={18} />
            New Post
          </Button>
        </div>
        
        {/* Main tabs for All/Q&A */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="qa">Q&A Section</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
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
          </TabsContent>
          
          <TabsContent value="qa">
            <div className="glass-card mb-6">
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center">
                        <MessageSquare className="mr-2" size={20} />
                        Questions & Answers
                      </h2>
                      <p className="text-muted-foreground">
                        Ask questions, share answers, and help others on their recovery journey
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)} 
                      className="mt-4 md:mt-0"
                      variant="secondary"
                    >
                      <Plus size={18} />
                      Ask Question
                    </Button>
                  </div>
                  
                  <CommunitySearch 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                  />
                </div>
              </div>
            </div>
            
            <CommunityStats postCount={questionPosts?.length || 0} label="Questions" />
            
            <PostsList 
              isLoading={isLoading} 
              isError={isError}
              posts={questionPosts} 
              onLike={handleLikePost}
              isQASection={true}
            />
          </TabsContent>
        </Tabs>
        
        {/* Floating create post button */}
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
        defaultType={activeTab === "qa" ? "question" : "story"}
      />
    </div>
  );
};

export default Community;
