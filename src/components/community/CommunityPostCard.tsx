
import React from 'react';
import { format } from 'date-fns';
import { Heart, MessageSquare } from 'lucide-react';
import { CommunityPost } from '@/types';
import { Badge } from '@/components/ui/badge';

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike: (postId: string) => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onLike }) => {
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
    <div className="glass-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 animate-fade-in">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={post.avatar_url} 
                alt={post.username || 'User'} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{post.username || 'Anonymous'}</h3>
              <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
            </div>
          </div>
          
          <span className="text-xs px-2 py-1 bg-muted rounded-full">
            {post.type}
          </span>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">
          {post.title}
        </h2>
        
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
              onClick={() => onLike(post.id)}
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
  );
};

export default CommunityPostCard;
