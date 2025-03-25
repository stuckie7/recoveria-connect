
import React from 'react';
import { CommunityPost } from '@/types';
import CommunityPostCard from './CommunityPostCard';
import { MessageSquare } from 'lucide-react';

interface PostsListProps {
  isLoading: boolean;
  isError: boolean;
  posts: CommunityPost[];
  onLike: (postId: string) => void;
  isQASection?: boolean;
}

const PostsList: React.FC<PostsListProps> = ({ 
  isLoading, 
  isError, 
  posts, 
  onLike, 
  isQASection = false 
}) => {
  if (isLoading) {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Loading posts...</h3>
        <p className="text-muted-foreground">
          Please wait while we fetch the latest discussions.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="text-muted-foreground">
          There was an error loading the community posts. Please try again.
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="text-lg font-medium mb-2">
          {isQASection ? "No questions found" : "No matches found"}
        </h3>
        <p className="text-muted-foreground">
          {isQASection 
            ? "Be the first to ask a question and help build our community knowledge base."
            : "Try adjusting your search or filters to find what you're looking for."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isQASection && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <MessageSquare size={18} className="mr-2 text-primary" />
            {posts.length} {posts.length === 1 ? 'Question' : 'Questions'}
          </h3>
        </div>
      )}
      
      {posts.map(post => (
        <CommunityPostCard 
          key={post.id} 
          post={post} 
          onLike={onLike}
          isQAPost={isQASection}
        />
      ))}
    </div>
  );
};

export default PostsList;
