
import React from 'react';
import { CommunityPost } from '@/types';
import CommunityPostCard from './CommunityPostCard';

interface PostsListProps {
  isLoading: boolean;
  isError: boolean;
  posts: CommunityPost[];
  onLike: (postId: string) => void;
}

const PostsList: React.FC<PostsListProps> = ({ 
  isLoading, 
  isError, 
  posts, 
  onLike
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
        <h3 className="text-lg font-medium mb-2">No matches found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <CommunityPostCard 
          key={post.id} 
          post={post} 
          onLike={onLike}
        />
      ))}
    </div>
  );
};

export default PostsList;
