
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

/**
 * Service for handling user profile operations
 * Now simplified with database triggers handling presence records
 */
export const userProfileService = {
  /**
   * Ensures a user profile exists for the given user
   * The database trigger will automatically create a presence record
   */
  ensureUserProfile: async (user: User): Promise<boolean> => {
    try {
      console.log(`Ensuring profile exists for user: ${user.id}`);
      
      // Check if profile exists using retry mechanism
      const profile = await performWithRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking if profile exists:', error);
          throw error;
        }
        
        return data;
      }, 3);
      
      // Create profile if it doesn't exist (with retry)
      if (!profile) {
        console.log('Profile not found, creating one...');
        
        await performWithRetry(async () => {
          const { error } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
          });
          
          if (error) {
            console.error('Error creating profile:', error);
            throw error;
          }
          
          return true;
        }, 3);
        
        // Verify profile was created
        const verifyResult = await performWithRetry(async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error verifying profile creation:', error);
            throw error;
          }
          
          return data;
        }, 3);
        
        console.log('Created and verified user profile for:', user.id);
        return !!verifyResult;
      } else {
        console.log('Profile already exists for user:', user.id);
        return true;
      }
    } catch (error) {
      console.error('Error in profile verification after multiple retries:', error);
      toast({
        title: "Profile Creation Error",
        description: "There was a problem creating your profile. Please try again or contact support.",
        variant: "destructive",
      });
      return false;
    }
  }
};
