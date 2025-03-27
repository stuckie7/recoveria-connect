
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserProgress, updateStreak } from '@/utils/storage';
import { toast } from 'sonner';
import { Award, Trash2 } from 'lucide-react';

interface CustomMilestone {
  id: string;
  title: string;
  days: number;
  description: string;
  isActive: boolean;
}

const GoalSettings: React.FC = () => {
  const { user } = useAuth();
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([]);
  const [newMilestone, setNewMilestone] = useState<Omit<CustomMilestone, 'id'>>({
    title: '',
    days: 0,
    description: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load milestones when component mounts
  useEffect(() => {
    const loadMilestones = async () => {
      // First try to load from local storage
      const storedMilestones = localStorage.getItem('custom-milestones');
      if (storedMilestones) {
        try {
          const parsedMilestones = JSON.parse(storedMilestones);
          setCustomMilestones(parsedMilestones);
          return;
        } catch (error) {
          console.error('Error parsing stored milestones:', error);
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
          
          if (data?.recovery_data?.customMilestones) {
            setCustomMilestones(data.recovery_data.customMilestones);
          }
        } catch (error) {
          console.error('Error loading custom milestones:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadMilestones();
  }, [user]);
  
  // Save milestones
  const saveMilestones = async (updatedMilestones: CustomMilestone[]) => {
    try {
      setIsLoading(true);
      
      // Save to local storage
      localStorage.setItem('custom-milestones', JSON.stringify(updatedMilestones));
      
      // If user is logged in, save to database
      if (user) {
        const { data: existingData, error: fetchError } = await supabase
          .from('profiles')
          .select('recovery_data')
          .eq('id', user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        
        const recoveryData = existingData?.recovery_data || {};
        recoveryData.customMilestones = updatedMilestones;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            recovery_data: recoveryData 
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      }
      
      // Update milestones in the progress tracker
      updateStreak();
    } catch (error) {
      console.error('Error saving custom milestones:', error);
      toast.error('Failed to save milestones');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add new milestone
  const addMilestone = () => {
    if (!newMilestone.title.trim() || newMilestone.days <= 0) {
      toast.error('Please provide a title and a valid number of days');
      return;
    }
    
    const id = `custom-${Date.now()}`;
    const milestone: CustomMilestone = {
      ...newMilestone,
      id
    };
    
    const updatedMilestones = [...customMilestones, milestone];
    setCustomMilestones(updatedMilestones);
    saveMilestones(updatedMilestones);
    
    // Reset form
    setNewMilestone({
      title: '',
      days: 0,
      description: '',
      isActive: true
    });
    
    toast.success('Milestone added successfully');
  };
  
  // Delete milestone
  const deleteMilestone = (id: string) => {
    const updatedMilestones = customMilestones.filter(m => m.id !== id);
    setCustomMilestones(updatedMilestones);
    saveMilestones(updatedMilestones);
    
    toast.success('Milestone deleted');
  };
  
  // Toggle milestone activation
  const toggleMilestone = (id: string) => {
    const updatedMilestones = customMilestones.map(m => {
      if (m.id === id) {
        return { ...m, isActive: !m.isActive };
      }
      return m;
    });
    
    setCustomMilestones(updatedMilestones);
    saveMilestones(updatedMilestones);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Create Custom Milestone</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="milestone-title">Title</Label>
            <Input 
              id="milestone-title"
              placeholder="E.g., First Month Complete"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="milestone-days">Days</Label>
            <Input 
              id="milestone-days"
              type="number"
              min="1"
              placeholder="Days to achievement"
              value={newMilestone.days || ''}
              onChange={(e) => setNewMilestone({...newMilestone, days: parseInt(e.target.value) || 0})}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="milestone-description">Description (optional)</Label>
          <Input 
            id="milestone-description"
            placeholder="E.g., One month of staying clean"
            value={newMilestone.description}
            onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
            disabled={isLoading}
          />
        </div>
        
        <Button 
          onClick={addMilestone}
          disabled={isLoading || !newMilestone.title || newMilestone.days <= 0}
        >
          Add Custom Milestone
        </Button>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Your Custom Milestones</h4>
        
        {customMilestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't created any custom milestones yet.</p>
        ) : (
          <div className="space-y-2">
            {customMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`active-${milestone.id}`}
                    checked={milestone.isActive}
                    onCheckedChange={() => toggleMilestone(milestone.id)}
                    disabled={isLoading}
                  />
                  <div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-1 text-amber-500" />
                      <span className="font-medium">{milestone.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex">
                      <span className="mr-2">{milestone.days} days</span>
                      {milestone.description && <span>- {milestone.description}</span>}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMilestone(milestone.id)}
                  disabled={isLoading}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalSettings;
