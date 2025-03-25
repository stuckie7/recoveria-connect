
import React, { useState } from 'react';
import { AlertCircle, Phone, MessageCircle, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const EmergencySupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ripple, setRipple] = useState(false);
  
  const toggleSupport = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      // Start ripple animation
      setRipple(true);
      setTimeout(() => setRipple(false), 1000);
    }
  };
  
  return (
    <div className="fixed bottom-24 right-4 z-30">
      {/* Ripple effect */}
      {ripple && (
        <span className="absolute inset-0 bg-destructive/20 rounded-full animate-ripple"></span>
      )}
      
      {/* Main button */}
      <button
        onClick={toggleSupport}
        className={cn(
          "relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
          "transition-all duration-300 transform",
          isOpen 
            ? "bg-white rotate-45" 
            : "bg-destructive text-white hover:bg-destructive/90 pulse-animation"
        )}
      >
        {isOpen ? (
          <X size={24} className="text-destructive" />
        ) : (
          <AlertCircle size={24} />
        )}
      </button>
      
      {/* Support options */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 w-64 rounded-2xl overflow-hidden transition-all duration-300 transform origin-bottom-right",
        "glass-card shadow-lg border border-white/30",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Emergency Support</h3>
          <p className="text-sm text-foreground/70 mb-4">
            Reach out for immediate help
          </p>
          
          <div className="space-y-2">
            <a href="tel:18006624357" className="flex items-center p-3 bg-white/50 hover:bg-white/80 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-recovery-blue flex items-center justify-center text-white mr-3">
                <Phone size={20} />
              </div>
              <div>
                <div className="font-medium">Call Helpline</div>
                <div className="text-xs text-foreground/70">SAMHSA: 1-800-662-4357</div>
              </div>
            </a>
            
            <a href="sms:741741&body=HELP" className="flex items-center p-3 bg-white/50 hover:bg-white/80 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-recovery-green-dark flex items-center justify-center text-white mr-3">
                <MessageCircle size={20} />
              </div>
              <div>
                <div className="font-medium">Crisis Text Line</div>
                <div className="text-xs text-foreground/70">Text HOME to 741741</div>
              </div>
            </a>
            
            <a href="/community" className="flex items-center p-3 bg-white/50 hover:bg-white/80 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                <Users size={20} />
              </div>
              <div>
                <div className="font-medium">Community Support</div>
                <div className="text-xs text-foreground/70">Connect with peers</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySupport;
