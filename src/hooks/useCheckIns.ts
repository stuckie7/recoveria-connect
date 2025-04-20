
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

      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast.error('Failed to load check-ins');
    } finally {
      setIsLoading(false);
    }
  };

  const addCheckIn = async (checkIn: Omit<CheckIn, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .insert([{ ...checkIn, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setCheckIns(prev => [data, ...prev]);
      return data;
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
