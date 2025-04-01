
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useUserPresence } from './useUserPresence';

export const useSignOut = (
  setLoading: (loading: boolean) => void,
  user: User | null
) => {
  const { setUserOffline } = useUserPresence();

  const signOut = async () => {
    try {
      setLoading(true);
      
      // If there's a user, update their online status
      if (user) {
        try {
          await setUserOffline(user);
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

  return { signOut };
};
