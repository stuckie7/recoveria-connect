
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  enableReminders: boolean;
  reminderTime: number;
  frequency: string;
}

interface RecoveryData {
  notifications?: NotificationSettings;
  [key: string]: any;
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [enableReminders, setEnableReminders] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<number>(9); // Default to 9 AM
  const [frequency, setFrequency] = useState<string>("daily");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load user preferences from local storage or DB when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      // Try to load from local storage first
      const storedSettings = localStorage.getItem('notification-settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setEnableReminders(settings.enableReminders);
        setReminderTime(settings.reminderTime);
        setFrequency(settings.frequency);
        return;
      }
      
      // If no local settings, try to load from database
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('recovery_data')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        const recoveryData = data?.recovery_data as RecoveryData | null;
        
        if (recoveryData?.notifications) {
          const notifSettings = recoveryData.notifications;
          setEnableReminders(notifSettings.enableReminders);
          setReminderTime(notifSettings.reminderTime);
          setFrequency(notifSettings.frequency);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);
  
  // Save settings to local storage and DB when they change
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Save to local storage
      const settings = { enableReminders, reminderTime, frequency };
      localStorage.setItem('notification-settings', JSON.stringify(settings));
      
      // If user is logged in, save to database
      if (user) {
        const { data: existingData, error: fetchError } = await supabase
          .from('profiles')
          .select('recovery_data')
          .eq('id', user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        const recoveryData = (existingData?.recovery_data as RecoveryData) || {};
        recoveryData.notifications = settings;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            recovery_data: recoveryData 
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      }
      
      // If we got this far, show success message
      toast.success('Notification settings saved');
      
      // Request permission for browser notifications if enabled
      if (enableReminders && "Notification" in window) {
        Notification.requestPermission();
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle changes to settings, saving after each change
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveSettings();
    }, 1000); // Debounce save for 1 second
    
    return () => clearTimeout(saveTimeout);
  }, [enableReminders, reminderTime, frequency]);
  
  // Format time for display
  const formatTime = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${ampm}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-reminders" className="cursor-pointer">
          Enable Check-in Reminders
        </Label>
        <Switch 
          id="enable-reminders" 
          checked={enableReminders}
          onCheckedChange={setEnableReminders}
          disabled={isLoading}
        />
      </div>
      
      {enableReminders && (
        <>
          <div className="space-y-2">
            <Label>Reminder Time: {formatTime(reminderTime)}</Label>
            <Slider 
              min={6} 
              max={22} 
              step={1} 
              value={[reminderTime]} 
              onValueChange={([value]) => setReminderTime(value)}
              disabled={isLoading}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6 AM</span>
              <span>2 PM</span>
              <span>10 PM</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Reminder Frequency</Label>
            <RadioGroup
              value={frequency}
              onValueChange={setFrequency}
              disabled={isLoading}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">Custom (Selected days)</Label>
              </div>
            </RadioGroup>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;
