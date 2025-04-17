
import React, { useState } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const { 
    plans, 
    subscription, 
    isPremium, 
    isLoading, 
    isRefreshing,
    subscribe, 
    manageSubscription,
    refreshSubscription 
  } = useSubscription();
  
  const [processingPriceId, setProcessingPriceId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast.error('You must be logged in to subscribe');
      return;
    }
    
    setProcessingPriceId(priceId);
    
    try {
      // Make sure we're passing the actual Stripe price ID
      console.log("Subscribing with price ID:", priceId);
      await subscribe(priceId);
      // Note: We don't need to handle success here as the user will be redirected to Stripe
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Error starting subscription process. Please try again later.');
    } finally {
      setProcessingPriceId(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('You must be logged in to manage your subscription');
      return;
    }
    
    const portalUrl = await manageSubscription();
    if (!portalUrl) {
      toast.error('Failed to open subscription management portal');
    }
  };

  const handleRefreshSubscription = () => {
    refreshSubscription();
    toast.info('Refreshing subscription status...');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Subscription Plans</h2>
          <p className="text-muted-foreground">
            Choose the plan that best fits your recovery journey
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshSubscription}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {subscription && (
        <div className="glass-card p-4 border-l-4 border-primary">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Current Subscription</h3>
              <p className="text-sm text-muted-foreground">
                {isPremium ? 'Premium plan active' : 'Basic plan'}
              </p>
            </div>
            {isPremium && (
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrentPlan = subscription && isPremium && plan.name === 'Premium';
          const isFree = plan.price === 0;
          const isProcessing = processingPriceId === plan.stripe_price_id;
          
          return (
            <div 
              key={plan.id} 
              className={`
                relative rounded-lg border p-6 shadow-sm transition-all
                ${isCurrentPlan ? 'border-primary/70 bg-primary/5' : ''}
              `}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-0 right-0">
                  <div className="mx-auto w-fit px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                    Current Plan
                  </div>
                </div>
              )}
              
              <div className="mb-5">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              
              <div className="mb-5">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              
              <ul className="mb-7 space-y-2.5 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check size={18} className="mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                
                {plan.name === 'Basic' && (
                  <li className="flex items-center text-muted-foreground">
                    <X size={18} className="mr-2 text-red-500" />
                    <span>Premium features not available</span>
                  </li>
                )}
              </ul>
              
              <Button
                className="w-full"
                variant={plan.name === 'Premium' ? 'default' : 'outline'}
                onClick={() => isFree ? null : handleSubscribe(plan.stripe_price_id)}
                disabled={isCurrentPlan || (isFree && !isPremium) || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                  </>
                ) : isCurrentPlan 
                  ? 'Current Plan' 
                  : isFree 
                    ? (isPremium ? 'Downgrade to Free' : 'Free Plan') 
                    : 'Subscribe'}
              </Button>
              
              {plan.stripe_price_id && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  {plan.stripe_price_id}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
