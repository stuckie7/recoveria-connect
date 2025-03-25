
import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeHeader = () => {
  return (
    <header className="pt-20 pb-12 text-center relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 -z-10 rounded-b-[50%] blur-xl"></div>
      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center transform hover:rotate-3 transition-all duration-300">
        <Sparkles size={48} className="text-white" />
      </div>
      <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Phoenix</h1>
      <p className="text-xl text-muted-foreground max-w-md mx-auto">Your journey to wellness begins here</p>
    </header>
  );
};

export default WelcomeHeader;
