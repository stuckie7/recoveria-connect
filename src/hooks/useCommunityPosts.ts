import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommunityPost } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SortOption, FilterOption } from '@/components/community/CommunityFilter';

export const useCommunityPosts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
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
          if (filterBy === 'achievements' && post.type === 'achievement') return true;
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

  return {
    posts: filteredPosts,
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
  };
};
