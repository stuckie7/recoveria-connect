
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase, ensureUserProfile } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

/**
 * Hook to manage user presence state (online/offline)
 */
export const useUserPresence = () => {
  const [updating, setUpdating] = useState(false);

  // Function to update presence record
  const updatePresence = async (userId: string, isOnline: boolean = true) => {
    if (!userId || updating) return false;
    
    setUpdating(true);
    
    try {
      // First ensure the profile exists
      const profileExists = await ensureUserProfile(userId);
      
      if (!profileExists) {
        console.error("Could not ensure profile exists for user:", userId);
        return false;
      }
      
      // Important: Add a small delay to ensure the profile has been created in the database
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Now update the presence
      const { error: presenceError } = await supabase.from('user_presence').upsert({
        id: userId,
        is_online: isOnline,
        last_seen: new Date().toISOString()
      });
      
      if (presenceError) {
        console.error("Error updating user presence:", presenceError);
        return false;
      }
      
      console.log(`User presence updated: ${userId} is ${isOnline ? 'online' : 'offline'}`);
      return true;
    } catch (error) {
      console.error(`Failed to update presence record:`, error);
      
      toast({
        title: "Presence Update Warning",
        description: "Unable to update your online status. Some social features may be limited.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const setUserOnline = async (user: User | null) => {
    if (user) {
      return await updatePresence(user.id, true);
    }
    return Promise.resolve(false);
  };

  const setUserOffline = async (user: User | null) => {
    if (user) {
      return await updatePresence(user.id, false);
    }
    return Promise.resolve(false);
  };

  return {
    setUserOnline,
    setUserOffline,
    updating
  };
};
