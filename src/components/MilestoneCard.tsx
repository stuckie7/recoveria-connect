
import React from 'react';
import { Calendar, Award, Star, Trophy, Crown, Medal } from 'lucide-react';
import { Milestone } from '@/types';
import { formatDate } from '@/utils/dates';
import { cn } from '@/lib/utils';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, index }) => {
  // Get the appropriate icon
  const getIcon = () => {
    switch (milestone.icon) {
      case 'star':
        return <Star size={24} className="text-yellow-500" />;
      case 'trophy':
        return <Trophy size={24} className="text-yellow-600" />;
      case 'crown':
        return <Crown size={24} className="text-yellow-500" />;
      case 'medal':
        return <Medal size={24} className="text-blue-500" />;
      case 'calendar':
        return <Calendar size={24} className="text-green-500" />;
      default:
        return <Award size={24} className="text-primary" />;
    }
  };

  return (
    <div 
      className={cn(
        "relative pb-8 pl-10 last:pb-0",
        "animate-fade-in",
        { "animate-delay-100": index === 0 },
        { "animate-delay-200": index === 1 },
        { "animate-delay-300": index === 2 },
      )}
    >
      {/* Connector line */}
      {index < 2 && <div className="timeline-connector" />}
      
      {/* Milestone dot */}
      <div className="milestone-dot">
        <span className={cn(
          "absolute w-full h-full rounded-full",
          milestone.achieved 
            ? "bg-gradient-to-r from-primary to-secondary animate-pulse-soft" 
            : "bg-muted"
        )} />
      </div>
      
      {/* Milestone card */}
      <div 
        className={cn(
          "ml-4 glass-card p-4",
          milestone.achieved 
            ? "border-primary/30" 
            : "opacity-70"
        )}
      >
        <div className="flex items-center mb-2">
          <div className="mr-2 p-1 rounded-full bg-white/70 shadow-sm">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-medium">{milestone.name}</h4>
            <p className="text-xs text-muted-foreground">{milestone.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-muted-foreground">
            {milestone.days} {milestone.days === 1 ? 'day' : 'days'}
          </div>
          
          {milestone.achieved && milestone.date && (
            <div className="text-xs bg-recovery-blue-light text-recovery-blue-dark px-2 py-1 rounded-full">
              Achieved {formatDate(milestone.date, { month: 'short', day: 'numeric' })}
            </div>
          )}
          
          {!milestone.achieved && (
            <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              Upcoming
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;
