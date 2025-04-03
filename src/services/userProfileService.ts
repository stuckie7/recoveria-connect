
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
   * The database trigger will automatically create a presence record
   */
  ensureUserProfile: async (user: User): Promise<boolean> => {
    try {
      console.log(`Ensuring profile exists for user: ${user.id}`);
      
      // Use retry mechanism for better reliability
      return await performWithRetry(async () => {
        // First check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error checking for profile:', profileError);
          return false;
        }
        
        // If no profile found, create one
        if (!profile) {
          console.log('Profile not found, creating one...');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              onboarding_completed: false
            });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            return false;
          }
          
          console.log('Created profile for:', user.id);
        } else {
          console.log('Profile already exists for user:', user.id);
        }
        
        return true;
      }, 3);
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
