
import { useState } from 'react';
import { getUserProgress } from '@/utils/storage';
import { useDateHandling } from './useDateHandling';
import { useSupabaseSync } from './useSupabaseSync';
import { UserProgress } from '@/types';

export function useSobrietyDate() {
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    try {
      const date = new Date(progress.startDate);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch {
      return new Date();
    }
  });

  // Use the extracted hooks
  const { handleDateChange, handleSaveDate } = useDateHandling(
    setProgress,
    setIsDatePickerOpen,
    isLoading,
    setIsLoading
  );

  // Use Supabase sync hook
  useSupabaseSync(progress, selectedDate);

  return {
    progress,
    setProgress,
    isDatePickerOpen,
    setIsDatePickerOpen,
    selectedDate,
    setSelectedDate,
    handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = handleDateChange(e);
      setSelectedDate(newDate);
    },
    handleSaveDate: () => handleSaveDate(selectedDate),
    isLoading
  };
}

