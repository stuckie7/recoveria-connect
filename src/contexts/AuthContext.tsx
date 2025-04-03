
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { setUserOffline } from '@/hooks/useUserPresence';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: false,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info('Auth state change event:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // For login events, ensure profile exists (defer with setTimeout to avoid Supabase deadlock)
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.info('Auth state change:', event, currentSession.user.id);
          setTimeout(() => {
            ensureProfileExists(currentSession.user);
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.info('Initial session check:', currentSession ? `User found: ${currentSession.user.id}` : 'No user found');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const ensureProfileExists = async (user: User) => {
    try {
      console.info('Ensuring profile exists for user:', user.id);
      
      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        console.info('Profile already exists for user:', user.id);
        return profile;
      }

      // Create profile if it doesn't exist
      console.info('Creating new profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.info('Profile created for user:', user.id);
      return data;
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

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
      
      // REMOVED: localStorage.removeItem('onboarding-completed');
      // This line was causing onboarding to reappear for returning users
      
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
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
