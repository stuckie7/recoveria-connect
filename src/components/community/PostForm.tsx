
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PostType } from './PostTypeSelector';
import PostTypeSelector from './PostTypeSelector';
import TagsInput from './TagsInput';

interface PostFormProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  type: PostType;
  setType: (type: PostType) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
}

const PostForm: React.FC<PostFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  type,
  setType,
  tags,
  setTags
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title*</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter a title for your post" 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content*</Label>
        <Textarea 
          id="content" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Share your story, question, or thoughts..." 
          rows={5}
          required
        />
      </div>
      
      <PostTypeSelector type={type} setType={setType} />
      
      <TagsInput tags={tags} setTags={setTags} />
    </div>
  );
};

export default PostForm;
