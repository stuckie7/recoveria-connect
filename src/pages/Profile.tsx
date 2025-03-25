
import React from 'react';
import { toast } from 'sonner';
import { resetAppData } from '@/utils/storage';
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

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { 
    progress, 
    isDatePickerOpen, 
    setIsDatePickerOpen,
    selectedDate,
    handleDateChange,
    handleSaveDate
  } = useSobrietyDate();
  
  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app data? This cannot be undone.')) {
      const resetData = resetAppData();
      
      toast.success('App data reset', {
        description: 'All your data has been reset to default values.'
      });
    }
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
        
        <StatsCards progress={progress} />
        
        {/* Data visualization section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Progress Visualization</h2>
          <div className="grid grid-cols-1 gap-6">
            <ProgressChart days={30} />
            <StreakChart />
          </div>
        </div>
        
        <SettingsList />
        <AboutSection />
        <DangerZone onResetApp={handleResetApp} />
      </div>
    </div>
  );
};

export default Profile;
