
import { useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseCropperResult {
  position: Position;
  zoom: number;
  isDragging: boolean;
  dragStart: Position;
  setPosition: (position: Position) => void;
  setZoom: (zoom: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setDragStart: (position: Position) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  processCroppedImage: (imageUrl: string, containerSize: number) => Promise<Blob>;
}

export const useImageCropper = (): UseCropperResult => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 1));
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limit movement based on container size and zoom
    const containerSize = 300; // Approximate size
    const imgSize = containerSize * zoom;
    const maxOffset = (imgSize - containerSize) / 2;
    
    const boundedX = Math.max(Math.min(newX, maxOffset), -maxOffset);
    const boundedY = Math.max(Math.min(newY, maxOffset), -maxOffset);
    
    setPosition({ x: boundedX, y: boundedY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
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
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    // Approximate container size
    const containerSize = 300;
    const imgSize = containerSize * zoom;
    const maxOffset = (imgSize - containerSize) / 2;
    
    const boundedX = Math.max(Math.min(newX, maxOffset), -maxOffset);
    const boundedY = Math.max(Math.min(newY, maxOffset), -maxOffset);
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const processCroppedImage = async (imageUrl: string, containerSize: number): Promise<Blob> => {
    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
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
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/jpeg',
        0.9
      );
    });
  };

  return {
    position,
    zoom,
    isDragging,
    dragStart,
    setPosition,
    setZoom,
    setIsDragging,
    setDragStart,
    handleZoomIn,
    handleZoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    processCroppedImage
  };
};
