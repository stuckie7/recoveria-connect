
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

/**
 * Hook to manage user presence state (online/offline)
 */
export const useUserPresence = () => {
  const [updating, setUpdating] = useState(false);

  // Function to update presence record
  const updatePresence = async (userId: string, isOnline: boolean = true) => {
    if (!userId || updating) return;
    
    const maxRetries = 3;
    let retries = 0;
    
    setUpdating(true);
    
    while (retries < maxRetries) {
      try {
        const { error: presenceError } = await supabase.from('user_presence').upsert({
          id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });
        
        if (!presenceError) {
          console.log(`User presence updated: ${userId} is ${isOnline ? 'online' : 'offline'}`);
          setUpdating(false);
          return true;
        }
        
        console.error(`Attempt ${retries + 1} failed:`, presenceError);
        retries++;
        
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      } catch (error) {
        console.error(`Unexpected error in attempt ${retries + 1}:`, error);
        retries++;
        
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
    }
    
    console.error(`Failed to update presence record after ${maxRetries} attempts`);
    setUpdating(false);
    
    // Don't throw error as presence is not critical to core functionality
    toast({
      title: "Presence Update Warning",
      description: "Unable to update your online status. Some social features may be limited.",
      variant: "destructive",
    });
    
    return false;
  };

  const setUserOnline = (user: User | null) => {
    if (user) {
      return updatePresence(user.id, true);
    }
    return Promise.resolve(false);
  };

  const setUserOffline = (user: User | null) => {
    if (user) {
      return updatePresence(user.id, false);
    }
    return Promise.resolve(false);
  };

  return {
    setUserOnline,
    setUserOffline,
    updating
  };
};
