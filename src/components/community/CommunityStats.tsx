
import React from 'react';
import { Users, MessageSquare, User } from 'lucide-react';

interface CommunityStatsProps {
  postCount: number;
  label?: string;  // Added this optional label prop
}

const CommunityStats: React.FC<CommunityStatsProps> = ({ postCount, label = 'Discussions' }) => {
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
        <div className="w-10 h-10 rounded-full bg-recovery-green-dark flex items-center justify-center mr-3">
          <MessageSquare size={20} className="text-white" />
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
