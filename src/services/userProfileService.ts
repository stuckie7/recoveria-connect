import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

/**
 * Service for handling user profile operations
 */
export const userProfileService = {
  /**
   * Ensures a user profile exists for the given user
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
        
        // First check if there are any existing transactions that might be causing issues
        await performWithRetry(async () => {
          // Execute a simple query to check database connection and reset any aborted transactions
          const { error } = await supabase.rpc('get_active_users_count');
          if (error) {
            console.error('Error checking database connection:', error);
            throw error;
          }
          return true;
        }, 3);
        
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
        }, 5);
        
        // Wait longer for profile creation to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify profile was created with more retries
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
          
          if (!data) {
            throw new Error('Profile was not created successfully');
          }
          
          return data;
        }, 5);
        
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
