
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
          setOnboardingCompleted(true);
          setLoading(false);
          return;
        }
        
        // For authenticated users, check their profile
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching onboarding status:', error);
            // Default to not completed in case of error
            setOnboardingCompleted(false);
          } else {
            setOnboardingCompleted(data?.onboarding_completed || false);
          }
        } else {
          setOnboardingCompleted(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to not completed in case of error
        setOnboardingCompleted(false);
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

  return onboardingCompleted ? <Outlet /> : <Navigate to="/welcome" replace />;
};

export default OnboardingGuard;
