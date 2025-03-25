
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  // Parse request URL and body
  const url = new URL(req.url);
  const requestBody = await req.json().catch(() => ({}));
  
  try {
    // Route handling based on URL path and POST body contents
    if (url.pathname.endsWith("/webhook") && req.headers.get("stripe-signature")) {
      // Handle webhook from Stripe
      return await handleStripeWebhook(req, stripe);
    } else if (requestBody.priceId && requestBody.returnUrl) {
      // Create checkout session
      return await createCheckoutSession(requestBody, stripe);
    } else if (requestBody.customerId && requestBody.returnUrl) {
      // Create customer portal session
      return await createPortalSession(requestBody, stripe);
    }

    // If no route matched
    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Handle webhook events from Stripe
async function handleStripeWebhook(req: Request, stripe: Stripe) {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Webhook signature missing" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Fetch customer information
        const customer = await stripe.customers.retrieve(session.customer);
        
        // Get plan information
        const { data: planData } = await supabaseAdmin
          .from("subscription_plans")
          .select("id")
          .eq("stripe_price_id", session.line_items.data[0].price.id)
          .single();
          
        // Find user by email
        const { data: userData } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .single();
          
        // Insert subscription record
        await supabaseAdmin.from("subscriptions").insert({
          user_id: userData.id,
          plan_id: planData.id,
          status: "active",
          stripe_subscription_id: session.subscription,
          current_period_start: new Date(session.current_period_start * 1000).toISOString(),
          current_period_end: new Date(session.current_period_end * 1000).toISOString(),
        });
        
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Update subscription status
        await supabaseAdmin.from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq("stripe_subscription_id", subscription.id);
          
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Update subscription status to canceled
        await supabaseAdmin.from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
          
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process webhook" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Create checkout session
async function createCheckoutSession(data: any, stripe: Stripe) {
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

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Customer portal session
async function createPortalSession(data: any, stripe: Stripe) {
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

// Helper function to create a Supabase client
function createClient(supabaseUrl, supabaseKey) {
  return {
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          single: () => {
            // Implementation would depend on further Deno/Supabase API access
            // Simplified placeholder to represent the pattern
            return fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}&limit=1`, {
              headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
              }
            }).then(res => res.json())
              .then(data => ({ data: data[0] }));
          }
        })
      }),
      insert: (data) => {
        return fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify(data)
        });
      },
      update: (data) => ({
        eq: (column, value) => {
          return fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'PATCH',
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(data)
          });
        }
      })
    })
  };
}
