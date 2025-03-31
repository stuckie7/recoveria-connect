
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
        if (session?.user) {
          setUser(session.user);
          
          // First navigate, then set up user data in the background
          navigate('/welcome');
          
          // Ensure the user has a profile and presence record
          const setupUserData = async () => {
            try {
              // First ensure profile exists
              const { error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();
                
              if (profileError) {
                // Profile doesn't exist, create one
                await supabase.from('profiles').insert({
                  id: session.user.id,
                  email: session.user.email,
                });
                
                // Add a small delay before creating presence record
                // to ensure profile is fully created first
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
              // Now try to ensure presence record
              await supabase.from('user_presence').upsert({
                id: session.user.id,
                is_online: true,
                last_seen: new Date().toISOString()
              });
              
            } catch (err) {
              console.error("Error setting up user data:", err);
              // Don't show error to user since they've already been navigated away
            }
          };
          
          setupUserData();
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
        setUser(session.user);
        navigate('/welcome');
      } else {
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
