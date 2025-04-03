
import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { getMilestoneDescription } from '@/utils/dates';

interface NextMilestoneProps {
  milestone: { days: number; date: Date } | null;
}

const NextMilestone: React.FC<NextMilestoneProps> = ({ milestone }) => {
  if (!milestone) return null;
  
  return (
    <div className="mt-6 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-recovery-purple-light to-recovery-blue-light p-4 text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp size={16} className="mr-2 text-recovery-purple-dark" />
          <h3 className="text-sm font-medium text-recovery-purple-dark">Next Milestone</h3>
        </div>
        <p className="text-xl font-bold text-recovery-purple-dark">{getMilestoneDescription(milestone.days)}</p>
        <div className="flex items-center justify-center mt-2 text-sm text-recovery-blue-dark">
          <Calendar size={14} className="mr-1" />
          <span>
            {milestone.date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: milestone.date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NextMilestone;
