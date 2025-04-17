
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleStripeWebhook } from "./webhookHandlers.ts";
import { createCheckoutSession, createPortalSession } from "./sessionHandlers.ts";
import { corsHeaders } from "./utils.ts";
import { Stripe } from "https://esm.sh/stripe@12.4.0";

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
      JSON.stringify({ error: "Internal server error: Missing Stripe secret key" }),
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
  let requestBody;
  try {
    requestBody = await req.json();
  } catch (err) {
    console.error("Error parsing request body:", err);
    requestBody = {};
  }
  
  console.log("Request path:", url.pathname);
  console.log("Request body:", JSON.stringify(requestBody));
  
  try {
    // Route handling based on URL path and POST body contents
    if (url.pathname.endsWith("/webhook") && req.headers.get("stripe-signature")) {
      // Handle webhook from Stripe
      return await handleStripeWebhook(req, stripe);
    } else if (requestBody.action === 'create-checkout' && requestBody.priceId && requestBody.returnUrl) {
      // Create checkout session
      return await createCheckoutSession(requestBody, stripe);
    } else if (requestBody.action === 'create-portal' && requestBody.customerId && requestBody.returnUrl) {
      // Create customer portal session
      return await createPortalSession(requestBody, stripe);
    } else if (requestBody.priceId && requestBody.returnUrl) {
      // Backward compatibility for checkout session
      return await createCheckoutSession(requestBody, stripe);
    } else if (requestBody.customerId && requestBody.returnUrl) {
      // Backward compatibility for customer portal
      return await createPortalSession(requestBody, stripe);
    }

    // If no route matched
    console.error("No route matched:", url.pathname, JSON.stringify(requestBody));
    return new Response(
      JSON.stringify({ 
        error: "Not found", 
        message: "No matching route found",
        request: {
          path: url.pathname,
          bodyKeys: Object.keys(requestBody)
        }
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
