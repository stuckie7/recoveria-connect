
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserProgress } from '@/utils/storage';
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
const createChartData = (checkIns: CheckIn[], days: number = 7) => {
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

const ProgressChart: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const progress = getUserProgress();
    const data = createChartData(progress.checkIns);
    setChartData(data);
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const moodValue = payload[0].value;
      let moodText: string;
      
      switch(moodValue) {
        case 5: moodText = 'Great'; break;
        case 4: moodText = 'Good'; break;
        case 3: moodText = 'Okay'; break;
        case 2: moodText = 'Bad'; break;
        case 1: moodText = 'Terrible'; break;
        default: moodText = 'No data';
      }
      
      return (
        <div className="bg-white p-2 rounded-md shadow-md border border-gray-200 text-sm">
          <p className="font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-primary">Mood: {moodValue > 0 ? moodText : 'No data'}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="neo-card h-64 animate-fade-in">
      <h3 className="text-lg font-medium mb-4">Mood Trends</h3>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#99CFFF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#99CFFF" stopOpacity={0} />
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="mood" 
            stroke="#1E88E5" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#moodGradient)" 
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: '#1E88E5' }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
