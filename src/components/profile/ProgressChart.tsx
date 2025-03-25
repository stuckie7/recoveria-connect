
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useSobrietyDate } from '@/hooks/useSobrietyDate';
import { Mood, CheckIn } from '@/types';

// Helper function to convert mood to numeric value
const moodToValue = (mood: Mood): number => {
  switch (mood) {
    case 'great': return 5;
    case 'good': return 4;
    case 'okay': return 3;
    case 'bad': return 2;
    case 'terrible': return 1;
    default: return 3;
  }
};

// Create chart data from check-ins
const createChartData = (checkIns: CheckIn[], days: number = 30) => {
  // Initialize empty data array with the last 'days' dates
  const data: { date: string; mood: number; formattedDate: string }[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const dateString = date.toISOString().split('T')[0];
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    data.push({
      date: dateString,
      mood: 0, // Default value, will be updated if check-in exists
      formattedDate,
    });
  }
  
  // Fill in mood data from check-ins
  checkIns.forEach(checkIn => {
    const checkInDate = checkIn.date.split('T')[0];
    const dataPoint = data.find(d => d.date === checkInDate);
    
    if (dataPoint) {
      dataPoint.mood = moodToValue(checkIn.mood);
    }
  });
  
  return data;
};

interface ProgressChartProps {
  days?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ days = 30 }) => {
  const { progress } = useSobrietyDate();
  const chartData = createChartData(progress.checkIns, days);

  const chartConfig = {
    great: { color: "#4CAF50" },
    good: { color: "#8BC34A" },
    okay: { color: "#FFC107" },
    bad: { color: "#FF9800" },
    terrible: { color: "#F44336" },
    primary: { color: "#1E88E5" }
  };

  // Get mood text from value
  const getMoodText = (value: number): string => {
    switch(value) {
      case 5: return 'Great';
      case 4: return 'Good';
      case 3: return 'Okay';
      case 2: return 'Bad';
      case 1: return 'Terrible';
      default: return 'No data';
    }
  };

  return (
    <div className="neo-card p-5 mb-6">
      <h3 className="text-xl font-semibold mb-4">Mood & Recovery Tracking</h3>
      <p className="text-muted-foreground mb-6">
        Visualize your mood changes and recovery progress over the past {days} days.
      </p>
      
      <div className="h-80">
        <ChartContainer config={chartConfig}>
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12, fill: '#888' }} 
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 5]} 
              tick={{ fontSize: 12, fill: '#888' }} 
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value) => value > 0 ? getMoodText(value).charAt(0) : ''}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
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
              }}
            />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="#1E88E5" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#moodGradient)" 
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: '#1E88E5' }} 
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              content={() => (
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
              )}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
