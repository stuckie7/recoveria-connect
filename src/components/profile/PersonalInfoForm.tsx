
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const profileFormSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const PersonalInfoForm: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<ProfileFormValues>({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    occupation: '',
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileData,
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

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
      form.reset(profileValues);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
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
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center mb-4">
        <User className="mr-2 h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us a little about yourself" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
