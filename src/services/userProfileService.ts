
import { User } from '@supabase/supabase-js';
import { ensureUserProfile } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

/**
 * Service for handling user profile operations
 * Now uses the shared ensureUserProfile function
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
        const success = await ensureUserProfile(user.id, user.email);
        
        if (!success) {
          throw new Error('Failed to ensure profile exists');
        }
        
        return success;
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
