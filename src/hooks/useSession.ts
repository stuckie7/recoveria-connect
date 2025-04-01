
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { userProfileService } from '@/services/userProfileService';
import { useUserPresence } from './useUserPresence';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUserOnline } = useUserPresence();

  useEffect(() => {
    // Set up auth state listener FIRST (very important for auth flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event);
        
        // Only update session/user state synchronously here
        setSession(session);
        setUser(session?.user ?? null);
        
        // If a user is found and they just signed in, handle profile setup
        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlocks
          setTimeout(async () => {
            try {
              await userProfileService.ensureUserProfile(session.user);
              await setUserOnline(session.user);
            } catch (error) {
              console.error('Error ensuring user profile:', error);
              toast({
                title: "Profile Error",
                description: "There was a problem with your profile setup.",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
          }, 500);
        } else {
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
          setTimeout(async () => {
            try {
              await userProfileService.ensureUserProfile(session.user);
              await setUserOnline(session.user);
            } catch (error) {
              console.error('Error ensuring user profile:', error);
              toast({
                title: "Profile Error",
                description: "There was a problem with your profile setup.",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
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

  return {
    session,
    user,
    loading,
    setLoading
  };
};
