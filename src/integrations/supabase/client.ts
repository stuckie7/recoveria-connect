
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables or use default fallback values for local development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bisrbwpjmtwfqkwvzdor.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpc3Jid3BqbXR3ZnFrd3Z6ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTkzODMsImV4cCI6MjA1ODQzNTM4M30.KvQuyChW0gYs-2HewFQGGtGmtj0z0Dt_Kr2g1klfkHg';

// Create and export the Supabase client with explicit auth configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper function to ensure a user profile exists
export const ensureUserProfile = async (userId: string, email?: string | null): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if profile exists
    const { data: profileData, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileCheckError) {
      console.error('Error checking profile:', profileCheckError);
      return false;
    }
    
    // If profile doesn't exist yet, create it
    if (!profileData) {
      console.log('Profile not found, creating one for user:', userId);
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId, 
          email: email || undefined
        });
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return false;
      }
      
      // Wait a moment for the profile creation to be processed
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
};
