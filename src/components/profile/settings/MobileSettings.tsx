
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MobileSettings: React.FC = () => {
  const { user } = useAuth();
  const [enableOfflineMode, setEnableOfflineMode] = useState<boolean>(true);
  const [enablePushNotifications, setEnablePushNotifications] = useState<boolean>(true);
  const [enableBackgroundSync, setEnableBackgroundSync] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load user preferences from local storage or DB when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      // Try to load from local storage first
      const storedSettings = localStorage.getItem('mobile-settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setEnableOfflineMode(settings.enableOfflineMode);
        setEnablePushNotifications(settings.enablePushNotifications);
        setEnableBackgroundSync(settings.enableBackgroundSync);
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
        
        if (data?.recovery_data?.mobile) {
          const mobileSettings = data.recovery_data.mobile;
          setEnableOfflineMode(mobileSettings.enableOfflineMode ?? true);
          setEnablePushNotifications(mobileSettings.enablePushNotifications ?? true);
          setEnableBackgroundSync(mobileSettings.enableBackgroundSync ?? true);
        }
      } catch (error) {
        console.error('Error loading mobile settings:', error);
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
      const settings = { 
        enableOfflineMode, 
        enablePushNotifications, 
        enableBackgroundSync 
      };
      localStorage.setItem('mobile-settings', JSON.stringify(settings));
      
      // If user is logged in, save to database
      if (user) {
        const { data: existingData, error: fetchError } = await supabase
          .from('profiles')
          .select('recovery_data')
          .eq('id', user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        const recoveryData = existingData?.recovery_data || {};
        recoveryData.mobile = settings;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            recovery_data: recoveryData 
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      }
      
      // If we got this far, show success message
      toast.success('Mobile settings saved');
      
    } catch (error) {
      console.error('Error saving mobile settings:', error);
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
  }, [enableOfflineMode, enablePushNotifications, enableBackgroundSync]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-offline" className="cursor-pointer">
          Enable Offline Mode
        </Label>
        <Switch 
          id="enable-offline" 
          checked={enableOfflineMode}
          onCheckedChange={setEnableOfflineMode}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-push" className="cursor-pointer">
          Enable Push Notifications
        </Label>
        <Switch 
          id="enable-push" 
          checked={enablePushNotifications}
          onCheckedChange={setEnablePushNotifications}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-background" className="cursor-pointer">
          Background Data Sync
        </Label>
        <Switch 
          id="enable-background" 
          checked={enableBackgroundSync}
          onCheckedChange={setEnableBackgroundSync}
          disabled={isLoading}
        />
      </div>
      
      <div className="text-sm text-muted-foreground mt-4">
        <p>These settings control how the app behaves when installed as a mobile application.</p>
        <p className="mt-2">Offline Mode allows you to use the app without an internet connection. Push Notifications send alerts even when the app is closed. Background Sync keeps your data updated automatically.</p>
      </div>
    </div>
  );
};

export default MobileSettings;
