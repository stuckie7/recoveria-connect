
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddictionSelectionStepProps {
  addiction: string;
  setAddiction: (addiction: string) => void;
  handleContinue: () => void;
}

const AddictionSelectionStep: React.FC<AddictionSelectionStepProps> = ({
  addiction,
  setAddiction,
  handleContinue
}) => {
  return (
    <div className="glass-card p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-center">What are you recovering from?</h2>
      <p className="text-center mb-8">
        This helps us personalize your experience. All information is kept private and only stored on your device.
      </p>
      
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          I'm recovering from:
        </label>
        <select 
          value={addiction}
          onChange={(e) => setAddiction(e.target.value)}
          className="neo-input w-full"
        >
          <option value="">Select an option</option>
          <option value="alcohol">Alcohol</option>
          <option value="drugs">Drugs</option>
          <option value="smoking">Smoking/Nicotine</option>
          <option value="gambling">Gambling</option>
          <option value="other">Other</option>
        </select>
        
        {addiction === 'other' && (
          <input
            type="text"
            placeholder="Please specify"
            className="neo-input w-full mt-3"
          />
        )}
      </div>
      
      <button
        onClick={handleContinue}
        className={cn(
          "w-full py-3 rounded-xl font-medium flex items-center justify-center shadow-lg transition-all",
          addiction 
            ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            : "bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
        )}
      >
        Start Your Journey
        <ArrowRight size={18} className="ml-2" />
      </button>
    </div>
  );
};

export default AddictionSelectionStep;
