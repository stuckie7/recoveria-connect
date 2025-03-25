
import React from 'react';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  return (
    <div className="container max-w-md mx-auto px-4 mb-8">
      <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="mt-2 text-sm text-right text-muted-foreground">
        Step {step} of {totalSteps}
      </div>
    </div>
  );
};

export default ProgressBar;
