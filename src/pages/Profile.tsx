
import React, { useState, useEffect } from 'react';
import { Calendar, Award, Sparkles, BarChart, AlarmClock, Settings, ChevronsRight, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserProgress, setSobrietyStartDate, resetAppData } from '@/utils/storage';
import { formatDate } from '@/utils/dates';
import { toast } from 'sonner';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(getUserProgress());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(progress.startDate));
  
  useEffect(() => {
    setProgress(getUserProgress());
  }, []);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setSelectedDate(date);
  };
  
  const handleSaveDate = () => {
    if (selectedDate > new Date()) {
      toast.error('Start date cannot be in the future');
      return;
    }
    
    setSobrietyStartDate(selectedDate);
    setProgress(getUserProgress());
    setIsDatePickerOpen(false);
    
    toast.success('Sobriety date updated', {
      description: `Your journey now starts from ${formatDate(selectedDate, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`
    });
  };
  
  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app data? This cannot be undone.')) {
      resetAppData();
      setProgress(getUserProgress());
      
      toast.success('App data reset', {
        description: 'All your data has been reset to default values.'
      });
    }
  };
  
  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">
          Your Profile
        </h1>
        <p className="text-muted-foreground mb-6 text-center lg:text-left">
          Manage your recovery settings and view your progress
        </p>
        
        {/* User profile card */}
        <div className="glass-card mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <AvatarUpload size="lg" />
              
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold mb-1">Your Recovery Journey</h2>
                <p className="text-muted-foreground mb-3">
                  Started on {formatDate(progress.startDate, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                
                <button 
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="text-sm text-primary flex items-center mx-auto lg:mx-0"
                >
                  <Edit2 size={14} className="mr-1" />
                  Change start date
                </button>
                
                {isDatePickerOpen && (
                  <div className="mt-4 p-4 bg-muted rounded-xl animate-fade-in">
                    <label className="text-sm font-medium block mb-2">
                      Select sobriety start date:
                    </label>
                    <input 
                      type="date" 
                      className="neo-input w-full mb-3"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={handleDateChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setIsDatePickerOpen(false)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-muted-foreground/10"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveDate}
                        className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-recovery-blue-light flex items-center justify-center mr-4">
              <Calendar size={24} className="text-recovery-blue-dark" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Current streak</h3>
              <p className="text-2xl font-bold">{progress.currentStreak} days</p>
            </div>
          </div>
          
          <div className="glass-card p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-recovery-green-light flex items-center justify-center mr-4">
              <Award size={24} className="text-recovery-green-dark" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Longest streak</h3>
              <p className="text-2xl font-bold">{progress.longestStreak} days</p>
            </div>
          </div>
          
          <div className="glass-card p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <BarChart size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Total sober days</h3>
              <p className="text-2xl font-bold">{progress.totalDaysSober} days</p>
            </div>
          </div>
          
          <div className="glass-card p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-recovery-blue-light flex items-center justify-center mr-4">
              <Sparkles size={24} className="text-recovery-blue-dark" />
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Milestones achieved</h3>
              <p className="text-2xl font-bold">
                {progress.milestones.filter(m => m.achieved).length}/{progress.milestones.length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Settings list */}
        <div className="glass-card mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings size={18} className="mr-2" />
              App Settings
            </h3>
            
            <div className="space-y-1">
              <a href="#" className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg transition-colors">
                <div className="flex items-center">
                  <AlarmClock size={18} className="mr-3 text-muted-foreground" />
                  <span>Reminders & Notifications</span>
                </div>
                <ChevronsRight size={18} className="text-muted-foreground" />
              </a>
              
              <a href="#" className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg transition-colors">
                <div className="flex items-center">
                  <Settings size={18} className="mr-3 text-muted-foreground" />
                  <span>Preferences</span>
                </div>
                <ChevronsRight size={18} className="text-muted-foreground" />
              </a>
              
              <a href="#" className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg transition-colors">
                <div className="flex items-center">
                  <Award size={18} className="mr-3 text-muted-foreground" />
                  <span>Manage Goals & Milestones</span>
                </div>
                <ChevronsRight size={18} className="text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
        
        {/* About section */}
        <div className="glass-card mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between p-2">
                <span className="text-muted-foreground">Version</span>
                <span>1.0.0</span>
              </div>
              
              <div className="flex justify-between p-2">
                <span className="text-muted-foreground">Last updated</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between p-2">
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </div>
              
              <div className="flex justify-between p-2">
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Danger zone */}
        <div className="neo-card border border-destructive/20 mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-destructive">
              Danger Zone
            </h3>
            
            <button 
              onClick={handleResetApp}
              className="w-full p-3 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              Reset All App Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
