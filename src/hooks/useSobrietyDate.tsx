
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getUserProgress, setSobrietyStartDate, updateStreak } from '@/utils/storage';
import { UserProgress } from '@/types';
import { daysBetween } from '@/utils/dates';

export function useSobrietyDate() {
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(progress.startDate));
  
  // Update progress when it changes and calculate current streak
  useEffect(() => {
    // Get the latest progress
    const updatedProgress = getUserProgress();
    
    // Calculate the current streak based on days between start date and today
    const startDate = new Date(updatedProgress.startDate);
    const currentStreak = daysBetween(startDate);
    
    // Update the current streak and total sober days in the progress object
    if (updatedProgress.currentStreak !== currentStreak || updatedProgress.totalDaysSober !== currentStreak) {
      updatedProgress.currentStreak = currentStreak;
      updatedProgress.totalDaysSober = currentStreak; // Total sober days should be equal to current streak
      
      // Update longest streak if needed
      if (currentStreak > updatedProgress.longestStreak) {
        updatedProgress.longestStreak = currentStreak;
      }
      
      // Save the updated progress
      localStorage.setItem('recovery-app-progress', JSON.stringify(updatedProgress));
    }
    
    setProgress(updatedProgress);
    
    // Run updateStreak to check for and award any new milestones
    updateStreak();
  }, []);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Create a new date object without timezone conversion issues
    const dateValue = event.target.value;
    const [year, month, day] = dateValue.split('-').map(Number);
    // Note: month is 0-indexed in JavaScript Date
    const date = new Date(year, month - 1, day);
    setSelectedDate(date);
  };
  
  const handleSaveDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (selectedDate > now) {
      toast.error('Start date cannot be in the future');
      return;
    }
    
    // Ensure we're using a date with the time component zeroed out
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(0, 0, 0, 0);
    
    setSobrietyStartDate(normalizedDate);
    
    // Update the local progress state with the newly saved data
    const updatedProgress = getUserProgress();
    
    // Calculate and update the current streak and total sober days
    const currentStreak = daysBetween(normalizedDate);
    updatedProgress.currentStreak = currentStreak;
    updatedProgress.totalDaysSober = currentStreak; // Total sober days equals current streak
    
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
  };

  return {
    progress,
    setProgress,
    isDatePickerOpen,
    setIsDatePickerOpen,
    selectedDate,
    setSelectedDate,
    handleDateChange,
    handleSaveDate
  };
}
