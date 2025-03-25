
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, Subscription, getSubscriptionPlans, getUserSubscription, checkPremiumAccess, createCheckoutSession, createPortalSession } from '@/services/subscription';

export const useSubscription = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const plans = await getSubscriptionPlans();
      setPlans(plans);
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [userSubscription, hasPremiumAccess] = await Promise.all([
        getUserSubscription(user.id),
        checkPremiumAccess(user.id)
      ]);

      setSubscription(userSubscription);
      setIsPremium(hasPremiumAccess);
      setIsLoading(false);
    };

    fetchUserSubscription();
  }, [user]);

  const subscribe = async (priceId: string) => {
    if (!user) return null;
    
    // The URL to return to after checkout
    const returnUrl = `${window.location.origin}/profile`;
    const checkoutUrl = await createCheckoutSession(priceId, returnUrl);
    
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
    
    return checkoutUrl;
  };

  const manageSubscription = async () => {
    if (!user || !subscription) return null;
    
    // The URL to return to after managing subscription
    const returnUrl = `${window.location.origin}/profile`;
    const portalUrl = await createPortalSession(returnUrl);
    
    if (portalUrl) {
      window.location.href = portalUrl;
    }
    
    return portalUrl;
  };

  return {
    plans,
    subscription,
    isPremium,
    isLoading,
    subscribe,
    manageSubscription
  };
};
