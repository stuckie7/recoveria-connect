
import React, { useState } from 'react';
import { Edit3, Check, X, Moon, Battery, Dumbbell, Heart } from 'lucide-react';
import MoodTracker from './MoodTracker';
import { Mood, SleepQuality, EnergyLevel, Activity } from '@/types';
import { addCheckIn, getTriggers } from '@/utils/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DailyCheckIn: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [triggers] = useState(getTriggers());
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityType, setActivityType] = useState<Activity['type']>('meditation');
  const [activityDuration, setActivityDuration] = useState<number>(15);
  const [activityNotes, setActivityNotes] = useState('');

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

  const handleAddActivity = () => {
    const newActivity: Activity = {
      type: activityType,
      durationMinutes: activityDuration,
      notes: activityNotes.trim() || undefined
    };
    
    setActivities(prev => [...prev, newActivity]);
    setActivityType('meditation');
    setActivityDuration(15);
    setActivityNotes('');
    
    toast.success(`${newActivity.type} activity added`);
  };

  const removeActivity = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error('Please select your mood first');
      return;
    }
    
    const checkIn = {
      date: new Date().toISOString(),
      mood: selectedMood,
      sleepQuality: sleepQuality || undefined,
      energyLevel: energyLevel || undefined,
      activities: activities.length > 0 ? activities : undefined,
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
    setSleepQuality(null);
    setEnergyLevel(null);
    setActivities([]);
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
  }, {} as Record<string, typeof triggers>);
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Helper function to render the sleep quality selector
  const renderSleepQualitySelector = () => {
    const options: {value: SleepQuality, label: string, color: string}[] = [
      { value: 'excellent', label: 'Excellent', color: 'bg-green-500' },
      { value: 'good', label: 'Good', color: 'bg-green-300' },
      { value: 'fair', label: 'Fair', color: 'bg-yellow-300' },
      { value: 'poor', label: 'Poor', color: 'bg-orange-300' },
      { value: 'terrible', label: 'Terrible', color: 'bg-red-400' },
    ];

    return (
      <div className="flex justify-between mt-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => setSleepQuality(option.value)}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-all",
              sleepQuality === option.value ? "ring-2 ring-primary scale-105" : "hover:bg-muted"
            )}
          >
            <div className={cn("w-6 h-6 rounded-full mb-1", option.color)}></div>
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Helper function to render the energy level selector
  const renderEnergyLevelSelector = () => {
    const options: {value: EnergyLevel, label: string, icon: any, percentage: number}[] = [
      { value: 'high', label: 'High', icon: Battery, percentage: 90 },
      { value: 'medium', label: 'Medium', icon: Battery, percentage: 60 },
      { value: 'low', label: 'Low', icon: Battery, percentage: 30 },
      { value: 'depleted', label: 'Depleted', icon: Battery, percentage: 10 },
    ];

    return (
      <div className="flex justify-between mt-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => setEnergyLevel(option.value)}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-all",
              energyLevel === option.value ? "ring-2 ring-primary scale-105" : "hover:bg-muted"
            )}
          >
            <option.icon className={cn(
              "w-6 h-6 mb-1",
              option.percentage > 70 ? "text-green-500" :
              option.percentage > 40 ? "text-yellow-500" :
              "text-red-500"
            )} />
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className={cn(
      "neo-card overflow-hidden transition-all duration-300 animate-fade-in",
      isExpanded ? "max-h-[1200px]" : "max-h-32"
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
          <Tabs defaultValue="mood">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mood" className="mt-4">
              {/* Mood selector */}
              <h4 className="text-base font-medium mb-3">
                How are you feeling today?
              </h4>
              <MoodTracker 
                onMoodSelect={handleMoodSelect} 
                selectedMood={selectedMood} 
              />
              
              {/* Notes */}
              <div className="mt-6">
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
            </TabsContent>
            
            <TabsContent value="physical" className="mt-4 space-y-6">
              {/* Sleep quality */}
              <div>
                <h4 className="text-base font-medium mb-2 flex items-center">
                  <Moon size={18} className="mr-2 text-primary" />
                  Sleep Quality
                </h4>
                <p className="text-sm text-muted-foreground mb-2">How well did you sleep last night?</p>
                {renderSleepQualitySelector()}
              </div>
              
              {/* Energy level */}
              <div>
                <h4 className="text-base font-medium mb-2 flex items-center">
                  <Battery size={18} className="mr-2 text-primary" />
                  Energy Level
                </h4>
                <p className="text-sm text-muted-foreground mb-2">How energetic do you feel today?</p>
                {renderEnergyLevelSelector()}
              </div>
            </TabsContent>
            
            <TabsContent value="triggers" className="mt-4">
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
            </TabsContent>
            
            <TabsContent value="activities" className="mt-4">
              <h4 className="text-base font-medium mb-3 flex items-center">
                <Dumbbell size={18} className="mr-2 text-primary" />
                Activities Completed
              </h4>
              
              {/* Activity form */}
              <div className="glass-card p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Type
                    </label>
                    <select
                      value={activityType}
                      onChange={e => setActivityType(e.target.value as Activity['type'])}
                      className="neo-input w-full"
                    >
                      <option value="meditation">Meditation</option>
                      <option value="exercise">Exercise</option>
                      <option value="therapy">Therapy</option>
                      <option value="group">Support Group</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={activityDuration}
                      onChange={e => setActivityDuration(parseInt(e.target.value) || 0)}
                      className="neo-input w-full"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={activityNotes}
                    onChange={e => setActivityNotes(e.target.value)}
                    placeholder="E.g., Morning jog, Yoga session, etc."
                    className="neo-input w-full"
                  />
                </div>
                
                <button
                  onClick={handleAddActivity}
                  className="w-full py-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors"
                >
                  Add Activity
                </button>
              </div>
              
              {/* Activity list */}
              {activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <div className="font-medium capitalize">{activity.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.durationMinutes} minutes
                          {activity.notes && ` - ${activity.notes}`}
                        </div>
                      </div>
                      <button
                        onClick={() => removeActivity(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-muted rounded-lg text-muted-foreground">
                  No activities added yet
                </div>
              )}
            </TabsContent>
          </Tabs>
          
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
