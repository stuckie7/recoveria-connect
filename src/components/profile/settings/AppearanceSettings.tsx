
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, Moon, PaintBucket, Check } from 'lucide-react';
import { toast } from 'sonner';

type ThemeOption = 'light' | 'dark' | 'system';
type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

interface AppearancePreferences {
  theme: ThemeOption;
  accentColor: AccentColor;
  reduceAnimations: boolean;
  useGlassmorphism: boolean;
}

interface RecoveryData {
  appearance?: AppearancePreferences;
  [key: string]: any;
}

const DEFAULT_PREFERENCES: AppearancePreferences = {
  theme: 'system',
  accentColor: 'blue',
  reduceAnimations: false,
  useGlassmorphism: true
};

const AppearanceSettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AppearancePreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Color options
  const colorOptions: {value: AccentColor, label: string, className: string}[] = [
    { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', className: 'bg-purple-500' },
    { value: 'green', label: 'Green', className: 'bg-green-500' },
    { value: 'orange', label: 'Orange', className: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', className: 'bg-pink-500' },
  ];
  
  // Load preferences when component mounts
  useEffect(() => {
    const loadAppearancePreferences = async () => {
      // First try to load from local storage
      const storedPrefs = localStorage.getItem('appearance-preferences');
      if (storedPrefs) {
        try {
          const parsedPrefs = JSON.parse(storedPrefs);
          setPreferences(parsedPrefs);
          applyTheme(parsedPrefs.theme);
          applyAccentColor(parsedPrefs.accentColor);
          return;
        } catch (error) {
          console.error('Error parsing stored preferences:', error);
        }
      }
      
      // If no local settings or error parsing, try to load from database if user is logged in
      if (user) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('recovery_data')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          const recoveryData = data?.recovery_data as RecoveryData | null;
          
          if (recoveryData?.appearance) {
            const appearancePrefs = recoveryData.appearance;
            setPreferences(appearancePrefs);
            applyTheme(appearancePrefs.theme);
            applyAccentColor(appearancePrefs.accentColor);
          } else {
            // If no preferences found, apply defaults
            applyTheme(DEFAULT_PREFERENCES.theme);
            applyAccentColor(DEFAULT_PREFERENCES.accentColor);
          }
        } catch (error) {
          console.error('Error loading appearance settings:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadAppearancePreferences();
  }, [user]);
  
  // Save preferences
  const savePreferences = async (newPreferences: AppearancePreferences) => {
    try {
      setIsLoading(true);
      
      // Save to local storage
      localStorage.setItem('appearance-preferences', JSON.stringify(newPreferences));
      
      // If user is logged in, save to database
      if (user) {
        const { data: existingData, error: fetchError } = await supabase
          .from('profiles')
          .select('recovery_data')
          .eq('id', user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        const recoveryData = (existingData?.recovery_data as RecoveryData) || {};
        recoveryData.appearance = newPreferences;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            recovery_data: recoveryData 
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast.error('Failed to save appearance settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update preferences
  const updatePreference = <K extends keyof AppearancePreferences>(
    key: K, 
    value: AppearancePreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Apply changes immediately
    if (key === 'theme') applyTheme(value as ThemeOption);
    if (key === 'accentColor') applyAccentColor(value as AccentColor);
    
    // Save changes
    savePreferences(newPreferences);
  };
  
  // Apply theme to the document
  const applyTheme = (theme: ThemeOption) => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine theme based on preference
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  };
  
  // Apply accent color
  const applyAccentColor = (color: AccentColor) => {
    const root = window.document.documentElement;
    
    // Remove existing color classes
    root.classList.remove(
      'accent-blue', 
      'accent-purple', 
      'accent-green', 
      'accent-orange', 
      'accent-pink'
    );
    
    // Add selected color class
    root.classList.add(`accent-${color}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Theme</Label>
        <ToggleGroup 
          type="single"
          value={preferences.theme}
          onValueChange={(value) => {
            if (value) updatePreference('theme', value as ThemeOption);
          }}
          className="flex justify-start"
        >
          <ToggleGroupItem value="light" aria-label="Light theme">
            <Sun size={16} className="mr-1" /> Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark theme">
            <Moon size={16} className="mr-1" /> Dark
          </ToggleGroupItem>
          <ToggleGroupItem value="system" aria-label="System theme">
            System
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {colorOptions.map((color) => (
              <Tooltip key={color.value}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => updatePreference('accentColor', color.value)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${color.className} hover:ring-2 ring-offset-2 transition-all`}
                    aria-label={`${color.label} accent color`}
                  >
                    {preferences.accentColor === color.value && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="reduce-animations" className="cursor-pointer">
            Reduce Animations
          </Label>
          <Switch 
            id="reduce-animations" 
            checked={preferences.reduceAnimations}
            onCheckedChange={(checked) => updatePreference('reduceAnimations', checked)}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="use-glassmorphism" className="cursor-pointer">
            Use Glassmorphism Effects
          </Label>
          <Switch 
            id="use-glassmorphism" 
            checked={preferences.useGlassmorphism}
            onCheckedChange={(checked) => updatePreference('useGlassmorphism', checked)}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
