import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StripeConfig = { secretKey: string; priceIds: Record<string, string | undefined> };

function readStripeConfig(): StripeConfig | null {
  const secretKey = process.env["STRIPE_SECRET_KEY"];
  if (!secretKey) return null;
  return {
    secretKey,
    priceIds: {
      pro_monthly: process.env["STRIPE_PRO_MONTHLY_PRICE_ID"],
      pro_yearly: process.env["STRIPE_PRO_YEARLY_PRICE_ID"],
    },
  };
}

async function stripeRequest(secretKey: string, path: string, body: Record<string, string>) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  const json = (await response.json()) as Record<string, unknown> & {
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(json.error?.message ?? "Stripe request failed");
  return json;
}

/** Returns whether payments are connected, so the UI can explain what is missing. */
export const getBillingStatus = createServerFn({ method: "GET" }).handler(async () => {
  const config = readStripeConfig();
  return {
    configured: Boolean(config),
    monthlyPriceConfigured: Boolean(config?.priceIds["pro_monthly"]),
    yearlyPriceConfigured: Boolean(config?.priceIds["pro_yearly"]),
  };
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ planId: z.enum(["pro_monthly", "pro_yearly"]), origin: z.string().url() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const config = readStripeConfig();
    if (!config) return { configured: false as const, url: null };

    const price = config.priceIds[data.planId];
    if (!price) throw new Error(`No Stripe price ID configured for the ${data.planId} plan.`);

    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single();
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    const body: Record<string, string> = {
      mode: "subscription",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      success_url: `${data.origin}/billing?checkout=success`,
      cancel_url: `${data.origin}/billing?checkout=cancelled`,
      client_reference_id: userId,
      "metadata[user_id]": userId,
      "metadata[plan_id]": data.planId,
      "subscription_data[metadata][user_id]": userId,
      "subscription_data[metadata][plan_id]": data.planId,
      allow_promotion_codes: "true",
    };
    if (subscription?.stripe_customer_id) body["customer"] = subscription.stripe_customer_id;
    else if (profile?.email) body["customer_email"] = profile.email;

    const session = await stripeRequest(config.secretKey, "checkout/sessions", body);
    return { configured: true as const, url: (session["url"] as string) ?? null };
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ origin: z.string().url() }).parse(data))
  .handler(async ({ data, context }) => {
    const config = readStripeConfig();
    if (!config) return { configured: false as const, url: null };

    const { supabase, userId } = context;
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      throw new Error("No billing account found yet. Start a subscription first.");
    }

    const session = await stripeRequest(config.secretKey, "billing_portal/sessions", {
      customer: subscription.stripe_customer_id,
      return_url: `${data.origin}/billing`,
    });
    return { configured: true as const, url: (session["url"] as string) ?? null };
  });
