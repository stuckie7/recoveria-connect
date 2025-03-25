import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type PostType = 'story' | 'question' | 'resource';

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
          variant={type === 'question' ? 'default' : 'outline'} 
          onClick={() => setType('question')}
          size="sm"
        >
          Question
        </Button>
        <Button 
          type="button" 
          variant={type === 'resource' ? 'default' : 'outline'} 
          onClick={() => setType('resource')}
          size="sm"
        >
          Resource
        </Button>
      </div>
    </div>
  );
};

export default PostTypeSelector;
