
import React from 'react';
import { getMoodText } from '@/hooks/useMoodChartData';

// Chart configuration object for mood colors and settings
export const getMoodChartConfig = () => {
  return {
    great: { color: "#4CAF50" },
    good: { color: "#8BC34A" },
    okay: { color: "#FFC107" },
    bad: { color: "#FF9800" },
    terrible: { color: "#F44336" },
    primary: { color: "#1E88E5" }
  };
};

// Custom tooltip component for the mood chart
export const MoodChartTooltip: React.FC<{ 
  active?: boolean; 
  payload?: any[];
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value as number;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
        <p className="font-medium">{payload[0].payload.formattedDate}</p>
        <p className="text-primary">Mood: {moodValue > 0 ? getMoodText(moodValue) : 'No data'}</p>
      </div>
    );
  }
  return null;
};

// Legend component for the mood chart
export const MoodChartLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 justify-center text-xs mt-2">
      {[5, 4, 3, 2, 1].map((value) => (
        <div key={value} className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{
              backgroundColor: value === 5 ? '#4CAF50' :
                              value === 4 ? '#8BC34A' :
                              value === 3 ? '#FFC107' :
                              value === 2 ? '#FF9800' : '#F44336'
            }}
          />
          <span>{getMoodText(value)}</span>
        </div>
      ))}
    </div>
  );
};
