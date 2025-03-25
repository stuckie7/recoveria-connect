
import React, { useState } from 'react';
import { Smile, Frown, Meh, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Mood } from '@/types';
import { cn } from '@/lib/utils';

interface MoodOption {
  value: Mood;
  label: string;
  icon: React.ElementType;
  color: string;
}

const moodOptions: MoodOption[] = [
  { value: 'great', label: 'Great', icon: ThumbsUp, color: 'text-recovery-green-dark bg-recovery-green-light' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-green-500 bg-green-50' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-blue-500 bg-blue-50' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-500 bg-orange-50' },
  { value: 'terrible', label: 'Terrible', icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
];

interface MoodTrackerProps {
  onMoodSelect?: (mood: Mood) => void;
  selectedMood?: Mood | null;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  onMoodSelect,
  selectedMood = null,
}) => {
  const [selected, setSelected] = useState<Mood | null>(selectedMood);
  
  const handleMoodSelect = (mood: Mood) => {
    setSelected(mood);
    if (onMoodSelect) {
      onMoodSelect(mood);
    }
  };
  
  return (
    <div className="neo-card animate-fade-in">
      <h3 className="text-lg font-medium mb-4">How are you feeling today?</h3>
      
      <div className="grid grid-cols-5 gap-2">
        {moodOptions.map((option) => {
          const isSelected = selected === option.value;
          const Icon = option.icon;
          
          return (
            <button
              key={option.value}
              onClick={() => handleMoodSelect(option.value)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300",
                isSelected
                  ? `${option.color} shadow-lg transform scale-105`
                  : "bg-white shadow-neo hover:bg-gray-50"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "mb-2 transition-transform duration-300", 
                  isSelected && "animate-pulse-soft"
                )} 
              />
              <span className={cn(
                "text-xs font-medium", 
                isSelected ? "text-current" : "text-gray-600"
              )}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodTracker;
