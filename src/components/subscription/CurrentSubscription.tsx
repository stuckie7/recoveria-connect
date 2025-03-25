
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

const CurrentSubscription: React.FC = () => {
  const { subscription, isPremium, isLoading, manageSubscription } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[100px]">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subscription || !isPremium) {
    return (
      <div className="p-6 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No active subscription</h3>
        <p className="text-muted-foreground mb-4">
          You're currently on the free plan. Upgrade to premium to access all features.
        </p>
      </div>
    );
  }

  const endDate = new Date(subscription.current_period_end);
  const isCanceled = !!subscription.cancel_at;

  return (
    <div className="border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-2">Premium Subscription</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium">
            {isCanceled ? 'Canceled (access until renewal date)' : 'Active'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {isCanceled ? 'Access until:' : 'Next billing date:'}
          </span>
          <span className="font-medium">
            {format(endDate, 'MMMM d, yyyy')}
          </span>
        </div>
      </div>

      <Button
        onClick={manageSubscription}
        variant="outline"
        className="w-full"
      >
        {isCanceled ? 'Reactivate Subscription' : 'Manage Subscription'}
      </Button>
    </div>
  );
};

export default CurrentSubscription;
