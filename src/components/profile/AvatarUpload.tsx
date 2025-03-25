
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  onAvatarUpdate?: (url: string) => void;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  size = 'md',
  onAvatarUpdate
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Fetch current avatar when component mounts
  React.useEffect(() => {
    if (user) {
      fetchAvatar(user);
    }
  }, [user]);
  
  const fetchAvatar = async (user: User) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Please select an image under 2MB'
        });
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please select a JPG, PNG, or GIF image'
        });
        return;
      }
      
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user!.id);
        
      if (updateError) {
        throw updateError;
      }
      
      setAvatarUrl(avatarUrl);
      
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }
      
      toast.success('Avatar updated', {
        description: 'Your profile picture has been updated successfully'
      });
      
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.message || 'Something went wrong'
      });
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
      // Reset the input
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <Avatar className={`${sizeMap[size]} bg-gradient-to-br from-primary to-secondary group-hover:opacity-90 transition-opacity`}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="User avatar" />
          ) : (
            <AvatarFallback className="text-white text-2xl">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <label 
          htmlFor="avatar-upload" 
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Camera size={20} className="text-white" />
        </label>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </div>
      
      {uploading && (
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <Loader2 size={14} className="mr-1 animate-spin" />
          Uploading...
        </div>
      )}
      
      <label htmlFor="avatar-upload" className="mt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="text-xs"
          disabled={uploading}
        >
          <Upload size={14} className="mr-1" />
          {avatarUrl ? 'Change Picture' : 'Upload Picture'}
        </Button>
      </label>
    </div>
  );
};

export default AvatarUpload;
