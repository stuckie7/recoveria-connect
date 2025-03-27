
import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { getUserProgress, updateStreak } from '@/utils/storage';
import { daysBetween, getNextMilestoneDate, getMilestoneDescription, MILESTONE_DAYS } from '@/utils/dates';
import { cn } from '@/lib/utils';

const SobrietyCounter: React.FC = () => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [nextMilestone, setNextMilestone] = useState<{ days: number; date: Date; } | null>(null);
  
  useEffect(() => {
    // Get user progress from local storage and ensure streak is updated
    updateStreak();
    const progress = getUserProgress();
    const start = new Date(progress.startDate);
    setStartDate(start);
    
    // Calculate initial values
    updateCounters(start);
    
    // Update counters every minute
    const interval = setInterval(() => {
      updateCounters(start);
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const updateCounters = (start: Date) => {
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
        <h2 className="text-xl font-medium text-muted-foreground">You've been sober for</h2>
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
