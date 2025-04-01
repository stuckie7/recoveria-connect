
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables or use default fallback values for local development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bisrbwpjmtwfqkwvzdor.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpc3Jid3BqbXR3ZnFrd3Z6ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTkzODMsImV4cCI6MjA1ODQzNTM4M30.KvQuyChW0gYs-2HewFQGGtGmtj0z0Dt_Kr2g1klfkHg';

// Create and export the Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'  // Using PKCE flow type
  }
});
