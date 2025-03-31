
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // If a user is found, handle profile/presence separately to avoid
        // blocking the auth state flow
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();
                
              // If there's no profile, we need to create one
              if (!profile && profileError) {
                try {
                  // Create a basic profile
                  await supabase.from('profiles').insert({
                    id: session.user.id,
                    email: session.user.email,
                  });
                  
                  console.log('Created user profile for:', session.user.id);
                  
                  // Add a delay before attempting to create presence
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  // Create presence record
                  const { error: presenceError } = await supabase.from('user_presence').upsert({
                    id: session.user.id,
                    is_online: true,
                    last_seen: new Date().toISOString()
                  });
                  
                  if (presenceError) {
                    console.error('Error creating presence record:', presenceError);
                  } else {
                    console.log('Created presence record for:', session.user.id);
                  }
                } catch (error) {
                  console.error('Error in profile/presence creation:', error);
                }
              } else {
                // If profile exists, just update presence
                try {
                  await supabase.from('user_presence').upsert({
                    id: session.user.id,
                    is_online: true,
                    last_seen: new Date().toISOString()
                  });
                } catch (presenceError) {
                  console.error('Error updating user presence:', presenceError);
                }
              }
            } catch (error) {
              console.error('Error in session initialization:', error);
            }
          }, 0); // Using setTimeout to avoid blocking auth flow
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
