
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSobrietyStartDate } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WelcomeHeader from './components/WelcomeHeader';
import ProgressBar from './components/ProgressBar';
import WelcomeStep from './components/WelcomeStep';
import DateSelectionStep from './components/DateSelectionStep';
import AddictionSelectionStep from './components/AddictionSelectionStep';
import { useAuth } from '@/contexts/AuthContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [addiction, setAddiction] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const totalSteps = 3;
  
  // Check if the user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Check local storage first for guest users
      const onboardingCompleted = localStorage.getItem('onboarding-completed');
      if (onboardingCompleted === 'true') {
        navigate('/');
        return;
      }
      
      // For logged in users, check their profile
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data && data.onboarding_completed) {
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value));
  };
  
  const completeOnboarding = async () => {
    try {
      setLoading(true);
      
      // Save sobriety start date to local storage
      setSobrietyStartDate(startDate);
      
      // Save addiction type if provided
      if (addiction) {
        localStorage.setItem('addiction-type', addiction);
      }
      
      // Mark onboarding as completed
      localStorage.setItem('onboarding-completed', 'true');
      
      // If user is logged in, update their profile
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            addiction_type: addiction || null,
            sobriety_start_date: startDate.toISOString()
          })
          .eq('id', user.id);
      }
      
      // Redirect to dashboard
      navigate('/');
      
      // Show success message
      toast.success('Welcome to your recovery journey!');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('There was a problem saving your information');
    } finally {
      setLoading(false);
    }
  };
  
  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save data and redirect to dashboard
      completeOnboarding();
    }
  };
  
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <WelcomeHeader />
      
      <ProgressBar step={step} totalSteps={totalSteps} />
      
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {step === 1 && <WelcomeStep handleContinue={handleContinue} />}
          
          {step === 2 && (
            <DateSelectionStep
              startDate={startDate}
              handleDateChange={handleDateChange}
              handleContinue={handleContinue}
              loading={loading}
            />
          )}
          
          {step === 3 && (
            <AddictionSelectionStep
              addiction={addiction}
              setAddiction={setAddiction}
              handleContinue={handleContinue}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
