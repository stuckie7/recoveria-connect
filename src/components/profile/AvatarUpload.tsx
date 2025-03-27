
import React, { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Upload, Camera, Loader2, Move, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Fetch current avatar when component mounts
  React.useEffect(() => {
    if (user) {
      fetchAvatar(user);
    }
  }, [user]);

  // Cleanup preview URL when dialog closes
  React.useEffect(() => {
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
      
      // Reset position and zoom
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      
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
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !previewRef.current) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limit movement based on container size and zoom
    const containerSize = previewRef.current.offsetWidth;
    const imgSize = containerSize * zoom;
    const maxOffset = (imgSize - containerSize) / 2;
    
    const boundedX = Math.max(Math.min(newX, maxOffset), -maxOffset);
    const boundedY = Math.max(Math.min(newY, maxOffset), -maxOffset);
    
    setPosition({ x: boundedX, y: boundedY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 1));
  };
  
  const uploadAvatar = async () => {
    if (!selectedFile || !user || !previewUrl || !previewRef.current) return;
    
    try {
      setUploading(true);
      
      // Create a canvas to crop the image
      const canvas = document.createElement('canvas');
      const containerSize = previewRef.current.offsetWidth;
      canvas.width = containerSize;
      canvas.height = containerSize;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      // Create an image element for drawing
      const img = new Image();
      img.src = previewUrl;
      
      // Wait for image to load before processing
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      // Calculate dimensions for cropping
      const imgSize = containerSize * zoom;
      const offsetX = (containerSize - imgSize) / 2 + position.x;
      const offsetY = (containerSize - imgSize) / 2 + position.y;
      
      // Draw the image with position and zoom
      ctx.clearRect(0, 0, containerSize, containerSize);
      ctx.drawImage(img, offsetX, offsetY, imgSize, imgSize);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.9
        );
      });
      
      // Create file from blob
      const croppedFile = new File(
        [blob],
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
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
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
          onChange={handleFileSelect}
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

      <Dialog open={showCropDialog} onOpenChange={(open) => {
        if (!open && !uploading) {
          setShowCropDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Position Your Photo</DialogTitle>
            <DialogDescription>
              Drag to position and use controls to zoom your image
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <div 
              ref={previewRef}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-primary/20 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                if (e.touches.length === 1) {
                  const touch = e.touches[0];
                  setIsDragging(true);
                  setDragStart({
                    x: touch.clientX - position.x,
                    y: touch.clientY - position.y
                  });
                }
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (!isDragging || !previewRef.current || e.touches.length !== 1) return;
                const touch = e.touches[0];
                
                const newX = touch.clientX - dragStart.x;
                const newY = touch.clientY - dragStart.y;
                
                const containerSize = previewRef.current.offsetWidth;
                const imgSize = containerSize * zoom;
                const maxOffset = (imgSize - containerSize) / 2;
                
                const boundedX = Math.max(Math.min(newX, maxOffset), -maxOffset);
                const boundedY = Math.max(Math.min(newY, maxOffset), -maxOffset);
                
                setPosition({ x: boundedX, y: boundedY });
              }}
              onTouchEnd={() => setIsDragging(false)}
            >
              {previewUrl && (
                <div 
                  className="absolute"
                  style={{
                    width: `${zoom * 100}%`,
                    height: `${zoom * 100}%`,
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
                  }}
                >
                  <img 
                    ref={imgRef}
                    src={previewUrl} 
                    className="w-full h-full object-cover"
                    draggable="false"
                    alt="Preview" 
                  />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Move size={40} className="text-white/50" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
              >
                <ZoomOut size={18} />
              </Button>
              
              <div className="w-32 h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${((zoom - 1) / 2) * 100}%` }}
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn size={18} />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Drag to reposition or use zoom controls to adjust the fit
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!uploading) {
                  setShowCropDialog(false);
                }
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={uploadAvatar}
              className="gap-1"
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Check size={16} />
              )}
              {uploading ? 'Uploading...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvatarUpload;
