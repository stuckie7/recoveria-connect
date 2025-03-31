
import { CheckIn, Mood } from '@/types';
import { useSobrietyDate } from '@/hooks/useSobrietyDate';

// Helper function to convert mood to numeric value
export const moodToValue = (mood: Mood): number => {
  switch (mood) {
    case 'great': return 5;
    case 'good': return 4;
    case 'okay': return 3;
    case 'bad': return 2;
    case 'terrible': return 1;
    default: return 3;
  }
};

// Get mood text from value
export const getMoodText = (value: number): string => {
  switch(value) {
    case 5: return 'Great';
    case 4: return 'Good';
    case 3: return 'Okay';
    case 2: return 'Bad';
    case 1: return 'Terrible';
    default: return 'No data';
  }
};

// Create chart data from check-ins
export const createChartData = (checkIns: CheckIn[], days: number = 30) => {
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

export function useMoodChartData(days: number = 30) {
  const { progress } = useSobrietyDate();
  const chartData = createChartData(progress.checkIns, days);
  
  return { chartData };
}
