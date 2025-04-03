
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DateSelectionStepProps {
  startDate: Date;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContinue: () => void;
  loading?: boolean;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  startDate,
  handleDateChange,
  handleContinue,
  loading = false
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
          disabled={loading}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          This is the first day you became sober.
        </p>
      </div>
      
      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="mr-2">Processing</span>
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          </>
        ) : (
          <>
            Continue
            <ArrowRight size={18} className="ml-2" />
          </>
        )}
      </button>
    </div>
  );
};

export default DateSelectionStep;
