
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

/**
 * Hook to manage user presence state (online/offline)
 */
export const useUserPresence = () => {
  const [updating, setUpdating] = useState(false);

  // Function to update presence record
  const updatePresence = async (userId: string, isOnline: boolean = true) => {
    if (!userId || updating) return;
    
    setUpdating(true);
    
    try {
      const result = await performWithRetry(async () => {
        const { error: presenceError } = await supabase.from('user_presence').upsert({
          id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });
        
        if (presenceError) {
          throw presenceError;
        }
        
        return true;
      });
      
      if (result) {
        console.log(`User presence updated: ${userId} is ${isOnline ? 'online' : 'offline'}`);
      }
    } catch (error) {
      console.error(`Failed to update presence record after multiple attempts:`, error);
      
      // Don't throw error as presence is not critical to core functionality
      toast({
        title: "Presence Update Warning",
        description: "Unable to update your online status. Some social features may be limited.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
    
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
