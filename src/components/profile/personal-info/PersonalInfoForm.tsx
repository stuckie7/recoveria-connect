
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { useProfileData, profileFormSchema, type ProfileFormValues } from './useProfileData';
import BasicInfoFields from './BasicInfoFields';
import BioField from './BioField';
import AdditionalInfoFields from './AdditionalInfoFields';

const PersonalInfoForm: React.FC = () => {
  const { profileData, isLoading, updateProfile } = useProfileData();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileData,
    mode: 'onChange',
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (profileData) {
      form.reset(profileData);
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    await updateProfile(data);
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center mb-4">
        <User className="mr-2 h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <BasicInfoFields form={form} />
          <BioField form={form} />
          <AdditionalInfoFields form={form} />
          
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
