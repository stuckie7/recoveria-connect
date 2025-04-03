
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useUserPresence } from '@/hooks/useUserPresence';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUserOffline } = useUserPresence();

  // Helper function to handle profile creation/verification
  const ensureUserProfile = async (user: User) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      // Create profile if it doesn't exist
      if (!profile) {
        try {
          console.log('Creating user profile for:', user.id);
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            onboarding_completed: false,  // Force onboarding for new users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            toast({
              title: "Profile Error",
              description: "Could not set up your profile. Some features may be limited.",
              variant: "destructive",
            });
          } else {
            console.log('Created user profile for:', user.id);
          }
        } catch (error) {
          console.error('Error in profile creation:', error);
        }
      } else {
        console.log('Found existing profile for user:', user.id);
      }
      
      // Update presence record - but don't block authentication if it fails
      try {
        await supabase.from('user_presence').upsert({
          id: user.id,
          is_online: true,
          last_seen: new Date().toISOString()
        });
      } catch (presenceError) {
        console.error('Error updating user presence, but continuing auth flow:', presenceError);
      }
    } catch (error) {
      console.error('Error in profile verification:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        
        // Update session and user state synchronously
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If user just signed in, handle profile setup
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Use setTimeout to avoid Supabase auth deadlocks
          setTimeout(async () => {
            try {
              await ensureUserProfile(newSession.user);
            } catch (error) {
              console.error('Error ensuring user profile after sign in:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If session exists, handle profile
        if (currentSession?.user) {
          try {
            await ensureUserProfile(currentSession.user);
          } catch (error) {
            console.error('Error ensuring user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem retrieving your session. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      // If there's a user, update their online status
      if (user) {
        await setUserOffline(user);
      }
      
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      // Clear onboarding status on sign out
      localStorage.removeItem('onboarding-completed');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
