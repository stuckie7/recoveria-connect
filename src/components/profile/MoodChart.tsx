
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Legend
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { getMoodText } from '@/hooks/useMoodChartData';
import { MoodChartTooltip, MoodChartLegend, getMoodChartConfig } from './MoodChartConfig';

interface MoodChartProps {
  data: any[];
}

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  const chartConfig = getMoodChartConfig();

  return (
    <div className="h-80">
      <ChartContainer config={chartConfig}>
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
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
          <ChartTooltip content={<MoodChartTooltip />} />
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
            content={() => <MoodChartLegend />}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default MoodChart;
