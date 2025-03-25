
import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import MoodTracker from './MoodTracker';
import { Mood, Trigger } from '@/types';
import { addCheckIn, getTriggers } from '@/utils/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DailyCheckIn: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [triggers] = useState<Trigger[]>(getTriggers());
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };
  
  const handleTriggerToggle = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId)
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };
  
  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error('Please select your mood first');
      return;
    }
    
    const checkIn = {
      date: new Date().toISOString(),
      mood: selectedMood,
      triggers: selectedTriggers,
      notes: notes,
      strategies: [],
      feelingBetter: false,
    };
    
    addCheckIn(checkIn);
    
    toast.success('Daily check-in complete!', {
      description: 'Thank you for checking in today.'
    });
    
    // Reset form
    setSelectedMood(null);
    setSelectedTriggers([]);
    setNotes('');
    setIsExpanded(false);
  };
  
  // Group triggers by category
  const triggersByCategory = triggers.reduce((acc, trigger) => {
    if (!acc[trigger.category]) {
      acc[trigger.category] = [];
    }
    acc[trigger.category].push(trigger);
    return acc;
  }, {} as Record<string, Trigger[]>);
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  return (
    <div className={cn(
      "neo-card overflow-hidden transition-all duration-300 animate-fade-in",
      isExpanded ? "max-h-[800px]" : "max-h-32"
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Daily Check-in</h3>
        
        <button 
          onClick={toggleExpand}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {isExpanded ? (
            <X size={20} />
          ) : (
            <Edit3 size={20} />
          )}
        </button>
      </div>
      
      {!isExpanded ? (
        <p className="text-muted-foreground">
          How are you feeling today? Tap to check in.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Mood selector */}
          <MoodTracker 
            onMoodSelect={handleMoodSelect} 
            selectedMood={selectedMood} 
          />
          
          {/* Triggers selector */}
          <div>
            <h4 className="text-base font-medium mb-3">
              Any triggers today? (optional)
            </h4>
            
            <div className="space-y-4">
              {Object.entries(triggersByCategory).map(([category, categoryTriggers]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">
                    {formatCategoryName(category)}
                  </h5>
                  
                  <div className="flex flex-wrap gap-2">
                    {categoryTriggers.map(trigger => {
                      const isSelected = selectedTriggers.includes(trigger.id);
                      
                      return (
                        <button
                          key={trigger.id}
                          onClick={() => handleTriggerToggle(trigger.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                            isSelected
                              ? "bg-primary/20 text-primary font-medium"
                              : "bg-white shadow-sm hover:bg-primary/10"
                          )}
                        >
                          {trigger.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <h4 className="text-base font-medium mb-3">
              Anything else to note? (optional)
            </h4>
            
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
              className="neo-input w-full min-h-[100px] resize-none"
            />
          </div>
          
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            <Check size={20} className="inline mr-2" />
            Complete Check-in
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyCheckIn;
