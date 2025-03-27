
import React, { useState } from 'react';
import { 
  Settings, 
  AlarmClock, 
  Award, 
  ChevronsRight, 
  Sun, 
  Moon, 
  Palette 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import NotificationSettings from './settings/NotificationSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import GoalSettings from './settings/GoalSettings';

const SettingsList: React.FC = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  return (
    <div className="glass-card mb-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings size={18} className="mr-2" />
          App Settings
        </h3>
        
        <div className="space-y-2">
          <Collapsible 
            open={openSection === 'notifications'} 
            onOpenChange={() => toggleSection('notifications')}
            className="w-full"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center">
                <AlarmClock size={18} className="mr-3 text-muted-foreground" />
                <span>Reminders & Notifications</span>
              </div>
              <ChevronsRight 
                size={18} 
                className={`text-muted-foreground transition-transform duration-200 ${openSection === 'notifications' ? 'rotate-90' : ''}`} 
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-2 pb-3">
              <NotificationSettings />
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible 
            open={openSection === 'appearance'} 
            onOpenChange={() => toggleSection('appearance')}
            className="w-full"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center">
                <Palette size={18} className="mr-3 text-muted-foreground" />
                <span>Appearance</span>
              </div>
              <ChevronsRight 
                size={18} 
                className={`text-muted-foreground transition-transform duration-200 ${openSection === 'appearance' ? 'rotate-90' : ''}`} 
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-2 pb-3">
              <AppearanceSettings />
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible 
            open={openSection === 'goals'} 
            onOpenChange={() => toggleSection('goals')}
            className="w-full"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center">
                <Award size={18} className="mr-3 text-muted-foreground" />
                <span>Manage Goals & Milestones</span>
              </div>
              <ChevronsRight 
                size={18} 
                className={`text-muted-foreground transition-transform duration-200 ${openSection === 'goals' ? 'rotate-90' : ''}`} 
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-2 pb-3">
              <GoalSettings />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default SettingsList;
