
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
      // First ensure the profile exists before trying to update presence
      const profileExists = await ensureUserProfile(userId);
      
      if (!profileExists) {
        console.error("Could not ensure profile exists for user:", userId);
        return false;
      }
      
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
  
  // Helper function to ensure user profile exists
  const ensureUserProfile = async (userId: string): Promise<boolean> => {
    try {
      // Try to get the user for email info if needed
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Could not get current user:', userError);
        return false;
      }
      
      return await performWithRetry(async () => {
        // First check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error checking for profile:', profileError);
          return false;
        }
        
        // If profile doesn't exist yet, create it first
        if (!profileData) {
          console.log('Profile not found for user, creating one:', userId);
          
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId, 
              email: userData.user.email 
            });
          
          if (createProfileError) {
            console.error('Error creating profile:', createProfileError);
            return false;
          }
          
          // Wait a moment for the profile creation to be processed
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        return true;
      }, 3); // 3 retries
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
      return false;
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
