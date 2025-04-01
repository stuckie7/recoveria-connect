
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthCard } from '@/components/auth/AuthCard';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    // First check for existing session (this won't trigger a redirect yet)
    performWithRetry(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        toast({
          title: "Session Error",
          description: "There was a problem with your session. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        throw error;
      }
      
      if (session?.user) {
        console.log('Initial session check: User found', session.user.id);
        setUser(session.user);
      } else {
        console.log('Initial session check: No user found');
        setLoading(false);
      }
    }, 3).catch(() => setLoading(false));

    // Set up auth listener for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Auth state change: SIGNED_IN', session.user.id);
          setUser(session.user);
          
          // Use setTimeout to avoid any racing conditions
          setTimeout(() => {
            // Continue with redirect even if presence update fails
            try {
              navigate('/welcome');
            } catch (error) {
              console.error('Navigation error:', error);
              setLoading(false);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth state change: SIGNED_OUT');
          setUser(null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // If we have a user but we're still loading, show a loading state
  if (user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 hero-gradient">
      <AuthCard />
    </div>
  );
};

export default Auth;
