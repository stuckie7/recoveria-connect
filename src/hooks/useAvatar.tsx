
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAvatar = (user: User | null, onAvatarUpdate?: (url: string) => void) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Fetch current avatar when component mounts
  useEffect(() => {
    if (user) {
      fetchAvatar(user);
    }
  }, [user]);

  // Cleanup preview URL when dialog closes
  useEffect(() => {
    if (!showCropDialog && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [showCropDialog, previewUrl]);
  
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
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
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
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
      
      // Open crop dialog
      setShowCropDialog(true);
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error('Failed to process image');
    } finally {
      // Reset the input
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };
  
  const uploadAvatar = async (croppedBlob: Blob) => {
    if (!user || !selectedFile) {
      throw new Error('Missing user or file data');
    }
    
    try {
      setUploading(true);
      
      // Create file from blob
      const croppedFile = new File(
        [croppedBlob],
        `cropped-${selectedFile.name.split('.')[0]}.jpg`,
        { type: 'image/jpeg' }
      );
      
      // Upload to Supabase Storage
      const fileExt = 'jpg';
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedFile, {
          upsert: true,
          contentType: 'image/jpeg'
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      const newAvatarUrl = urlData.publicUrl;
      console.log('Image URL being set:', newAvatarUrl);
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setAvatarUrl(newAvatarUrl);
      
      // Call callback if provided
      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }
      
      toast.success('Avatar updated', {
        description: 'Your profile picture has been updated successfully'
      });
      
      // Close dialog
      setShowCropDialog(false);
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Upload failed', {
        description: error.message || 'Something went wrong'
      });
      throw error;
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return {
    avatarUrl,
    uploading,
    showCropDialog,
    previewUrl,
    setShowCropDialog,
    handleFileSelect,
    uploadAvatar
  };
};
