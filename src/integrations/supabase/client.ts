
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

// Get environment variables or use default fallback values for local development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bisrbwpjmtwfqkwvzdor.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpc3Jid3BqbXR3ZnFrd3Z6ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTkzODMsImV4cCI6MjA1ODQzNTM4M30.KvQuyChW0gYs-2HewFQGGtGmtj0z0Dt_Kr2g1klfkHg';

// Create and export the Supabase client with explicit auth configuration
// The following options ensure persistent sessions and auto-refresh of tokens on all browsers.
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,  // <- Ensures sessions persist across reloads/browser closes
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

/**
 * Helper function to create or verify a user profile
 * Now takes advantage of database triggers for user_presence
 */
export const ensureUserProfile = async (userId: string, email: string | undefined): Promise<boolean> => {
  try {
    console.log(`Ensuring profile exists for user: ${userId}`);
    
    // First check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
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
          id: userId,
          email: email
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return false;
      }
      
      console.log('Created profile for:', userId);
      
      // We don't need to create a presence record as the database trigger will handle it
      console.log('User presence will be created by database trigger');
    } else {
      console.log('Profile already exists for user:', userId);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    toast({
      title: "Profile Setup Error",
      description: "We had trouble setting up your profile. Some features may be limited.",
      variant: "destructive",
    });
    return false;
  }
};
