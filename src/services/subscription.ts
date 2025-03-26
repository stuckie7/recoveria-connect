
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  stripe_price_id: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  cancel_at: string | null;
}

// Fetch available subscription plans
export const getSubscriptionPlans = async (): Promise<Plan[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to fetch subscription plans');
      return [];
    }
    
    return data.map(plan => {
      // Parse features safely from the JSONB field
      let features: string[] = [];
      
      if (plan.features) {
        // Try to extract features array from different possible formats
        if (typeof plan.features === 'object') {
          if (Array.isArray(plan.features)) {
            // If features is already an array
            features = plan.features as string[];
          } else if (plan.features.features && Array.isArray(plan.features.features)) {
            // If features is in a nested "features" property
            features = plan.features.features as string[];
          }
        }
      }
      
      return {
        ...plan,
        features
      };
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    toast.error('Failed to fetch subscription plans');
    return [];
  }
};

// Fetch the user's active subscription
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};

// Check if the user has premium access
export const checkPremiumAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
    
    return data.is_premium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

// Create a Stripe checkout session
export const createCheckoutSession = async (priceId: string, returnUrl: string): Promise<string | null> => {
  try {
    // Create customer in Stripe if needed
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      toast.error('You must be logged in to subscribe');
      return null;
    }
    
    // Log the price ID we're sending to the function
    console.log("Creating checkout with price ID:", priceId);
    
    // Call the Stripe webhook function
    const { data: response, error } = await supabase.functions.invoke('stripe-webhook', {
      body: {
        priceId,
        returnUrl,
      },
      method: 'POST',
    });
    
    if (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
      return null;
    }
    
    return response.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    toast.error('Failed to create checkout session');
    return null;
  }
};

// Create a Stripe customer portal session
export const createPortalSession = async (returnUrl: string): Promise<string | null> => {
  try {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      toast.error('You must be logged in to manage your subscription');
      return null;
    }
    
    const { data: customerData, error: customerError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', profile.user.id)
      .single();
    
    if (customerError || !customerData.stripe_customer_id) {
      toast.error('No subscription found');
      return null;
    }
    
    // Fix the function invoke options - remove 'path' property
    const { data: response, error } = await supabase.functions.invoke('stripe-webhook', {
      body: {
        customerId: customerData.stripe_customer_id,
        returnUrl,
      },
      method: 'POST',
    });
    
    if (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to create portal session');
      return null;
    }
    
    return response.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    toast.error('Failed to create portal session');
    return null;
  }
};
