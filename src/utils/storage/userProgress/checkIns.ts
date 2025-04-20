
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

  // Also update local storage for backward compatibility
  const progress = getUserProgress();
  progress.checkIns.push(data);
  saveUserProgress(progress);
  
  return data;
};
