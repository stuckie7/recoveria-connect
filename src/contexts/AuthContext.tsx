
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

  // Helper function to handle profile creation/verification
  const ensureUserProfile = async (user: User) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      // Create profile if it doesn't exist (regardless of error)
      if (!profile) {
        try {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
          });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            console.log('Created user profile for:', user.id);
          }
        } catch (error) {
          console.error('Error in profile creation:', error);
        }
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
        // Don't throw - allow authentication to continue
      }
    } catch (error) {
      console.error('Error in profile verification:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If a user is found, handle profile/presence
        if (session?.user) {
          try {
            await ensureUserProfile(session.user);
          } catch (error) {
            console.error('Error ensuring user profile:', error);
            // Continue auth flow despite errors
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // If a user is found, handle profile/presence
        if (session?.user) {
          try {
            await ensureUserProfile(session.user);
          } catch (error) {
            console.error('Error ensuring user profile:', error);
            // Continue auth flow despite errors
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
        try {
          await supabase
            .from('user_presence')
            .update({ is_online: false })
            .eq('id', user.id);
        } catch (presenceError) {
          console.error('Error updating user presence during sign out:', presenceError);
          // Continue sign out despite errors
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
