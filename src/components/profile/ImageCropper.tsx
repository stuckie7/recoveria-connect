
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import ZoomControls from './ZoomControls';
import CropPreview from './CropPreview';
import { useImageCropper } from '@/hooks/useImageCropper';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImage: Blob) => Promise<void>;
}

// Dialog body component to contain the cropping UI
const CropperDialogBody = ({ 
  imageUrl, 
  containerRef 
}: { 
  imageUrl: string;
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const {
    position,
    zoom,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  } = useImageCropper();

  return (
    <div className="flex flex-col items-center gap-4 py-4" ref={containerRef}>
      <CropPreview 
        imageUrl={imageUrl}
        zoom={zoom}
        position={position}
        isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      />
      
      <ZoomControls 
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      <p className="text-sm text-muted-foreground text-center">
        Drag to reposition or use zoom controls to adjust the fit
      </p>
    </div>
  );
};

// Dialog footer with action buttons
const CropperDialogFooter = ({
  onClose,
  onComplete,
  uploading
}: {
  onClose: () => void;
  onComplete: () => Promise<void>;
  uploading: boolean;
}) => {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        disabled={uploading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onComplete}
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
  );
};

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete
}) => {
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { processCroppedImage } = useImageCropper();

  const handleCropComplete = async () => {
    if (!imageUrl) return;
    
    try {
      setUploading(true);
      
      const containerSize = containerRef.current?.offsetWidth || 300;
      const croppedBlob = await processCroppedImage(imageUrl, containerSize);
      
      // Send the cropped image back
      await onCropComplete(croppedBlob);
      
    } catch (error: any) {
      console.error('Error processing cropped image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !uploading) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Position Your Photo</DialogTitle>
          <DialogDescription>
            Drag to position and use controls to zoom your image
          </DialogDescription>
        </DialogHeader>
        
        <CropperDialogBody 
          imageUrl={imageUrl} 
          containerRef={containerRef} 
        />
        
        <CropperDialogFooter 
          onClose={onClose}
          onComplete={handleCropComplete}
          uploading={uploading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
