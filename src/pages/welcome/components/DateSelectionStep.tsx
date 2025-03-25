
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DateSelectionStepProps {
  startDate: Date;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContinue: () => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  startDate,
  handleDateChange,
  handleContinue
}) => {
  return (
    <div className="glass-card p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-center">When did you start your journey?</h2>
      <p className="text-center mb-8">
        Let us know when you began your sobriety so we can track your progress and celebrate milestones accurately.
      </p>
      
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Your sobriety start date:
        </label>
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]}
          className="neo-input w-full"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          This is the first day you became sober.
        </p>
      </div>
      
      <button
        onClick={handleContinue}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
      >
        Continue
        <ArrowRight size={18} className="ml-2" />
      </button>
    </div>
  );
};

export default DateSelectionStep;
