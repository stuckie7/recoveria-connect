
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, Subscription, getSubscriptionPlans, getUserSubscription, checkPremiumAccess, createCheckoutSession, createPortalSession } from '@/services/subscription';
import { toast } from 'sonner';

export const useSubscription = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch plans on initial load
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getSubscriptionPlans();
        setPlans(plans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans', {
          description: 'Please refresh the page to try again.'
        });
      }
    };

    fetchPlans();
  }, []);

  // Fetch user's subscription status when user changes
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [userSubscription, hasPremiumAccess] = await Promise.all([
          getUserSubscription(user.id),
          checkPremiumAccess(user.id)
        ]);

        setSubscription(userSubscription);
        setIsPremium(hasPremiumAccess);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast.error('Error loading subscription data', {
          description: 'Please refresh to try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSubscription();
  }, [user]);

  // Function to refresh subscription data manually
  const refreshSubscription = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const [userSubscription, hasPremiumAccess] = await Promise.all([
        getUserSubscription(user.id),
        checkPremiumAccess(user.id)
      ]);

      setSubscription(userSubscription);
      setIsPremium(hasPremiumAccess);
      toast.success('Subscription data refreshed');
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
      toast.error('Error refreshing subscription data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to initiate subscription
  const subscribe = async (priceId: string) => {
    if (!user) {
      toast.error('You must be logged in to subscribe');
      return null;
    }
    
    try {
      // The URL to return to after checkout
      const returnUrl = `${window.location.origin}/profile?tab=subscription`;
      console.log(`Creating checkout session with price ID: ${priceId}`);
      
      // Add more detailed logging for debugging
      console.log('User ID:', user.id);
      console.log('Return URL:', returnUrl);
      
      const checkoutUrl = await createCheckoutSession(priceId, returnUrl);
      
      if (checkoutUrl) {
        console.log('Successfully created checkout session, redirecting to:', checkoutUrl);
        // Add a success message before redirecting
        toast.success('Redirecting to Stripe checkout...');
        window.location.href = checkoutUrl;
      } else {
        console.error('Failed to create checkout session: No URL returned');
        // Toast error already shown in createCheckoutSession
        throw new Error('Failed to create checkout session: No URL returned');
      }
      
      return checkoutUrl;
    } catch (error) {
      console.error('Error in subscribe function:', error);
      throw error; // Propagate error to caller for better error handling
    }
  };

  // Function to manage subscription
  const manageSubscription = async () => {
    if (!user) {
      toast.error('You must be logged in to manage your subscription');
      return null;
    }
    
    try {
      // The URL to return to after managing subscription
      const returnUrl = `${window.location.origin}/profile?tab=subscription`;
      
      toast.info('Preparing subscription management portal...');
      const portalUrl = await createPortalSession(returnUrl);
      
      if (portalUrl) {
        toast.success('Redirecting to subscription management...');
        window.location.href = portalUrl;
      } else {
        // Toast error already shown in createPortalSession
        throw new Error('Failed to create portal session');
      }
      
      return portalUrl;
    } catch (error) {
      console.error('Error in manageSubscription function:', error);
      return null;
    }
  };

  return {
    plans,
    subscription,
    isPremium,
    isLoading,
    isRefreshing,
    subscribe,
    manageSubscription,
    refreshSubscription
  };
};
