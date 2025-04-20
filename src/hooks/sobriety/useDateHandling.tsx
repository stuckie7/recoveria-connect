
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getUserProgress, setSobrietyStartDate } from '@/utils/storage';
import { daysBetween } from '@/utils/dates';
import { UserProgress } from '@/types';

export const useDateHandling = (
  setProgress: (progress: UserProgress) => void,
  setIsDatePickerOpen: (open: boolean) => void,
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void
) => {
  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const dateValue = event.target.value;
      const [year, month, day] = dateValue.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      console.log('Date selected:', date.toISOString());
      return date;
    } catch (error) {
      console.error('Error handling date change:', error);
      toast.error('Invalid date format');
      return new Date();
    }
  }, []);

  const handleSaveDate = useCallback(async (selectedDate: Date) => {
    try {
      setIsLoading(true);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (selectedDate > now) {
        toast.error('Start date cannot be in the future');
        setIsLoading(false);
        return;
      }
      
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      
      console.log('Saving sobriety date locally:', normalizedDate.toISOString());
      
      setSobrietyStartDate(normalizedDate);
      
      // Update the local progress state with the newly saved data
      const updatedProgress = getUserProgress();
      
      // Calculate and update the current streak and total sober days
      const currentStreak = daysBetween(normalizedDate);
      updatedProgress.currentStreak = currentStreak;
      updatedProgress.totalDaysSober = currentStreak;
      
      // Update longest streak if needed
      if (currentStreak > updatedProgress.longestStreak) {
        updatedProgress.longestStreak = currentStreak;
      }
      
      setProgress(updatedProgress);
      setIsDatePickerOpen(false);
      
      toast.success('Sobriety date updated', {
        description: `Your journey now starts from ${normalizedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`
      });
      
    } catch (error) {
      console.error('Error saving sobriety date:', error);
      toast.error('Could not update sobriety date');
    } finally {
      setIsLoading(false);
    }
  }, [setProgress, setIsDatePickerOpen, setIsLoading]);

  return {
    handleDateChange,
    handleSaveDate
  };
};

