
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
      // Check if profile exists using retry mechanism
      const profile = await performWithRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        return data;
      });
      
      // Create profile if it doesn't exist (with retry)
      if (!profile) {
        console.log('Creating profile for user:', user.id);
        
        await performWithRetry(async () => {
          const { error } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
          });
          
          if (error) {
            throw error;
          }
          
          return true;
        });
        
        console.log('Created user profile for:', user.id);
      } else {
        console.log('Profile already exists for user:', user.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error in profile verification after multiple retries:', error);
      toast({
        title: "Profile Creation Error",
        description: "There was a problem creating your profile. Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    }
  }
};
