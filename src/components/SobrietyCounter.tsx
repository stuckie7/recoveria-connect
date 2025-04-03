
import React from 'react';
import { Clock, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSobrietyCounter } from '@/hooks/useSobrietyCounter';
import CounterDigits from './sobriety/CounterDigits';
import NextMilestone from './sobriety/NextMilestone';

const SobrietyCounter: React.FC = () => {
  const { 
    days, 
    hours, 
    minutes, 
    startDate, 
    nextMilestone, 
    animateDigits, 
    setAnimateDigits 
  } = useSobrietyCounter();

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
              <CounterDigits 
                value={days} 
                label="Days Sober" 
                icon={<Award size={18} className="mr-2 text-recovery-purple-dark" />}
                padLength={days >= 100 ? 3 : days >= 10 ? 2 : 1}
                animateDigits={animateDigits}
              />
            </div>
            
            {/* Hours and minutes */}
            <div className="grid grid-cols-2 gap-8 w-full mb-6">
              <CounterDigits 
                value={hours} 
                label="Hours" 
                icon={<Clock size={16} className="mr-1 text-recovery-blue-dark" />}
                animateDigits={animateDigits}
              />
              
              <CounterDigits 
                value={minutes} 
                label="Minutes" 
                icon={<Clock size={16} className="mr-1 text-recovery-blue-dark" />}
                animateDigits={animateDigits}
              />
            </div>
          </div>
        
          {/* Next milestone */}
          <NextMilestone milestone={nextMilestone} />
          
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
