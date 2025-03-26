
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Calendar, Star } from 'lucide-react';

interface JournalStatsProps {
  totalEntries: number;
  streakDays: number;
  mostCommonMood: string;
}

const JournalStats: React.FC<JournalStatsProps> = ({
  totalEntries,
  streakDays,
  mostCommonMood
}) => {
  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'poor': return '😔';
      case 'terrible': return '😢';
      default: return '📝';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEntries}</div>
          <p className="text-xs text-muted-foreground">journal entries</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Journal Streak</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streakDays}</div>
          <p className="text-xs text-muted-foreground">days in a row</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <span className="mr-2">{getMoodEmoji(mostCommonMood)}</span>
            <span className="capitalize">{mostCommonMood || 'None'}</span>
          </div>
          <p className="text-xs text-muted-foreground">recent entries</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalStats;
