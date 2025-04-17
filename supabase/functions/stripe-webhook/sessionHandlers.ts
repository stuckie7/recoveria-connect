
import { Stripe } from "https://esm.sh/stripe@12.4.0";
import { corsHeaders } from "./utils.ts";

// Create checkout session
export async function createCheckoutSession(data: any, stripe: Stripe) {
  try {
    const { priceId, returnUrl } = data;
    
    if (!priceId) {
      console.error("Missing price ID in request");
      return new Response(
        JSON.stringify({ error: "Price ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating checkout session with price ID: ${priceId}`);
    console.log(`Return URL: ${returnUrl}`);
    
    // First, verify that the price ID exists in your Stripe account
    try {
      await stripe.prices.retrieve(priceId);
    } catch (priceError) {
      console.error(`Price ID ${priceId} does not exist in Stripe:`, priceError.message);
      return new Response(
        JSON.stringify({ 
          error: `Invalid price ID: ${priceId}. Please check your Stripe dashboard for valid price IDs.`,
          details: priceError.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create the session with the provided price ID
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      // Remove customer_creation for subscription mode which was causing errors
    });

    console.log("Checkout session created successfully:", session.id);
    console.log("Checkout URL:", session.url);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    console.error("Error details:", JSON.stringify(error));
    return new Response(
      JSON.stringify({ 
        error: "Failed to create checkout session", 
        details: error.message,
        code: error.type || error.code,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Customer portal session
export async function createPortalSession(data: any, stripe: Stripe) {
  try {
    const { customerId, returnUrl } = data;
    
    if (!customerId) {
      console.error("Missing customer ID in request");
      return new Response(
        JSON.stringify({ error: "Customer ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating portal session for customer: ${customerId}`);
    console.log(`Return URL: ${returnUrl}`);
    
    // First, check if the customer exists
    try {
      await stripe.customers.retrieve(customerId);
    } catch (customerError) {
      console.error(`Customer ID ${customerId} does not exist in Stripe:`, customerError.message);
      
      // Try to find or create the customer by email instead
      if (data.email) {
        console.log(`Attempting to find customer by email: ${data.email}`);
        const customers = await stripe.customers.list({ email: data.email, limit: 1 });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log(`Found customer by email: ${customerId}`);
        } else {
          console.error(`No customer found for email: ${data.email}`);
          return new Response(
            JSON.stringify({ error: "Customer not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ 
            error: `Invalid customer ID: ${customerId}`,
            details: customerError.message
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log("Portal session created successfully:", session.id);
    console.log("Portal URL:", session.url);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating portal session:", error.message);
    console.error("Error details:", JSON.stringify(error));
    return new Response(
      JSON.stringify({ 
        error: "Failed to create portal session",
        details: error.message,
        code: error.type || error.code,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
