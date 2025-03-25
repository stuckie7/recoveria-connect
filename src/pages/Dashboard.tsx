
import React, { useEffect } from 'react';
import { getUserProgress, updateStreak } from '@/utils/storage';
import SobrietyCounter from '@/components/SobrietyCounter';
import MoodTracker from '@/components/MoodTracker';
import ProgressChart from '@/components/ProgressChart';
import DailyCheckIn from '@/components/DailyCheckIn';
import CommunityPreview from '@/components/CommunityPreview';
import EmergencySupport from '@/components/EmergencySupport';
import MilestoneCard from '@/components/MilestoneCard';

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
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center lg:text-left">Your Recovery Journey</h1>
        
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
            
            {/* Upcoming milestones */}
            <div className="neo-card">
              <h3 className="text-lg font-medium mb-6">Upcoming Milestones</h3>
              
              {upcomingMilestones.length > 0 ? (
                <div className="space-y-2">
                  {upcomingMilestones.map((milestone, index) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 bg-muted rounded-xl">
                  <p className="text-muted-foreground">
                    You've reached all your milestones! Amazing work!
                  </p>
                </div>
              )}
            </div>
            
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
