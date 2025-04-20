
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProgress } from '@/types';

export const useSupabaseSync = (
  progress: UserProgress, 
  selectedDate: Date
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const syncWithSupabase = async () => {
      try {
        console.log('Syncing sobriety date with Supabase for user:', user.id);
        // Fetch the user's profile to get sobriety date
        const { data, error } = await supabase
          .from('profiles')
          .select('sobriety_start_date')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching sobriety date from Supabase:', error);
          return;
        }
        
        // If user has a sobriety date in Supabase, update it
        if (data?.sobriety_start_date && user) {
          await supabase
            .from('profiles')
            .update({ 
              sobriety_start_date: selectedDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
      } catch (err) {
        console.error('Error syncing sobriety date with Supabase:', err);
      }
    };
    
    syncWithSupabase();
  }, [user, progress.startDate, selectedDate]);
};

