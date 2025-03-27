
import React from 'react';
import { Flame, ArrowUp } from 'lucide-react';

export const PhoenixLogo: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/80 shadow-lg backdrop-blur-sm flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center">
          <div className="relative">
            <Flame size={16} className="text-white" />
            <ArrowUp size={10} className="text-yellow-300 absolute -top-2 left-1/2 -ml-1.5 animate-float" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-bold">Phoenix</h1>
      <p className="text-muted-foreground">Your journey to wellness</p>
    </div>
  );
};
