
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Features from './Features';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeStepProps {
  handleContinue: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ handleContinue }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="fun-card fun-card-teal animate-scale-in">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Welcome to Recovery</h2>
      <p className="text-center mb-8 text-white/90">
        Your personal companion for addiction recovery, providing tools, support, and tracking to help you on your journey.
      </p>
      
      <Features />
      
      {!user ? (
        <div className="space-y-4">
          <Button
            onClick={navigateToAuth}
            className="w-full py-6 rounded-xl bg-white text-recovery-fun-teal font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
          >
            Sign Up or Login
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <Button
            onClick={handleContinue}
            variant="outline"
            className="w-full py-6 border-white text-white hover:bg-white/20"
          >
            Continue as Guest
          </Button>
        </div>
      ) : (
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl bg-white text-recovery-fun-teal font-medium flex items-center justify-center shadow-lg hover:bg-white/90 transition-all"
        >
          Get Started
          <ArrowRight size={18} className="ml-2" />
        </button>
      )}
    </div>
  );
};

export default WelcomeStep;
