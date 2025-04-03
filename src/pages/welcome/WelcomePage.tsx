
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
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 3;
  
  // Check if the user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
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
              .maybeSingle();
              
            if (error) {
              console.error('Error checking onboarding status:', error);
              return;
            }
            
            if (data && data.onboarding_completed) {
              navigate('/');
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
          }
        }
      } catch (err) {
        console.error('Error in checkOnboardingStatus:', err);
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setStartDate(new Date(e.target.value));
    } catch (err) {
      console.error('Error setting date:', err);
      toast.error('Invalid date format');
    }
  };
  
  const completeOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting onboarding completion process');
      
      // Normalize the date to avoid time zone issues
      const normalizedDate = new Date(startDate);
      normalizedDate.setHours(0, 0, 0, 0);
      
      console.log('Normalized sobriety date:', normalizedDate.toISOString());
      
      // Save sobriety start date to local storage
      try {
        setSobrietyStartDate(normalizedDate);
        console.log('Saved sobriety date to local storage');
      } catch (err) {
        console.error('Error saving to local storage:', err);
        throw new Error('Failed to save sobriety date locally');
      }
      
      // Save addiction type if provided
      if (addiction) {
        localStorage.setItem('addiction-type', addiction);
        console.log('Saved addiction type to local storage:', addiction);
      }
      
      // Mark onboarding as completed
      localStorage.setItem('onboarding-completed', 'true');
      console.log('Marked onboarding as completed in local storage');
      
      // If user is logged in, update their profile
      if (user) {
        console.log('User is logged in, updating profile in Supabase');
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            sobriety_start_date: normalizedDate.toISOString(),
            addiction_type: addiction || null,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating profile in Supabase:', error);
          throw new Error(`Failed to save your information: ${error.message}`);
        }
        
        console.log('Successfully updated profile in Supabase');
      }
      
      // Show success message before redirecting
      toast.success('Welcome to your recovery journey!');
      
      // Add a small delay to ensure the toast is visible and data has been saved
      setTimeout(() => {
        // Reset any previous errors
        setError(null);
        // Redirect to dashboard
        console.log('Redirecting to dashboard');
        navigate('/');
      }, 800);
      
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.message || 'There was a problem saving your information');
      toast.error(err.message || 'There was a problem saving your information');
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
              {error}
            </div>
          )}
          
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
