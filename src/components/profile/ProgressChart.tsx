
import React from 'react';
import { useMoodChartData } from '@/hooks/useMoodChartData';
import MoodChart from './MoodChart';

interface ProgressChartProps {
  days?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ days = 30 }) => {
  const { chartData } = useMoodChartData(days);

  return (
    <div className="neo-card p-5 mb-6">
      <h3 className="text-xl font-semibold mb-4">Mood & Recovery Tracking</h3>
      <p className="text-muted-foreground mb-6">
        Visualize your mood changes and recovery progress over the past {days} days.
      </p>
      
      <MoodChart data={chartData} />
    </div>
  );
};

export default ProgressChart;
