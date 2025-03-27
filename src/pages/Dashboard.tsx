
import React, { useEffect } from 'react';
import { getUserProgress, updateStreak } from '@/utils/storage';
import SobrietyCounter from '@/components/SobrietyCounter';
import MoodTracker from '@/components/MoodTracker';
import ProgressChart from '@/components/ProgressChart';
import DailyCheckIn from '@/components/DailyCheckIn';
import CommunityPreview from '@/components/CommunityPreview';
import EmergencySupport from '@/components/EmergencySupport';
import MilestoneCard from '@/components/MilestoneCard';
import { UpcomingMilestones } from '@/components/profile/personal-info';

const Dashboard: React.FC = () => {
  useEffect(() => {
    // Get user progress
    const progress = getUserProgress();
    
    // Update streak if needed (checking if we have new check-ins)
    const today = new Date().toISOString().split('T')[0];
    const hasTodayCheckIn = progress.checkIns.some(
      checkIn => checkIn.date.split('T')[0] === today
    );
    
    if (!hasTodayCheckIn) {
      updateStreak();
    }
  }, []);
  
  const { milestones } = getUserProgress();
  const upcomingMilestones = milestones
    .filter(m => !m.achieved)
    .slice(0, 3);
  
  return (
    <div className="py-20 px-4 min-h-screen bg-recovery-fun-iris">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl px-6 py-4 mb-6 shadow-md">
          <h1 className="text-3xl font-bold text-center lg:text-left text-purple-900">Your Recovery Journey</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sobriety counter */}
            <SobrietyCounter />
            
            {/* Progress chart */}
            <ProgressChart />
            
            {/* Daily check-in */}
            <DailyCheckIn />
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            {/* Mood tracker */}
            <MoodTracker />
            
            {/* Upcoming milestones - New Component */}
            <UpcomingMilestones />
            
            {/* Community preview */}
            <CommunityPreview />
          </div>
        </div>
      </div>
      
      {/* Emergency support button */}
      <EmergencySupport />
    </div>
  );
};

export default Dashboard;
