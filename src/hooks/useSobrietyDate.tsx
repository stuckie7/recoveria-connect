
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getUserProgress, setSobrietyStartDate, updateStreak } from '@/utils/storage';
import { UserProgress } from '@/types';
import { daysBetween } from '@/utils/dates';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useSobrietyDate() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(progress.startDate));
  const [isLoading, setIsLoading] = useState(false);
  
  // Update progress when it changes and calculate current streak
  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('Error in useSobrietyDate effect:', error);
      // Don't let errors in this hook break the app
    }
  }, []);
  
  // Sync with Supabase if user is logged in
  useEffect(() => {
    if (!user) return;
    
    const syncWithSupabase = async () => {
      try {
        // Fetch the user's profile to get sobriety date
        const { data, error } = await supabase
          .from('profiles')
          .select('sobriety_start_date')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching sobriety date from Supabase:', error);
          return;
        }
        
        // If user has a sobriety date in Supabase, use it
        if (data?.sobriety_start_date) {
          const supabaseDate = new Date(data.sobriety_start_date);
          
          // Compare with local date
          const localDate = new Date(progress.startDate);
          
          // If dates are different (and Supabase date is valid), use the Supabase date
          if (!isNaN(supabaseDate.getTime()) && 
              (isNaN(localDate.getTime()) || supabaseDate.toISOString() !== localDate.toISOString())) {
            console.log('Updating local sobriety date from Supabase:', supabaseDate);
            setSobrietyStartDate(supabaseDate);
            setSelectedDate(supabaseDate);
            setProgress(getUserProgress()); // Refresh progress with new date
          }
        }
      } catch (err) {
        console.error('Error syncing sobriety date with Supabase:', err);
      }
    };
    
    syncWithSupabase();
  }, [user]);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Create a new date object without timezone conversion issues
      const dateValue = event.target.value;
      const [year, month, day] = dateValue.split('-').map(Number);
      // Note: month is 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day);
      setSelectedDate(date);
    } catch (error) {
      console.error('Error handling date change:', error);
      toast.error('Invalid date format');
    }
  };
  
  const handleSaveDate = async () => {
    try {
      setIsLoading(true);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (selectedDate > now) {
        toast.error('Start date cannot be in the future');
        setIsLoading(false);
        return;
      }
      
      // Ensure we're using a date with the time component zeroed out
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      
      console.log('Saving sobriety date locally:', normalizedDate.toISOString());
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
      
      // If user is logged in, also update Supabase
      if (user) {
        console.log('Updating sobriety date in Supabase for user:', user.id);
        const { error } = await supabase
          .from('profiles')
          .update({ 
            sobriety_start_date: normalizedDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating sobriety date in Supabase:', error);
          toast.error('Could not sync your date to the cloud');
        }
      }
      
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
  };

  return {
    progress,
    setProgress,
    isDatePickerOpen,
    setIsDatePickerOpen,
    selectedDate,
    setSelectedDate,
    handleDateChange,
    handleSaveDate,
    isLoading
  };
}
