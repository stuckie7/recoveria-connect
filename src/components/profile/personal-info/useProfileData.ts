
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { UseFormReset } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const profileFormSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }).optional(),
  bio: z.string().max(160, {
    message: 'Bio must not be longer than 160 characters.',
  }).optional(),
  location: z.string().max(30, {
    message: 'Location must not be longer than 30 characters.'
  }).optional(),
  occupation: z.string().max(50, {
    message: 'Occupation must not be longer than 50 characters.'
  }).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const useProfileData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<ProfileFormValues>({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    occupation: '',
  });

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Select only columns that we know exist in all scenarios
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
        return;
      }

      // Set the data we know exists
      const profileValues: ProfileFormValues = {
        full_name: data?.full_name || '',
        username: data?.username || '',
        bio: '',
        location: '',
        occupation: '',
      };
      
      // Now try to fetch the new columns
      try {
        const { data: extendedData, error: extendedError } = await supabase
          .from('profiles')
          .select('bio, location, occupation')
          .eq('id', user!.id)
          .single();
        
        if (!extendedError && extendedData) {
          // If successful, add these fields to our profile values
          profileValues.bio = extendedData.bio || '';
          profileValues.location = extendedData.location || '';
          profileValues.occupation = extendedData.occupation || '';
        } else {
          console.log('New columns may not exist yet:', extendedError);
          // The columns might not exist yet, which is fine
        }
      } catch (e) {
        console.log('Could not fetch extended profile fields:', e);
        // Ignore errors from this query as the columns might not exist yet
      }
      
      setProfileData(profileValues);
      return profileValues;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      // Create an update object with only the fields we want to update
      const updateData: any = {
        full_name: data.full_name,
        username: data.username,
        updated_at: new Date().toISOString(),
      };
      
      // Only include the new fields if they are defined in the form data
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.occupation !== undefined) updateData.occupation = data.occupation;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user!.id);

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully');
      setProfileData(data);
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  return {
    profileData,
    isLoading,
    updateProfile,
    fetchProfileData
  };
};
