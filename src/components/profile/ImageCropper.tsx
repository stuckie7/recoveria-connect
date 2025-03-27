
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Move, ZoomIn, ZoomOut, Check } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImage: Blob) => Promise<void>;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete
}) => {
  const [uploading, setUploading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
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
  };

  const processCroppedImage = async () => {
    if (!previewRef.current || !imageUrl) return;
    
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
      img.src = imageUrl;
      
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
      
      // Send the cropped image back
      await onCropComplete(blob);
      
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
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div 
            ref={previewRef}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-primary/20 cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            {imageUrl && (
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
                  src={imageUrl} 
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
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={processCroppedImage}
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
  );
};

export default ImageCropper;
