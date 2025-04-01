
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

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

  useEffect(() => {
    // Set up auth state listener FIRST (very important for auth flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event);
        
        // Only update session/user state synchronously here
        setSession(session);
        setUser(session?.user ?? null);
        
        // If a user is found and they just signed in, handle profile setup
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid Supabase auth deadlocks
          setTimeout(() => {
            ensureUserProfile(session.user);
          }, 500);
        }
        
        // Mark as not loading unless we're in sign-in
        if (event !== 'SIGNED_IN') {
          setLoading(false);
        }
      }
    );

    // THEN check for initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlocks
          setTimeout(() => {
            ensureUserProfile(session.user);
          }, 500);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem retrieving your session. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Centralized function to ensure user profile exists
  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      // Create profile if it doesn't exist (now only checking !profile, not the error)
      if (!profile) {
        console.log('Creating profile for user:', user.id);
        try {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
          });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            toast({
              title: "Profile Creation Error",
              description: "There was a problem creating your profile. Please try again or contact support.",
              variant: "destructive",
            });
            // Continue execution even if profile creation fails
          } else {
            console.log('Created user profile for:', user.id);
          }
        } catch (error) {
          console.error('Error in profile creation:', error);
          // We don't throw here as we want to continue with presence
        }
      } else {
        console.log('Profile already exists for user:', user.id);
      }
      
      // Add some delay before updating presence
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always update presence record
      try {
        const { error: presenceError } = await supabase.from('user_presence').upsert({
          id: user.id,
          is_online: true,
          last_seen: new Date().toISOString()
        });
        
        if (presenceError) {
          console.error('Error updating user presence:', presenceError);
        } else {
          console.log('Updated presence for user:', user.id);
        }
      } catch (error) {
        console.error('Exception updating presence:', error);
      }
      
      // Only mark loading as false when we're done with all operations
      setLoading(false);
      
    } catch (error) {
      console.error('Error in profile verification:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // If there's a user, update their online status
      if (user) {
        try {
          await supabase
            .from('user_presence')
            .update({ is_online: false })
            .eq('id', user.id);
        } catch (presenceError) {
          console.error('Error updating user presence during sign out:', presenceError);
        }
      }
      
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
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
