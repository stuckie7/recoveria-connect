
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getUserProgress, updateStreak, verifyStreakIntegrity, setSobrietyStartDate } from '@/utils/storage';
import { daysBetween, getNextMilestoneDate, MILESTONE_DAYS } from '@/utils/dates';

export interface SobrietyCounterState {
  days: number;
  hours: number;
  minutes: number;
  startDate: Date;
  nextMilestone: { days: number; date: Date; } | null;
  animateDigits: boolean;
  setAnimateDigits: (value: boolean) => void;
}

export function useSobrietyCounter(): SobrietyCounterState {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [nextMilestone, setNextMilestone] = useState<{ days: number; date: Date; } | null>(null);
  const [animateDigits, setAnimateDigits] = useState(false);
  const { user } = useAuth();
  
  const updateCounters = (start: Date) => {
    // Skip update if date is invalid
    if (isNaN(start.getTime())) {
      console.error('Invalid date in updateCounters');
      return;
    }
    
    const now = new Date();
    
    // Make a copy of the start date to ensure we don't modify the original
    const startCopy = new Date(start);
    
    // Calculate days - make sure we're using our corrected daysBetween function
    const totalDays = daysBetween(startCopy, now);
    setDays(totalDays);
    
    // Calculate hours and minutes
    const totalMilliseconds = now.getTime() - startCopy.getTime();
    const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const hoursToday = totalHours % 24;
    setHours(hoursToday);
    
    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const minutesThisHour = totalMinutes % 60;
    setMinutes(minutesThisHour);
    
    // Find the next milestone
    const nextMilestoneDay = MILESTONE_DAYS.find(days => days > totalDays) || (totalDays + 30);
    
    // Calculate the date for this milestone
    const nextMilestoneObj = {
      days: nextMilestoneDay,
      date: getNextMilestoneDate(startCopy, totalDays)
    };
    
    setNextMilestone(nextMilestoneObj);
  };

  useEffect(() => {
    const fetchSobrietyDate = async () => {
      // First check if user is authenticated
      if (user) {
        try {
          // Fetch sobriety date from user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('sobriety_start_date')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching sobriety date from profile:', error);
          } else if (data && data.sobriety_start_date) {
            console.log('Using sobriety date from profile:', data.sobriety_start_date);
            
            // Update local storage to match profile data
            const profileDate = new Date(data.sobriety_start_date);
            if (!isNaN(profileDate.getTime())) {
              // Update local storage with the date from profile
              setSobrietyStartDate(profileDate);
              setStartDate(profileDate);
              updateCounters(profileDate);
              return;
            }
          }
        } catch (err) {
          console.error('Error in fetchSobrietyDate:', err);
        }
      }
      
      // Fallback to local storage if no user or error fetching profile
      verifyStreakIntegrity();
      updateStreak();
      
      const progress = getUserProgress();
      const start = new Date(progress.startDate);
      
      // Verify the date is valid
      if (isNaN(start.getTime())) {
        console.error('Invalid start date in SobrietyCounter');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setStartDate(today);
        updateCounters(today);
      } else {
        setStartDate(start);
        updateCounters(start);
      }
    };
    
    fetchSobrietyDate();
    
    // Trigger digit animation on load
    setTimeout(() => setAnimateDigits(true), 100);
    
    // Update counters every minute
    const interval = setInterval(() => {
      if (startDate) {
        updateCounters(startDate);
      }
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [user]); // Re-run when user changes

  return {
    days,
    hours,
    minutes,
    startDate,
    nextMilestone,
    animateDigits,
    setAnimateDigits
  };
}
