
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, User, Search, Filter, Clock, TrendingUp, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CreatePostModal from '@/components/CreatePostModal';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

type SortOption = 'recent' | 'popular' | 'trending';
type FilterOption = 'all' | 'questions' | 'stories' | 'resources';

type CommunityPost = {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  user_id: string;
  likes: number;
  comments: number;
  tags: string[];
  username?: string;
  avatar_url?: string;
};

const Community: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Function to fetch posts from Supabase
  const fetchPosts = async (): Promise<CommunityPost[]> => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }

    // Fetch user details for each post
    const postsWithUserDetails = await Promise.all(
      data.map(async (post) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', post.user_id)
          .single();
        
        if (!userError && userData) {
          return { 
            ...post, 
            title: post.title || 'Untitled Post', // Ensure title exists
            username: userData.username || 'Anonymous User',
            avatar_url: userData.avatar_url || `https://i.pravatar.cc/150?u=${post.user_id}`,
            likes: post.likes || 0,
            comments: post.comments || 0,
            tags: post.tags || []
          };
        }
        
        return { 
          ...post, 
          title: post.title || 'Untitled Post', // Ensure title exists 
          username: 'Anonymous User',
          avatar_url: `https://i.pravatar.cc/150?u=${post.user_id}`,
          likes: post.likes || 0,
          comments: post.comments || 0,
          tags: post.tags || []
        };
      })
    );
    
    return postsWithUserDetails;
  };

  // Use React Query to fetch posts
  const { data: posts, isLoading, isError, refetch } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: fetchPosts,
  });
  
  // Filter and sort posts
  const filteredPosts = posts
    ? posts
        .filter(post => {
          // Apply search term filter
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
              post.title.toLowerCase().includes(searchLower) || 
              post.content.toLowerCase().includes(searchLower) ||
              post.username?.toLowerCase().includes(searchLower) ||
              post.tags?.some(tag => tag?.toLowerCase().includes(searchLower))
            );
          }
          return true;
        })
        .filter(post => {
          // Apply category filter
          if (filterBy === 'all') return true;
          if (filterBy === 'questions' && post.type === 'question') return true;
          if (filterBy === 'stories' && post.type === 'story') return true;
          if (filterBy === 'resources' && post.type === 'resource') return true;
          return false;
        })
        .sort((a, b) => {
          // Apply sorting
          if (sortBy === 'recent') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          if (sortBy === 'popular') {
            return b.likes - a.likes;
          }
          if (sortBy === 'trending') {
            return (b.likes + b.comments) - (a.likes + a.comments);
          }
          return 0;
        })
    : [];

  // Handle like functionality  
  const handleLikePost = async (postId: string) => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    
    const post = posts?.find(p => p.id === postId);
    
    if (post) {
      const { error } = await supabase
        .from('community_posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to like post",
          variant: "destructive"
        });
      } else {
        refetch();
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
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
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search discussions..."
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
          </div>
        </div>
        
        {/* Community stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-recovery-blue flex items-center justify-center mr-3">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Active Members</h4>
              <p className="text-2xl font-semibold">3,298</p>
            </div>
          </div>
          
          <div className="glass-card p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-recovery-green-dark flex items-center justify-center mr-3">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Discussions</h4>
              <p className="text-2xl font-semibold">{posts?.length || '0'}</p>
            </div>
          </div>
          
          <div className="glass-card p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Online Now</h4>
              <p className="text-2xl font-semibold">324</p>
            </div>
          </div>
        </div>
        
        {/* Posts list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Loading posts...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch the latest discussions.
              </p>
            </div>
          ) : isError ? (
            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
              <p className="text-muted-foreground">
                There was an error loading the community posts. Please try again.
              </p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="glass-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 animate-fade-in"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src={post.avatar_url} 
                          alt={post.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{post.username}</h3>
                        <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {post.type}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  
                  <p className="text-foreground/80 mb-4">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        className="flex items-center text-muted-foreground hover:text-rose-500 transition-colors"
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart size={18} className="mr-1" />
                        <span>{post.likes}</span>
                      </button>
                      
                      <div className="flex items-center text-muted-foreground">
                        <MessageSquare size={18} className="mr-1" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    
                    <button className="text-sm text-primary hover:underline">
                      View Discussion
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
        
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
