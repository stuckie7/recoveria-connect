// Solution for integrating the syncMilestonesWithProfile function
// This modified version of UpcomingMilestones.tsx ensures milestones are synced with the user's profile

import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { getUserProgress } from '@/utils/storage';
import { syncMilestonesWithProfile } from '@/utils/storage/userProgress/milestones';
import { useAuth } from '@/contexts/AuthContext';
import { Milestone } from '@/types';

const UpcomingMilestones: React.FC = () => {
  const [upcomingMilestones, setUpcomingMilestones] = useState<Milestone[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadMilestones = async () => {
      // If user is logged in, sync milestones with profile first
      if (user) {
        const syncedMilestones = await syncMilestonesWithProfile(user.id);
        if (syncedMilestones) {
          // Filter for upcoming milestones
          const upcoming = syncedMilestones.filter(m => !m.achieved).slice(0, 3);
          setUpcomingMilestones(upcoming);
          return;
        }
      }
      
      // Fallback to local storage if sync fails or user not logged in
      const progress = getUserProgress();
      const upcoming = progress.milestones.filter(m => !m.achieved).slice(0, 3);
      setUpcomingMilestones(upcoming);
    };

    loadMilestones();
  }, [user]);

  if (upcomingMilestones.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Upcoming Milestones</h3>
      <div className="space-y-3">
        {upcomingMilestones.map((milestone) => (
          <div key={milestone.id} className="flex items-center p-3 bg-muted rounded-lg">
            <div className="mr-3 p-2 bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{milestone.name}</p>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMilestones;
