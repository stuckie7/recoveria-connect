
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getUserProgress, setSobrietyStartDate } from '@/utils/storage';

export function useSobrietyDate() {
  const [progress, setProgress] = useState(getUserProgress());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(progress.startDate));
  
  // Update progress when it changes
  useEffect(() => {
    const updatedProgress = getUserProgress();
    setProgress(updatedProgress);
  }, []);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setSelectedDate(date);
  };
  
  const handleSaveDate = () => {
    if (selectedDate > new Date()) {
      toast.error('Start date cannot be in the future');
      return;
    }
    
    setSobrietyStartDate(selectedDate);
    setProgress(getUserProgress());
    setIsDatePickerOpen(false);
    
    toast.success('Sobriety date updated', {
      description: `Your journey now starts from ${selectedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`
    });
  };

  return {
    progress,
    isDatePickerOpen,
    setIsDatePickerOpen,
    selectedDate,
    setSelectedDate,
    handleDateChange,
    handleSaveDate
  };
}
