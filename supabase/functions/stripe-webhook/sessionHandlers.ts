
import { Stripe } from "https://esm.sh/stripe@12.4.0";
import { corsHeaders } from "./utils.ts";

// Create checkout session
export async function createCheckoutSession(data: any, stripe: Stripe) {
  try {
    const { priceId, returnUrl } = data;
    
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use the provided price ID directly instead of trying to remap it
    // This will accept both IDs from the database and directly passed IDs
    console.log(`Creating checkout session with price ID: ${priceId}`);
    
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
      customer_creation: "always",
    });

    console.log("Checkout session created:", session.url);
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session", details: error.message }),
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
      return new Response(
        JSON.stringify({ error: "Customer ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating portal session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create portal session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
