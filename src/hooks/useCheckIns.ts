
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CheckIn } from '@/types';

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchCheckIns();
  }, [user]);

  const fetchCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform database records to match CheckIn type
      const transformedData: CheckIn[] = (data || []).map(item => ({
        id: item.id,
        date: item.date,
        mood: item.mood as CheckIn['mood'],
        sleepQuality: item.sleep_quality as CheckIn['sleepQuality'],
        energyLevel: item.energy_level as CheckIn['energyLevel'],
        activities: Array.isArray(item.activities) ? item.activities : [],
        triggers: item.triggers || [],
        notes: item.notes || '',
        strategies: [], // Default empty array for strategies
        feelingBetter: false // Default value
      }));

      setCheckIns(transformedData);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast.error('Failed to load check-ins');
    } finally {
      setIsLoading(false);
    }
  };

  const addCheckIn = async (checkIn: Omit<CheckIn, 'id'>) => {
    try {
      // Transform the CheckIn object to match database schema
      const checkInRecord = {
        user_id: user?.id,
        mood: checkIn.mood,
        sleep_quality: checkIn.sleepQuality,
        energy_level: checkIn.energyLevel,
        activities: checkIn.activities,
        triggers: checkIn.triggers,
        notes: checkIn.notes,
        date: checkIn.date
      };

      const { data, error } = await supabase
        .from('check_ins')
        .insert([checkInRecord])
        .select()
        .single();

      if (error) throw error;

      // Transform the response back to CheckIn type
      const newCheckIn: CheckIn = {
        id: data.id,
        date: data.date,
        mood: data.mood as CheckIn['mood'],
        sleepQuality: data.sleep_quality as CheckIn['sleepQuality'],
        energyLevel: data.energy_level as CheckIn['energyLevel'],
        activities: Array.isArray(data.activities) ? data.activities : [],
        triggers: data.triggers || [],
        notes: data.notes || '',
        strategies: [],
        feelingBetter: false
      };

      setCheckIns(prev => [newCheckIn, ...prev]);
      return newCheckIn;
    } catch (error) {
      console.error('Error adding check-in:', error);
      toast.error('Failed to save check-in');
      throw error;
    }
  };

  return {
    checkIns,
    isLoading,
    addCheckIn,
    refreshCheckIns: fetchCheckIns
  };
}
