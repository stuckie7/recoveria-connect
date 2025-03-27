
import React, { useRef } from 'react';
import { Move } from 'lucide-react';

interface CropPreviewProps {
  imageUrl: string;
  zoom: number;
  position: { x: number; y: number };
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
}

const CropPreview: React.FC<CropPreviewProps> = ({
  imageUrl,
  zoom,
  position,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  return (
    <div 
      ref={previewRef}
      className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-primary/20 cursor-move"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
  );
};

export default CropPreview;
