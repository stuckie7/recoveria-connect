
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string | number;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
  suffix = ''
}) => {
  return (
    <div className="glass-card p-5 flex items-center">
      <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center mr-4`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div>
        <h3 className="text-sm text-muted-foreground">{label}</h3>
        <p className="text-2xl font-bold">
          {value}{suffix && ` ${suffix}`}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
