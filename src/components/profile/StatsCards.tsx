
import React from 'react';
import { Calendar, Award, BarChart, Sparkles } from 'lucide-react';
import { UserProgress } from '@/utils/storage';

interface StatsCardsProps {
  progress: UserProgress;
}

const StatsCards: React.FC<StatsCardsProps> = ({ progress }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="glass-card p-5 flex items-center">
        <div className="w-12 h-12 rounded-full bg-recovery-blue-light flex items-center justify-center mr-4">
          <Calendar size={24} className="text-recovery-blue-dark" />
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Current streak</h3>
          <p className="text-2xl font-bold">{progress.currentStreak} days</p>
        </div>
      </div>
      
      <div className="glass-card p-5 flex items-center">
        <div className="w-12 h-12 rounded-full bg-recovery-green-light flex items-center justify-center mr-4">
          <Award size={24} className="text-recovery-green-dark" />
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Longest streak</h3>
          <p className="text-2xl font-bold">{progress.longestStreak} days</p>
        </div>
      </div>
      
      <div className="glass-card p-5 flex items-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
          <BarChart size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Total sober days</h3>
          <p className="text-2xl font-bold">{progress.totalDaysSober} days</p>
        </div>
      </div>
      
      <div className="glass-card p-5 flex items-center">
        <div className="w-12 h-12 rounded-full bg-recovery-blue-light flex items-center justify-center mr-4">
          <Sparkles size={24} className="text-recovery-blue-dark" />
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Milestones achieved</h3>
          <p className="text-2xl font-bold">
            {progress.milestones.filter(m => m.achieved).length}/{progress.milestones.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
