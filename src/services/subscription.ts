
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  stripe_price_id: string;
}

export interface Subscription {
  id?: string;
  user_id: string;
  status: string;
  current_period_start: string | number;
  current_period_end: string | number;
  cancel_at?: string | number | null;
  canceled_at?: string | number | null;
  stripe_subscription_id?: string;
  plan_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const getSubscriptionPlans = async (): Promise<Plan[]> => {
  return [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Free plan with basic features',
      price: 0,
      interval: 'month',
      features: ['Basic access'],
      stripe_price_id: 'price_basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Unlock all features',
      price: 9.99,
      interval: 'month',
      features: ['Premium access', 'Advanced features'],
      stripe_price_id: 'price_premium'
    }
  ];
};

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getUserSubscription:', error);
    return null;
  }
};

export const checkPremiumAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking premium access:', error);
      return false;
    }

    return data?.is_premium === true;
  } catch (error) {
    console.error('Unexpected error in checkPremiumAccess:', error);
    return false;
  }
};

export const createCheckoutSession = async (priceId: string, returnUrl: string): Promise<string | null> => {
  try {
    console.log(`Creating checkout session with price ID: ${priceId}`);
    console.log(`Return URL: ${returnUrl}`);
    
    const { data, error } = await supabase.functions.invoke('stripe-webhook', {
      body: {
        action: 'create-checkout',
        priceId,
        returnUrl,
      },
      method: 'POST',
    });
    
    if (error) {
      console.error('Checkout session creation error:', error);
      toast.error(`Failed to create checkout session: ${error.message || 'Unknown error'}`, {
        description: 'Please try again or contact support.'
      });
      return null;
    }
    
    if (!data || !data.url) {
      console.error('Invalid response from checkout session:', data);
      toast.error('Invalid response from subscription service', {
        description: 'Please try again or contact support.'
      });
      return null;
    }
    
    console.log('Checkout session created successfully:', data.url);
    return data.url;
  } catch (error) {
    console.error('Unexpected error in createCheckoutSession:', error);
    toast.error('An unexpected error occurred', {
      description: 'Please try again or contact support.'
    });
    return null;
  }
};

export const createPortalSession = async (returnUrl: string): Promise<string | null> => {
  try {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      toast.error('You must be logged in to manage your subscription');
      return null;
    }
    
    console.log('Creating portal session for user:', profile.user.id);
    
    const { data, error } = await supabase.functions.invoke('stripe-webhook', {
      body: {
        action: 'create-portal',
        customerId: profile.user.email,
        returnUrl,
      },
      method: 'POST',
    });
    
    if (error) {
      console.error('Portal session creation error:', error);
      toast.error(`Failed to create portal session: ${error.message || 'Unknown error'}`, {
        description: 'Please try again or contact support.'
      });
      return null;
    }
    
    if (!data || !data.url) {
      console.error('Invalid response from portal session:', data);
      toast.error('Invalid response from subscription service', {
        description: 'Please try again or contact support.'
      });
      return null;
    }
    
    console.log('Portal session created successfully:', data.url);
    return data.url;
  } catch (error) {
    console.error('Unexpected error in createPortalSession:', error);
    toast.error('An unexpected error occurred', {
      description: 'Please try again or contact support.'
    });
    return null;
  }
};
