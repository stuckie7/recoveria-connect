
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type PostType = 'story' | 'achievement' | 'question';

interface PostTypeSelectorProps {
  type: PostType;
  setType: (type: PostType) => void;
}

const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({ type, setType }) => {
  return (
    <div className="space-y-2">
      <Label>Post Type</Label>
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant={type === 'story' ? 'default' : 'outline'} 
          onClick={() => setType('story')}
          size="sm"
        >
          Story
        </Button>
        <Button 
          type="button" 
          variant={type === 'achievement' ? 'default' : 'outline'} 
          onClick={() => setType('achievement')}
          size="sm"
        >
          Achievement
        </Button>
        <Button 
          type="button" 
          variant={type === 'question' ? 'default' : 'outline'} 
          onClick={() => setType('question')}
          size="sm"
        >
          Question
        </Button>
      </div>
    </div>
  );
};

export default PostTypeSelector;
