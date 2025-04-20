
/**
 * Check-in management utilities
 */

import { CheckIn } from '@/types';
import { getUserProgress, saveUserProgress } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Add a new check-in
 */
export const addCheckIn = async (checkIn: Omit<CheckIn, 'id'>): Promise<CheckIn> => {
  // Add to Supabase
  const { data, error } = await supabase
    .from('check_ins')
    .insert([{
      user_id: await supabase.auth.getUser().then(res => res.data.user?.id),
      mood: checkIn.mood,
      sleep_quality: checkIn.sleepQuality,
      energy_level: checkIn.energyLevel,
      activities: checkIn.activities,
      triggers: checkIn.triggers,
      notes: checkIn.notes,
      date: checkIn.date
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding check-in:', error);
    throw error;
  }

  // Transform the response to match CheckIn type
  const newCheckIn: CheckIn = {
    id: data.id,
    date: data.date,
    mood: data.mood as CheckIn['mood'],
    sleepQuality: data.sleep_quality as CheckIn['sleepQuality'],
    energyLevel: data.energy_level as CheckIn['energyLevel'],
    activities: Array.isArray(data.activities) ? data.activities : [],
    triggers: data.triggers || [],
    notes: data.notes || '',
    strategies: [], // Default empty array
    feelingBetter: false // Default value
  };

  // Also update local storage for backward compatibility
  const progress = getUserProgress();
  progress.checkIns.push(newCheckIn);
  saveUserProgress(progress);
  
  return newCheckIn;
};
