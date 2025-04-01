
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

/**
 * Service for handling user profile operations
 */
export const userProfileService = {
  /**
   * Ensures a user profile exists for the given user
   */
  ensureUserProfile: async (user: User): Promise<boolean> => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking profile:', profileError);
        throw profileError;
      }
      
      // Create profile if it doesn't exist
      if (!profile) {
        console.log('Creating profile for user:', user.id);
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
        });
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          toast({
            title: "Profile Creation Error",
            description: "There was a problem creating your profile. Please try again or contact support.",
            variant: "destructive",
          });
          throw insertError;
        }
        
        console.log('Created user profile for:', user.id);
      } else {
        console.log('Profile already exists for user:', user.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error in profile verification:', error);
      throw error;
    }
  }
};
