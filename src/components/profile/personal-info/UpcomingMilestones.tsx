
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSobrietyDate } from '@/hooks/useSobrietyDate';
import { daysBetween, getUpcomingMilestones, getMilestoneDescription } from '@/utils/dates';

const UpcomingMilestones: React.FC = () => {
  const { progress } = useSobrietyDate();
  const startDate = new Date(progress.startDate);
  const currentDays = daysBetween(startDate);
  
  // Get the next 3 upcoming milestones
  const upcomingMilestones = getUpcomingMilestones(startDate, currentDays, 3);
  
  // Get milestone icon based on days
  const getMilestoneIcon = (days: number) => {
    if (days <= 30) return <Star className="h-5 w-5 text-yellow-500" />;
    if (days <= 180) return <Award className="h-5 w-5 text-blue-500" />;
    return <Award className="h-5 w-5 text-purple-500" />;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          Upcoming Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMilestones.length > 0 ? (
          <div className="space-y-4">
            {upcomingMilestones.map((milestone, index) => (
              <div 
                key={milestone.days} 
                className={cn(
                  "flex items-center p-3 rounded-lg border border-border",
                  "bg-card/50 hover:bg-card/80 transition-colors",
                  "animate-fade-in",
                  { "animate-delay-100": index === 0 },
                  { "animate-delay-200": index === 1 },
                  { "animate-delay-300": index === 2 }
                )}
              >
                <div className="mr-3 p-2 rounded-full bg-primary/10">
                  {getMilestoneIcon(milestone.days)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{getMilestoneDescription(milestone.days)}</h4>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {milestone.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: new Date().getFullYear() !== milestone.date.getFullYear() ? 'numeric' : undefined
                    })}
                  </div>
                </div>
                <div className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {milestone.days - currentDays} days left
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 bg-muted rounded-xl">
            <p className="text-muted-foreground">
              You've reached all your milestones! Amazing work!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMilestones;
