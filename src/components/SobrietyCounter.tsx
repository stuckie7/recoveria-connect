
// Modern redesigned Sobriety Counter component
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Award, TrendingUp } from 'lucide-react';
import { getUserProgress, updateStreak, verifyStreakIntegrity, setSobrietyStartDate } from '@/utils/storage';
import { daysBetween, getNextMilestoneDate, getMilestoneDescription, MILESTONE_DAYS } from '@/utils/dates';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SobrietyCounter: React.FC = () => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [nextMilestone, setNextMilestone] = useState<{ days: number; date: Date; } | null>(null);
  const [animateDigits, setAnimateDigits] = useState(false);
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

  // Format a digit with leading zero if needed
  const formatDigit = (value: number, padLength: number = 2) => {
    return value.toString().padStart(padLength, '0');
  };
  
  // Create digit elements for the counter
  const createDigits = (value: number, padLength: number = 2) => {
    const digits = formatDigit(value, padLength).split('');
    
    return (
      <div className="flex items-center justify-center">
        {digits.map((digit, index) => (
          <div 
            key={`digit-${index}`}
            className={cn(
              "relative w-14 h-20 mx-0.5 rounded-lg overflow-hidden",
              "bg-gradient-to-br from-recovery-blue-dark to-recovery-purple-dark",
              "shadow-lg border border-white/10 backdrop-blur-sm",
              animateDigits ? "animate-scale-in" : "opacity-0"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
              {digit}
            </span>
            <span className="absolute inset-0 bg-white/5 flex items-center justify-center"></span>
          </div>
        ))}
      </div>
    );
  };

  const handleCelebrateClick = () => {
    setAnimateDigits(false);
    
    // Reset the animation after a small delay
    setTimeout(() => {
      setAnimateDigits(true);
    }, 50);
    
    toast.success("Congratulations on your progress!", {
      description: `You've been sober for ${days} days. Keep going!`
    });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-recovery-neutral-lightest to-recovery-blue-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-recovery-blue-dark to-recovery-purple-dark">
          Your Sobriety Journey
        </CardTitle>
        <CardDescription className="text-center text-lg">
          Since {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-xl bg-white/50 backdrop-blur-sm p-6 border border-white/20 shadow-inner">
          <div className="flex flex-col items-center">
            {/* Days counter */}
            <div className="mb-6 text-center">
              <div className="text-lg text-gray-600 mb-2 font-medium flex items-center justify-center">
                <Award size={18} className="mr-2 text-recovery-purple-dark" />
                <span>Days Sober</span>
              </div>
              {createDigits(days, days >= 100 ? 3 : days >= 10 ? 2 : 1)}
            </div>
            
            {/* Hours and minutes */}
            <div className="grid grid-cols-2 gap-8 w-full mb-6">
              <div className="text-center">
                <div className="text-md text-gray-600 mb-2 font-medium flex items-center justify-center">
                  <Clock size={16} className="mr-1 text-recovery-blue-dark" />
                  <span>Hours</span>
                </div>
                {createDigits(hours)}
              </div>
              
              <div className="text-center">
                <div className="text-md text-gray-600 mb-2 font-medium flex items-center justify-center">
                  <Clock size={16} className="mr-1 text-recovery-blue-dark" />
                  <span>Minutes</span>
                </div>
                {createDigits(minutes)}
              </div>
            </div>
          </div>
        
          {/* Next milestone */}
          {nextMilestone && (
            <div className="mt-6 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-recovery-purple-light to-recovery-blue-light p-4 text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp size={16} className="mr-2 text-recovery-purple-dark" />
                  <h3 className="text-sm font-medium text-recovery-purple-dark">Next Milestone</h3>
                </div>
                <p className="text-xl font-bold text-recovery-purple-dark">{getMilestoneDescription(nextMilestone.days)}</p>
                <div className="flex items-center justify-center mt-2 text-sm text-recovery-blue-dark">
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
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button 
              className="bg-gradient-to-r from-recovery-blue-dark to-recovery-purple-dark hover:opacity-90 transition-all"
              onClick={handleCelebrateClick}
            >
              Celebrate Progress
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SobrietyCounter;
