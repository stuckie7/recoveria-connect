
import React from 'react';
import { Edit2 } from 'lucide-react';
import { formatDate } from '@/utils/dates';
import AvatarUpload from '@/components/profile/AvatarUpload';

interface ProfileHeaderProps {
  startDate: Date;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  startDate,
  isDatePickerOpen,
  setIsDatePickerOpen
}) => {
  return (
    <div className="glass-card mb-6">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <AvatarUpload size="lg" />
          
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold mb-1">Your Recovery Journey</h2>
            <p className="text-muted-foreground mb-3">
              Started on {formatDate(startDate, { 
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
