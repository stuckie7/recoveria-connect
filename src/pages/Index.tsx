
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { setSobrietyStartDate } from '@/utils/storage';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [addiction, setAddiction] = useState<string>('');
  const totalSteps = 3;
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value));
  };
  
  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save data and redirect to dashboard
      setSobrietyStartDate(startDate);
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/80 shadow-lg backdrop-blur-sm flex items-center justify-center">
          <Sparkles size={40} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Recovery</h1>
        <p className="text-lg text-muted-foreground">Your journey to wellness begins here</p>
      </header>
      
      {/* Progress bar */}
      <div className="container max-w-md mx-auto px-4 mb-8">
        <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-right text-muted-foreground">
          Step {step} of {totalSteps}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="glass-card p-8 animate-scale-in">
              <h2 className="text-2xl font-bold mb-4 text-center">Welcome to Recovery</h2>
              <p className="text-center mb-8">
                Your personal companion for addiction recovery, providing tools, support, and tracking to help you on your journey.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check size={14} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Track Your Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your sobriety streak and celebrate each milestone along the way.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check size={14} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Daily Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Log your mood, identify triggers, and access coping strategies when you need them most.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check size={14} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Community Connection</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with others on similar journeys, share experiences, and gain insights.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
              >
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
          
          {/* Step 2: When did you start? */}
          {step === 2 && (
            <div className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 text-center">When did you start your journey?</h2>
              <p className="text-center mb-8">
                Let us know when you began your sobriety so we can track your progress and celebrate milestones accurately.
              </p>
              
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  Your sobriety start date:
                </label>
                <input
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="neo-input w-full"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  This is the first day you became sober.
                </p>
              </div>
              
              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
              >
                Continue
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
          
          {/* Step 3: What are you recovering from? */}
          {step === 3 && (
            <div className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 text-center">What are you recovering from?</h2>
              <p className="text-center mb-8">
                This helps us personalize your experience. All information is kept private and only stored on your device.
              </p>
              
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  I'm recovering from:
                </label>
                <select 
                  value={addiction}
                  onChange={(e) => setAddiction(e.target.value)}
                  className="neo-input w-full"
                >
                  <option value="">Select an option</option>
                  <option value="alcohol">Alcohol</option>
                  <option value="drugs">Drugs</option>
                  <option value="smoking">Smoking/Nicotine</option>
                  <option value="gambling">Gambling</option>
                  <option value="other">Other</option>
                </select>
                
                {addiction === 'other' && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    className="neo-input w-full mt-3"
                  />
                )}
              </div>
              
              <button
                onClick={handleContinue}
                className={cn(
                  "w-full py-3 rounded-xl font-medium flex items-center justify-center shadow-lg transition-all",
                  addiction 
                    ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
                )}
              >
                Start Your Journey
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
