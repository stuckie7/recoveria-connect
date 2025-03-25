
import React from 'react';

interface DatePickerProps {
  isOpen: boolean;
  selectedDate: Date;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveDate: () => void;
  setIsOpen: (open: boolean) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  selectedDate,
  handleDateChange,
  handleSaveDate,
  setIsOpen
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="mt-4 p-4 bg-muted rounded-xl animate-fade-in">
      <label className="text-sm font-medium block mb-2">
        Select sobriety start date:
      </label>
      <input 
        type="date" 
        className="neo-input w-full mb-3"
        value={selectedDate.toISOString().split('T')[0]}
        onChange={handleDateChange}
        max={new Date().toISOString().split('T')[0]}
      />
      <div className="flex justify-end space-x-2">
        <button 
          onClick={() => setIsOpen(false)}
          className="px-3 py-1.5 text-sm rounded-lg bg-muted-foreground/10"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveDate}
          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default DatePicker;
