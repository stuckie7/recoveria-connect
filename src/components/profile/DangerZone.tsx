
import React from 'react';

interface DangerZoneProps {
  onResetApp: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ onResetApp }) => {
  return (
    <div className="neo-card border border-destructive/20 mb-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-destructive">
          Danger Zone
        </h3>
        
        <button 
          onClick={onResetApp}
          className="w-full p-3 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
        >
          Reset All App Data
        </button>
      </div>
    </div>
  );
};

export default DangerZone;
