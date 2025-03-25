
import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeHeader = () => {
  return (
    <header className="pt-16 pb-8 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/80 shadow-lg backdrop-blur-sm flex items-center justify-center">
        <Sparkles size={40} className="text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-2">Phoenix</h1>
      <p className="text-lg text-muted-foreground">Your journey to wellness begins here</p>
    </header>
  );
};

export default WelcomeHeader;
