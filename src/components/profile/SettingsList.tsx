
import React from 'react';
import { Settings, AlarmClock, Award, ChevronsRight } from 'lucide-react';

const SettingsList: React.FC = () => {
  return (
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
  );
};

export default SettingsList;
