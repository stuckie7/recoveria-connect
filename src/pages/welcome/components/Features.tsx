
import React from 'react';
import { Check } from 'lucide-react';

const Features = () => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-start">
        <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white">Track Your Progress</h3>
          <p className="text-sm text-white/80">
            Monitor your sobriety streak and celebrate each milestone along the way.
          </p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white">Daily Support</h3>
          <p className="text-sm text-white/80">
            Log your mood, identify triggers, and access coping strategies when you need them most.
          </p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white">Community Connection</h3>
          <p className="text-sm text-white/80">
            Connect with others on similar journeys, share experiences, and gain insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;
