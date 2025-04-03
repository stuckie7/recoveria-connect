
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Component that redirects users to the welcome page if they haven't completed onboarding
 */
const OnboardingGuard = () => {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // For guest users, check local storage
        const localOnboardingCompleted = localStorage.getItem('onboarding-completed') === 'true';
        
        if (localOnboardingCompleted) {
          console.log('Onboarding completed according to local storage');
          setOnboardingCompleted(true);
          setLoading(false);
          return;
        }
        
        // For authenticated users, check their profile
        if (user) {
          console.log('Checking onboarding status for user:', user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Error fetching onboarding status:', error);
            // Default to not completed in case of error
            setOnboardingCompleted(false);
          } else {
            // Use nullish coalescing to handle potentially undefined onboarding_completed
            const completed = data?.onboarding_completed ?? false;
            console.log('Profile data found, onboarding_completed:', completed);
            
            // If completed in database, also set in localStorage for faster checks
            if (completed) {
              localStorage.setItem('onboarding-completed', 'true');
            }
            
            setOnboardingCompleted(completed);
          }
        } else {
          console.log('No user found, onboarding not completed');
          setOnboardingCompleted(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to not completed in case of error
        setOnboardingCompleted(false);
        toast.error('Error checking your setup status');
      } finally {
        setLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If onboarding is not completed, redirect to welcome page
  return onboardingCompleted ? <Outlet /> : <Navigate to="/welcome" replace />;
};

export default OnboardingGuard;
