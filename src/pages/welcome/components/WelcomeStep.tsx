
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
    <div className="glass-card p-8 animate-scale-in">
      <h2 className="text-2xl font-bold mb-4 text-center">Welcome to Recovery</h2>
      <p className="text-center mb-8">
        Your personal companion for addiction recovery, providing tools, support, and tracking to help you on your journey.
      </p>
      
      <Features />
      
      {!user ? (
        <div className="space-y-4">
          <Button
            onClick={navigateToAuth}
            className="w-full py-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
          >
            Sign Up or Login
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <Button
            onClick={handleContinue}
            variant="outline"
            className="w-full py-6"
          >
            Continue as Guest
          </Button>
        </div>
      ) : (
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
        >
          Get Started
          <ArrowRight size={18} className="ml-2" />
        </button>
      )}
    </div>
  );
};

export default WelcomeStep;
