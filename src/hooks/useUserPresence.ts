
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

/**
 * Hook to manage user presence state (online/offline)
 * Now leveraging database triggers for automatic presence creation
 */
export const useUserPresence = () => {
  const [updating, setUpdating] = useState(false);

  // Function to update presence record - now simplified as triggers handle creation
  const updatePresence = async (userId: string, isOnline: boolean = true) => {
    if (!userId || updating) return false;
    
    setUpdating(true);
    
    try {
      console.log(`Updating presence for user ${userId}: ${isOnline ? 'online' : 'offline'}`);
      
      // Simple upsert - the database trigger will ensure the profile exists
      const { error: presenceError } = await supabase.from('user_presence').upsert({
        id: userId,
        is_online: isOnline,
        last_seen: new Date().toISOString()
      });
      
      if (presenceError) {
        console.error('Error updating user presence:', presenceError);
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
