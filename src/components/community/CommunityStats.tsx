
import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, User, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStatsProps {
  postCount: number;
  label?: string;
}

const CommunityStats: React.FC<CommunityStatsProps> = ({ postCount, label = 'Posts' }) => {
  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
  
  useEffect(() => {
    async function fetchUserStats() {
      try {
        setIsLoading(true);
        
        // Fetch active members count (users created in the last 30 days)
        const { data: activeData, error: activeError } = await supabase
          .rpc('get_active_users_count');
          
        if (activeError) throw activeError;
        
        // Fetch online users count (users seen in the last 15 minutes)
        const { data: onlineData, error: onlineError } = await supabase
          .rpc('get_online_users_count');
          
        if (onlineError) throw onlineError;
        
        setActiveMembersCount(activeData || 0);
        setOnlineUsersCount(onlineData || 0);
        
        // Update current user's presence
        if (supabase.auth.getUser) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Update or insert user's presence
            await supabase
              .from('user_presence')
              .upsert({ 
                id: user.id, 
                last_seen: new Date().toISOString(),
                is_online: true
              });
          }
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserStats();
    
    // Set up a timer to periodically update the user's presence and fetch stats
    const presenceInterval = setInterval(() => {
      fetchUserStats();
    }, 60000); // Update every minute
    
    return () => {
      clearInterval(presenceInterval);
    };
  }, []);

  // Helper function to display counts with animations
  const displayCount = (count: number, isLoading: boolean) => {
    if (isLoading) {
      return <span className="animate-pulse">...</span>;
    }
    return <span className="animate-in fade-in duration-300">{count.toLocaleString()}</span>;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="glass-card p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-recovery-blue flex items-center justify-center mr-3">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium">Active Members</h4>
          <p className="text-2xl font-semibold">{displayCount(activeMembersCount, isLoading)}</p>
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
          <p className="text-2xl font-semibold">{displayCount(onlineUsersCount, isLoading)}</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
