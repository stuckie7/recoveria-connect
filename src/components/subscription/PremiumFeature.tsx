
import React from 'react';
import { Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({ 
  children, 
  fallback 
}) => {
  const { isPremium, isLoading } = useSubscription();
  const navigate = useNavigate();

  // Allow access if loading to prevent UI flashing
  if (isLoading) {
    return <>{children}</>;
  }

  // If the user has premium access, show the content
  if (isPremium) {
    return <>{children}</>;
  }

  // If a fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default premium restriction UI
  return (
    <div className="p-6 border rounded-lg bg-muted/30 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Premium Feature</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This feature is available exclusively to premium subscribers. 
          Upgrade now to access all premium features.
        </p>
        <Button
          onClick={() => navigate('/profile?tab=subscription')}
          className="mt-2"
        >
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
};

export default PremiumFeature;
