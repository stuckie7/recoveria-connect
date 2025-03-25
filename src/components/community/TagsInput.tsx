
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface TagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({ tags, setTags }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags</Label>
      <div className="flex gap-2">
        <Input 
          id="tags" 
          value={tagInput} 
          onChange={(e) => setTagInput(e.target.value)} 
          placeholder="Add a tag (e.g., anxiety, medication)" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={handleAddTag}
          variant="outline"
        >
          Add
        </Button>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <div 
              key={tag} 
              className="px-2 py-1 bg-muted rounded-full text-xs flex items-center"
            >
              #{tag}
              <button 
                type="button" 
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsInput;
