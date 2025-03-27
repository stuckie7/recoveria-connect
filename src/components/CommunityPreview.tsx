
import React, { useEffect, useState } from 'react';
import { MessageSquare, Heart, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CommunityPost } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const CommunityPreview: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the 2 most recent posts from Supabase
        const { data: postData, error: postError } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (postError) {
          throw postError;
        }

        // For each post, fetch the user details
        const postsWithUserDetails = await Promise.all(
          postData.map(async (post) => {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', post.user_id)
              .single();
            
            return { 
              ...post, 
              username: userData?.username || 'Anonymous User',
              avatar_url: userData?.avatar_url || `https://i.pravatar.cc/150?u=${post.user_id}`,
              title: post.title || 'Untitled Post', // Ensure title exists
              likes: post.likes || 0,
              comments: post.comments || 0,
              tags: post.tags || []
            };
          })
        );
        
        setPosts(postsWithUserDetails);
      } catch (error) {
        console.error('Error fetching community posts:', error);
        toast({
          title: "Error loading posts",
          description: "Could not load the latest community posts.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Set a random number of online users between 50 and
    // 500 for visual effect (in a real app, this would be tracked)
    setOnlineUsers(Math.floor(Math.random() * (500 - 50 + 1)) + 50);
    
    fetchRecentPosts();
  }, [toast]);

  const formatTimeAgo = (dateString: string) => {
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div 
              key={index}
              className="glass-card p-4 animate-pulse"
            >
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-full bg-muted mr-2"></div>
                <div>
                  <div className="h-4 w-32 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
              </div>
              <div className="h-10 bg-muted rounded mb-3"></div>
              <div className="flex items-center">
                <div className="h-4 w-12 bg-muted rounded mr-4"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="glass-card p-4 text-center">
          <p className="text-muted-foreground">
            No community posts yet. Be the first to share your journey!
          </p>
          <Link 
            to="/community" 
            className="text-sm text-primary flex items-center justify-center mt-2 hover:underline"
          >
            Create a post <ChevronRight size={16} />
          </Link>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className={cn(
              "glass-card overflow-hidden transition-all",
              "hover:shadow-lg hover:border-primary/30",
              "animate-slide-in-bottom",
              { "animation-delay-100": index === 0 },
              { "animation-delay-200": index === 1 },
            )}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={post.avatar_url} alt={post.username} />
                    <AvatarFallback>{post.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <div className="text-xs text-muted-foreground">
                      by <span className="text-foreground">{post.username}</span> · {formatTimeAgo(post.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="flex items-center mr-4">
                  <Heart size={14} className="mr-1 text-rose-400" />
                  {post.likes}
                </div>
                
                <div className="flex items-center">
                  <MessageSquare size={14} className="mr-1 text-primary" />
                  {post.comments}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="neo-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Community Support</h3>
        
        <Link 
          to="/community" 
          className="text-sm text-primary flex items-center hover:underline"
        >
          View all <ChevronRight size={16} />
        </Link>
      </div>
      
      {renderContent()}
      
      <div className="mt-4 p-3 bg-muted rounded-xl flex items-center justify-center text-sm">
        <Users size={16} className="mr-2 text-primary" />
        <span>{onlineUsers} members online</span>
      </div>
    </div>
  );
};

export default CommunityPreview;
