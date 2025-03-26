
import { Stripe } from "https://esm.sh/stripe@12.4.0";
import { getSupabaseAdmin, corsHeaders } from "./utils.ts";

// Handle webhook events from Stripe
export async function handleStripeWebhook(req: Request, stripe: Stripe) {
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
    const supabaseAdmin = getSupabaseAdmin();

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event.data.object, stripe, supabaseAdmin);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object, supabaseAdmin);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object, supabaseAdmin);
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

async function handleCheckoutSessionCompleted(session: any, stripe: Stripe, supabaseAdmin: any) {
  // Fetch customer information
  const customer = await stripe.customers.retrieve(session.customer);
  
  // Find user by email
  const { data: userData } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", customer.email)
    .single();
    
  if (!userData) {
    console.error("User not found for email:", customer.email);
    return;
  }
  
  // Update user's stripe_customer_id if it's not set
  await supabaseAdmin
    .from("profiles")
    .update({ 
      stripe_customer_id: session.customer,
      is_premium: true 
    })
    .eq("id", userData.id);
    
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Insert subscription record
  await supabaseAdmin.from("subscriptions").insert({
    user_id: userData.id,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: any, supabaseAdmin: any) {
  // Find user by Stripe customer ID
  const { data: userData } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", subscription.customer)
    .single();
    
  if (!userData) {
    console.error("User not found for customer:", subscription.customer);
    return;
  }
    
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
    
  // Update user's premium status
  await supabaseAdmin
    .from("profiles")
    .update({ is_premium: subscription.status === "active" })
    .eq("id", userData.id);
}

async function handleSubscriptionDeleted(subscription: any, supabaseAdmin: any) {
  // Find user by Stripe customer ID
  const { data: userData } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", subscription.customer)
    .single();
    
  if (!userData) {
    console.error("User not found for customer:", subscription.customer);
    return;
  }
  
  // Update subscription status to canceled
  await supabaseAdmin.from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);
    
  // Update user's premium status
  await supabaseAdmin
    .from("profiles")
    .update({ is_premium: false })
    .eq("id", userData.id);
}
