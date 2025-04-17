
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const createCheckoutSession = async (priceId: string, returnUrl: string): Promise<string | null> => {
  try {
    // More detailed logging for debugging
    console.log(`Creating checkout session with price ID: ${priceId}`);
    console.log(`Return URL: ${returnUrl}`);
    
    // Call the Stripe webhook function with more robust error handling
    const { data, error } = await supabase.functions.invoke('stripe-webhook', {
      body: {
        action: 'create-checkout',
        priceId,
        returnUrl,
      },
      method: 'POST',
    });
    
    // Enhanced error logging
    if (error) {
      console.error('Checkout session creation error:', error);
      toast.error(`Failed to create checkout session: ${error.message || 'Unknown error'}`, {
        description: 'Please try again or contact support.'
      });
      return null;
    }
    
    // Validate the response
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
        customerId: profile.user.email, // Fallback to email if customer ID not found
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
