
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  isOpen: boolean;
  selectedDate: Date;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveDate: () => void;
  setIsOpen: (open: boolean) => void;
  isLoading?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  selectedDate,
  handleDateChange,
  handleSaveDate,
  setIsOpen,
  isLoading = false
}) => {
  if (!isOpen) return null;
  
  // Format date for input element (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    // Month is 0-indexed in JS Date, so add 1 and pad with zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Get today's date with time set to midnight for accurate comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return (
    <div className="mt-4 p-4 bg-muted rounded-xl animate-fade-in">
      <h3 className="text-base font-medium mb-1">Update Sobriety Start Date</h3>
      <p className="text-sm text-muted-foreground mb-3">
        This will recalculate your current and longest streaks.
      </p>
      
      <label className="text-sm font-medium block mb-2">
        Select sobriety start date:
      </label>
      <input 
        type="date" 
        className="neo-input w-full mb-3"
        value={formatDateForInput(selectedDate)}
        onChange={handleDateChange}
        max={formatDateForInput(today)}
        disabled={isLoading}
        aria-label="Sobriety start date"
      />
      <div className="flex justify-end space-x-2">
        <button 
          onClick={() => setIsOpen(false)}
          className="px-3 py-1.5 text-sm rounded-lg bg-muted-foreground/10"
          disabled={isLoading}
          type="button"
          aria-label="Cancel date selection"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveDate}
          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white flex items-center justify-center min-w-[60px]"
          disabled={isLoading}
          type="button"
          aria-label="Save sobriety date"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
};

export default DatePicker;
