
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
        handleSessionChange(session);
      }
    );

    // THEN check for initial session
    const getInitialSession = async () => {
      try {
        // Use retry for getting session
        const session = await performWithRetry(async () => {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          return data.session;
        });
        
        await handleSessionChange(session);
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

    // Extracted session handling logic
    const handleSessionChange = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          await userProfileService.ensureUserProfile(session.user);
          await setUserOnline(session.user);
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
      } else {
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
