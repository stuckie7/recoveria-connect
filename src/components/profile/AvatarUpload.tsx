
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvatar } from '@/hooks/useAvatar';
import ImageCropper from './ImageCropper';

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
  const {
    avatarUrl,
    uploading,
    showCropDialog,
    previewUrl,
    setShowCropDialog,
    handleFileSelect,
    uploadAvatar
  } = useAvatar(user, onAvatarUpdate);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const triggerFileInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
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
          onClick={triggerFileInput}
        >
          <Camera size={20} className="text-white" />
        </label>
        
        <input
          ref={inputRef}
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
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="text-xs mt-2"
        disabled={uploading}
        onClick={triggerFileInput}
      >
        <Upload size={14} className="mr-1" />
        {avatarUrl ? 'Change Picture' : 'Upload Picture'}
      </Button>

      {showCropDialog && previewUrl && (
        <ImageCropper
          isOpen={showCropDialog}
          onClose={() => setShowCropDialog(false)}
          imageUrl={previewUrl}
          onCropComplete={uploadAvatar}
        />
      )}
    </div>
  );
};

export default AvatarUpload;
