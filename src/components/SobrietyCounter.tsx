// Solution for sober date integration
// This modified version of SobrietyCounter.tsx integrates with the user's profile data
// to ensure the counter uses the sobriety date from onboarding

import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { getUserProgress, updateStreak, verifyStreakIntegrity, setSobrietyStartDate } from '@/utils/storage';
import { daysBetween, getNextMilestoneDate, getMilestoneDescription, MILESTONE_DAYS } from '@/utils/dates';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SobrietyCounter: React.FC = () => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [nextMilestone, setNextMilestone] = useState<{ days: number; date: Date; } | null>(null);
  const { user } = useAuth();
  
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
      } else {
        setStartDate(start);
      }
      
      // Calculate initial values
      updateCounters(start);
    };
    
    fetchSobrietyDate();
    
    // Update counters every minute
    const interval = setInterval(() => {
      updateCounters(startDate);
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [user]); // Re-run when user changes
  
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
  
  // Create digit spans for animation
  const createDigitSpans = (value: number, padLength: number = 2) => {
    const paddedValue = value.toString().padStart(padLength, '0');
    return paddedValue.split('').map((digit, index) => (
      <span 
        key={`digit-${index}-${value}`}
        className={cn(
          "inline-block w-12 h-16 md:w-16 md:h-20 rounded-lg shadow-neo flex items-center justify-center mx-0.5 overflow-hidden relative",
          "bg-gradient-to-r from-recovery-blue-light to-recovery-green-light"
        )}
      >
        <span className="text-2xl md:text-4xl font-semibold animate-scale-in">
          {digit}
        </span>
      </span>
    ));
  };
  
  return (
    <div className="w-full neo-card overflow-hidden animate-fade-in">
      <div className="text-center mb-4">
        <h2 className="text-xl font-medium text-muted-foreground">Since your sobriety date</h2>
        <h3 className="text-lg font-medium text-muted-foreground">You've been sober for</h3>
      </div>
      
      <div className="flex flex-col items-center">
        {/* Days counter */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            {createDigitSpans(days, days >= 100 ? 3 : days >= 10 ? 2 : 1)}
          </div>
          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Days
          </span>
        </div>
        
        {/* Hours and minutes */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
          <div className="text-center">
            <div className="flex justify-center">
              {createDigitSpans(hours)}
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center mt-1">
              <Clock size={14} className="mr-1" />
              Hours
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center">
              {createDigitSpans(minutes)}
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center mt-1">
              <Clock size={14} className="mr-1" />
              Minutes
            </span>
          </div>
        </div>
      </div>
      
      {/* Next milestone */}
      {nextMilestone && (
        <div className={cn(
          "rounded-xl p-4 text-center mt-4",
          "bg-gradient-to-r from-recovery-blue-light to-recovery-green-light"
        )}>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Next milestone</h3>
          <p className="text-xl font-semibold">{getMilestoneDescription(nextMilestone.days)}</p>
          <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
            <Calendar size={14} className="mr-1" />
            <span>
              {nextMilestone.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: nextMilestone.date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SobrietyCounter;
