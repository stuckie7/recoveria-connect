
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PostForm from './PostForm';
import { PostType } from './PostTypeSelector';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: PostType;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'story'
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>(defaultType);
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update type when defaultType changes
  useEffect(() => {
    if (defaultType) {
      setType(defaultType);
    }
  }, [defaultType]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType(defaultType);
    setTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('You must be logged in to create a post');
      }

      const { error } = await supabase.from('community_posts').insert({
        title,
        content,
        type,
        tags,
        user_id: userData.user.id,
        likes: 0,
        comments: 0
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: type === "question" 
          ? "Your question has been published to the community."
          : type === "achievement"
          ? "Your achievement has been shared with the community."
          : "Your story has been published.",
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'question' 
              ? 'Ask a Question' 
              : type === 'achievement'
              ? 'Share an Achievement'
              : 'Share Your Story'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <PostForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            type={type}
            setType={setType}
            tags={tags}
            setTags={setTags}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? 'Publishing...' 
                : (type === 'question' 
                  ? 'Ask Question' 
                  : type === 'achievement' 
                  ? 'Share Achievement' 
                  : 'Publish Story')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
