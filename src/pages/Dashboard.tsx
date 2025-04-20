
import React, { useEffect } from 'react';
import { getUserProgress, updateStreak } from '@/utils/storage';
import SobrietyCounter from '@/components/SobrietyCounter';
import MoodTracker from '@/components/MoodTracker';
import ProgressChart from '@/components/ProgressChart';
import DailyCheckIn from '@/components/DailyCheckIn';
import CommunityPreview from '@/components/CommunityPreview';
import EmergencySupport from '@/components/EmergencySupport';
import MilestoneCard from '@/components/MilestoneCard';
import RelapsePrediction from '@/components/RelapsePrediction';
import { UpcomingMilestones } from '@/components/profile/personal-info';
import { toast } from 'sonner';
import RefreshButton from '@/components/RefreshButton';

const Dashboard: React.FC = () => {
  useEffect(() => {
    // Update streak on component mount to ensure it's always current
    updateStreak();
    
    // Get user progress
    const progress = getUserProgress();
    
    // Check for today's check-in
    const today = new Date().toISOString().split('T')[0];
    const hasTodayCheckIn = progress.checkIns.some(
      checkIn => checkIn.date.split('T')[0] === today
    );

    // Check for newly achieved milestones to show toast notifications
    const recentMilestones = progress.milestones.filter(m => {
      if (!m.achieved || !m.date) return false;
      
      // Check if milestone was achieved in the last day
      const achievedDate = new Date(m.date);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      return achievedDate > oneDayAgo;
    });

    // Show toast notifications for recent milestones
    recentMilestones.forEach(milestone => {
      toast.success(`Milestone achieved: ${milestone.name}!`, {
        description: milestone.description,
        duration: 5000
      });
    });
  }, []);
  
  const { milestones } = getUserProgress();
  const upcomingMilestones = milestones
    .filter(m => !m.achieved)
    .slice(0, 3);
  
  return (
    <div className="py-20 px-4 min-h-screen bg-recovery-fun-iris">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl px-6 py-4 mb-6 shadow-md flex items-center justify-center">
          <RefreshButton className="absolute left-4" />
          <h1 className="text-3xl font-bold text-center text-purple-900">Your Recovery Journey</h1>
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
            {/* New Relapse Prediction Component */}
            <RelapsePrediction />
            
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
