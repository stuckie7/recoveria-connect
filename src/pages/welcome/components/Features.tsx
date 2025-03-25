
import React from 'react';
import { Check } from 'lucide-react';

const Features = () => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-start">
        <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Check size={14} className="text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Track Your Progress</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your sobriety streak and celebrate each milestone along the way.
          </p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Check size={14} className="text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Daily Support</h3>
          <p className="text-sm text-muted-foreground">
            Log your mood, identify triggers, and access coping strategies when you need them most.
          </p>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Check size={14} className="text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Community Connection</h3>
          <p className="text-sm text-muted-foreground">
            Connect with others on similar journeys, share experiences, and gain insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;
