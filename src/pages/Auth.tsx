
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthCard } from '@/components/auth/AuthCard';
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    // Set up auth listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Auth state change: SIGNED_IN', session.user.id);
          setUser(session.user);
          
          // First navigate, then set up user data asynchronously
          navigate('/welcome');
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth state change: SIGNED_OUT');
          setUser(null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        toast({
          title: "Session Error",
          description: "There was a problem with your session. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('Initial session check: User found', session.user.id);
        setUser(session.user);
        navigate('/welcome');
      } else {
        console.log('Initial session check: No user found');
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
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
