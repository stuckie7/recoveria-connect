
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { userProfileService } from '@/services/userProfileService';
import { useUserPresence } from './useUserPresence';
import { performWithRetry } from '@/utils/retryUtil';

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
        
        // Only use the immediate synchronous operations here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to avoid potential deadlocks with Supabase auth
        if (session?.user) {
          setTimeout(() => {
            handleUserSession(session);
          }, 0);
        } else {
          setLoading(false);
        }
      }
    );

    // THEN check for initial session
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...");
        
        // Use retry for getting session
        const session = await performWithRetry(async () => {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          return data.session;
        }, 3);
        
        // Set session state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("Initial session found, handling user session...");
          await handleUserSession(session);
        } else {
          console.log("No initial session found");
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session after retries:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem retrieving your session. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    // Extracted session handling logic - simplified now that we use DB triggers
    const handleUserSession = async (session: Session) => {
      try {
        console.log("Ensuring user profile exists...");
        // First ensure profile exists - our trigger will handle user_presence
        const profileCreated = await userProfileService.ensureUserProfile(session.user);
        
        if (!profileCreated) {
          console.error("Failed to create or verify user profile");
          toast({
            title: "Profile Error",
            description: "There was a problem with your profile setup. Please try logging in again.",
            variant: "destructive",
          });
          // Force sign out if profile creation fails
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log("Setting user online status...");
        // Update online status - not critical to login flow now that we have triggers
        setUserOnline(session.user).catch(err => {
          console.warn("Failed to set user online, but continuing session:", err);
        });
      } catch (error) {
        console.error('Error in profile management:', error);
        toast({
          title: "Profile Error",
          description: "There was a problem with your profile setup.",
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

  return {
    session,
    user,
    loading,
    setLoading
  };
};
