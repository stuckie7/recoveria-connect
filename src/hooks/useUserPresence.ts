
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
    if (!userId || updating) return false;
    
    setUpdating(true);
    
    try {
      // Try to update the presence record, but don't block authentication if it fails
      await performWithRetry(async () => {
        const { error } = await supabase.from('user_presence').upsert({
          id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });
        
        if (error) {
          console.error('Error updating presence:', error);
          // We're not throwing here, just logging the error
        }
      }, 2); // Only retry once to avoid delaying authentication flow
      
      console.log(`User presence ${isOnline ? 'online' : 'offline'} status attempted for: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Failed to update presence record:`, error);
      
      // Don't show a toast for presence errors to avoid disrupting user experience
      // Only log to console since this is non-critical
      
      return false;
    } finally {
      setUpdating(false);
    }
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
