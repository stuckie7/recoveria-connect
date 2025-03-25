
import React from 'react';
import { Users, MessageSquare, User, Trophy } from 'lucide-react';

interface CommunityStatsProps {
  postCount: number;
  label?: string;  // This optional label prop is already defined
}

const CommunityStats: React.FC<CommunityStatsProps> = ({ postCount, label = 'Posts' }) => {
  // Determine which icon to show based on the label
  let LabelIcon = MessageSquare;
  let bgColor = "bg-recovery-green-dark";
  
  if (label.toLowerCase().includes('question')) {
    LabelIcon = MessageSquare;
    bgColor = "bg-recovery-green-dark";
  } else if (label.toLowerCase().includes('achievement')) {
    LabelIcon = Trophy;
    bgColor = "bg-amber-500";
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="glass-card p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-recovery-blue flex items-center justify-center mr-3">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium">Active Members</h4>
          <p className="text-2xl font-semibold">3,298</p>
        </div>
      </div>
      
      <div className="glass-card p-4 flex items-center">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
          <LabelIcon size={20} className="text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium">{label}</h4>
          <p className="text-2xl font-semibold">{postCount || '0'}</p>
        </div>
      </div>
      
      <div className="glass-card p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium">Online Now</h4>
          <p className="text-2xl font-semibold">324</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
