
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useSobrietyDate } from '@/hooks/useSobrietyDate';

// Helper function to create streak data for visualization
const createStreakData = (currentStreak: number, longestStreak: number) => {
  return [
    { name: 'Current', streak: currentStreak },
    { name: 'Longest', streak: longestStreak }
  ];
};

const StreakChart: React.FC = () => {
  const { progress } = useSobrietyDate();
  const streakData = createStreakData(progress.currentStreak, progress.longestStreak);
  
  const chartConfig = {
    current: { color: "#1E88E5" },
    longest: { color: "#4CAF50" },
  };

  return (
    <div className="neo-card p-5 mb-6">
      <h3 className="text-xl font-semibold mb-4">Streak Comparison</h3>
      <p className="text-muted-foreground mb-6">Compare your current streak with your longest streak.</p>
      
      <div className="h-64">
        <ChartContainer config={chartConfig}>
          <BarChart data={streakData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} days`, 'Duration']}
              itemStyle={{ color: '#1E88E5' }}
            />
            <Bar 
              dataKey="streak" 
              fill="#1E88E5" 
              radius={[4, 4, 0, 0]} 
              barSize={60}
              animationDuration={1000}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default StreakChart;
