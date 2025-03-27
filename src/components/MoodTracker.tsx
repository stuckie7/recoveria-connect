
import React, { useState } from 'react';
import { Smile, Frown, Meh, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Mood } from '@/types';
import { cn } from '@/lib/utils';

interface MoodOption {
  value: Mood;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const moodOptions: MoodOption[] = [
  { value: 'great', label: 'Great', icon: ThumbsUp, color: 'text-white', bgColor: 'bg-recovery-fun-leaf' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-white', bgColor: 'bg-recovery-fun-teal' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-white', bgColor: 'bg-recovery-fun-amber' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'text-white', bgColor: 'bg-recovery-fun-coral' },
  { value: 'terrible', label: 'Terrible', icon: AlertTriangle, color: 'text-white', bgColor: 'bg-recovery-fun-cherry' },
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
    <div className="rounded-xl p-6 shadow-lg animate-fade-in bg-gradient-to-br from-recovery-fun-leaf to-recovery-fun-mint">
      <h3 className="text-lg font-medium mb-4 text-white">How are you feeling today?</h3>
      
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
                  ? `${option.bgColor} shadow-lg transform scale-105 ring-2 ring-white/50`
                  : "bg-white/20 hover:bg-white/30"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "mb-2 transition-transform duration-300", 
                  option.color,
                  isSelected && "animate-pulse-soft"
                )} 
              />
              <span className="text-xs font-medium text-white">
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
