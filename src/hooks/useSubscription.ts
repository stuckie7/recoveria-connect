
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, Subscription, getSubscriptionPlans, getUserSubscription, checkPremiumAccess, createCheckoutSession, createPortalSession } from '@/services/subscription';

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
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to initiate subscription
  const subscribe = async (priceId: string) => {
    if (!user) return null;
    
    try {
      // The URL to return to after checkout
      const returnUrl = `${window.location.origin}/profile?tab=subscription`;
      console.log(`Creating checkout session with price ID: ${priceId}`);
      const checkoutUrl = await createCheckoutSession(priceId, returnUrl);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
      
      return checkoutUrl;
    } catch (error) {
      console.error('Error in subscribe function:', error);
      return null;
    }
  };

  // Function to manage subscription
  const manageSubscription = async () => {
    if (!user || !subscription) return null;
    
    try {
      // The URL to return to after managing subscription
      const returnUrl = `${window.location.origin}/profile?tab=subscription`;
      const portalUrl = await createPortalSession(returnUrl);
      
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
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
