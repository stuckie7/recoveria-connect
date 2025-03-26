
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from 'react-router-dom';
import { resetAppData, getUserProgress } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSobrietyDate } from '@/hooks/useSobrietyDate';

// Import the component files
import ProfileHeader from '@/components/profile/ProfileHeader';
import DatePicker from '@/components/profile/DatePicker';
import StatsCards from '@/components/profile/StatsCards';
import ProgressChart from '@/components/profile/ProgressChart';
import StreakChart from '@/components/profile/StreakChart';
import SettingsList from '@/components/profile/SettingsList';
import AboutSection from '@/components/profile/AboutSection';
import DangerZone from '@/components/profile/DangerZone';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import CurrentSubscription from '@/components/subscription/CurrentSubscription';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { search } = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('profile');

  const { 
    progress, 
    isDatePickerOpen, 
    setIsDatePickerOpen,
    selectedDate,
    handleDateChange,
    handleSaveDate,
    setProgress
  } = useSobrietyDate();
  
  useEffect(() => {
    // Set active tab from URL parameter if available
    if (tabParam && ['profile', 'subscription', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Check if subscription success/cancel message needs to be shown
    if (searchParams.has('success')) {
      toast.success('Subscription successful!', {
        description: 'Your premium subscription is now active.',
      });
      // Remove the query parameter
      searchParams.delete('success');
      navigate({ search: searchParams.toString() }, { replace: true });
    } else if (searchParams.has('canceled')) {
      toast.info('Subscription process canceled');
      // Remove the query parameter
      searchParams.delete('canceled');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [tabParam, search, navigate, searchParams]);
  
  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app data? This cannot be undone.')) {
      resetAppData();
      // After resetting the app data, we need to update our progress state with the new data
      setProgress(getUserProgress());
      
      toast.success('App data reset', {
        description: 'All your data has been reset to default values.'
      });
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/profile?tab=${value}`, { replace: true });
  };
  
  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">
          Your Profile
        </h1>
        <p className="text-muted-foreground mb-6 text-center lg:text-left">
          Manage your recovery settings and view your progress
        </p>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <ProfileHeader 
              startDate={new Date(progress.startDate)}
              isDatePickerOpen={isDatePickerOpen}
              setIsDatePickerOpen={setIsDatePickerOpen}
            />
            
            {isDatePickerOpen && (
              <DatePicker 
                isOpen={isDatePickerOpen}
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
                handleSaveDate={handleSaveDate}
                setIsOpen={setIsDatePickerOpen}
              />
            )}
            
            {/* Add the PersonalInfoForm component */}
            <PersonalInfoForm />
            
            <StatsCards progress={progress} />
            
            {/* Data visualization section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Progress Visualization</h2>
              <div className="grid grid-cols-1 gap-6">
                <ProgressChart days={30} />
                <StreakChart />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-6">
            <div className="glass-card p-6 mb-6">
              <CurrentSubscription />
            </div>
            
            <div className="glass-card p-6">
              <SubscriptionPlans />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <SettingsList />
            <AboutSection />
            <DangerZone onResetApp={handleResetApp} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
