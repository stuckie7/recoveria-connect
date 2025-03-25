
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const { plans, subscription, isPremium, isLoading, subscribe } = useSubscription();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast.error('You must be logged in to subscribe');
      return;
    }
    
    // For premium plan, always use the hardcoded price ID
    const finalPriceId = priceId === "price_premium" ? "price_1R6NsyE99jBtZ4QEdVq5iGuA" : priceId;
    
    const checkoutUrl = await subscribe(finalPriceId);
    if (!checkoutUrl) {
      toast.error('Failed to start subscription process');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no plans are loaded, create default plans
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Free tier with limited features',
      price: 0,
      interval: 'month',
      features: ['Basic recovery tracking', 'Daily check-ins', 'Community access'],
      stripe_price_id: ''
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Full access to all recovery tools',
      price: 9.99,
      interval: 'month',
      features: [
        'Everything in Basic',
        'Advanced analytics',
        'Personalized recommendations',
        'Trigger tracking',
        'Premium resources',
        'Priority support'
      ],
      stripe_price_id: 'price_1R6NsyE99jBtZ4QEdVq5iGuA'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your recovery journey
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {displayPlans.map((plan) => {
          const isCurrentPlan = subscription && isPremium && plan.name === 'Premium';
          const isFree = plan.price === 0;
          
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
                disabled={isCurrentPlan || (isFree && !isPremium)}
              >
                {isCurrentPlan 
                  ? 'Current Plan' 
                  : isFree 
                    ? (isPremium ? 'Downgrade to Free' : 'Free Plan') 
                    : 'Subscribe'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
