
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
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // If a user is found, let's also check if they have a profile
          if (session.user) {
            setTimeout(async () => {
              try {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('id', session.user.id)
                  .single();
                  
                // If there's no profile, we need to create one
                if (profileError) {
                  try {
                    // Create a basic profile
                    await supabase.from('profiles').insert({
                      id: session.user.id,
                      email: session.user.email,
                    });
                    
                    // Add a small delay to ensure profile is created
                    await new Promise(resolve => setTimeout(resolve, 500));
                  } catch (insertError) {
                    console.error('Error creating user profile:', insertError);
                  }
                }
                
                // Try to also ensure user presence record exists
                try {
                  await supabase.from('user_presence').upsert({
                    id: session.user.id,
                    is_online: true,
                    last_seen: new Date().toISOString()
                  });
                } catch (presenceError) {
                  console.error('Error updating user presence:', presenceError);
                }
              } catch (error) {
                console.error('Error checking profile:', error);
              }
            }, 0); // Using setTimeout to avoid blocking the auth state change
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
        }
      }
      
      await supabase.auth.signOut();
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
