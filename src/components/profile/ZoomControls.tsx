
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onZoomOut}
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
        onClick={onZoomIn}
        disabled={zoom >= 3}
      >
        <ZoomIn size={18} />
      </Button>
    </div>
  );
};

export default ZoomControls;
