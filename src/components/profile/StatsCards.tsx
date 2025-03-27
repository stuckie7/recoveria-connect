
import React from 'react';
import { Calendar, Award, BarChart, Sparkles } from 'lucide-react';
import { UserProgress } from '@/types';
import StatCard from './StatCard';

interface StatsCardsProps {
  progress: UserProgress;
}

const StatsCards: React.FC<StatsCardsProps> = ({ progress }) => {
  // Calculate number of achieved milestones
  const achievedMilestones = progress.milestones.filter(m => m.achieved).length;
  const totalMilestones = progress.milestones.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <StatCard 
        icon={Calendar}
        iconColor="text-recovery-blue-dark"
        iconBgColor="bg-recovery-blue-light"
        label="Current streak"
        value={progress.currentStreak}
        suffix="days"
      />
      
      <StatCard 
        icon={Award}
        iconColor="text-recovery-green-dark"
        iconBgColor="bg-recovery-green-light"
        label="Longest streak"
        value={progress.longestStreak}
        suffix="days"
      />
      
      <StatCard 
        icon={BarChart}
        iconColor="text-primary"
        iconBgColor="bg-primary/20"
        label="Total sober days"
        value={progress.totalDaysSober}
        suffix="days"
      />
      
      <StatCard 
        icon={Sparkles}
        iconColor="text-recovery-blue-dark"
        iconBgColor="bg-recovery-blue-light"
        label="Milestones achieved"
        value={`${achievedMilestones}/${totalMilestones}`}
      />
    </div>
  );
};

export default StatsCards;
