import { createFileRoute } from "@tanstack/react-router";

/**
 * Stripe webhook receiver.
 * Signature is verified with the Stripe signing secret before anything is read.
 */

async function verifySignature(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(
    header.split(",").map((piece) => {
      const [key, ...rest] = piece.split("=");
      return [key?.trim() ?? "", rest.join("=")];
    }),
  ) as Record<string, string>;

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Reject replays older than 5 minutes.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

function planFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null;
  if (priceId === process.env["STRIPE_PRO_MONTHLY_PRICE_ID"]) return "pro_monthly";
  if (priceId === process.env["STRIPE_PRO_YEARLY_PRICE_ID"]) return "pro_yearly";
  return null;
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const signature = request.headers.get("stripe-signature");
        const payload = await request.text();
        if (!signature || !(await verifySignature(payload, signature, secret))) {
          return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(payload) as {
          type: string;
          data: { object: Record<string, unknown> };
        };
        const object = event.data.object;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const metadata = (object["metadata"] as Record<string, string> | undefined) ?? {};
        const customerId = (object["customer"] as string | undefined) ?? null;

        async function resolveUserId(): Promise<string | null> {
          if (metadata["user_id"]) return metadata["user_id"];
          if (object["client_reference_id"]) return object["client_reference_id"] as string;
          if (customerId) {
            const { data } = await supabaseAdmin
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_customer_id", customerId)
              .maybeSingle();
            return data?.user_id ?? null;
          }
          return null;
        }

        const userId = await resolveUserId();

        async function upsertSubscription(fields: Record<string, unknown>) {
          if (!userId) return;
          await supabaseAdmin
            .from("subscriptions")
            .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
          if (fields["plan_id"]) {
            await supabaseAdmin
              .from("profiles")
              .update({ plan_id: fields["plan_id"] as string, updated_at: new Date().toISOString() })
              .eq("id", userId);
          }
        }

        switch (event.type) {
          case "checkout.session.completed": {
            await upsertSubscription({
              plan_id: metadata["plan_id"] ?? "pro_monthly",
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: (object["subscription"] as string | undefined) ?? null,
            });
            break;
          }
          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const items = object["items"] as { data?: Array<{ price?: { id?: string } }> } | undefined;
            const priceId = items?.data?.[0]?.price?.id;
            const planId = planFromPriceId(priceId) ?? metadata["plan_id"] ?? "pro_monthly";
            const status = (object["status"] as string) ?? "active";
            const periodEnd = object["current_period_end"] as number | undefined;
            await upsertSubscription({
              plan_id: status === "active" || status === "trialing" ? planId : "free",
              status,
              cancel_at_period_end: Boolean(object["cancel_at_period_end"]),
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
              stripe_customer_id: customerId,
              stripe_subscription_id: (object["id"] as string) ?? null,
            });
            break;
          }
          case "customer.subscription.deleted": {
            await upsertSubscription({ plan_id: "free", status: "canceled", cancel_at_period_end: false });
            break;
          }
          case "invoice.payment_succeeded":
          case "invoice.payment_failed": {
            if (userId) {
              await supabaseAdmin.from("payments").insert({
                user_id: userId,
                amount_cents: Number(object["amount_paid"] ?? object["amount_due"] ?? 0),
                currency: (object["currency"] as string) ?? "usd",
                status: event.type === "invoice.payment_succeeded" ? "succeeded" : "failed",
                description: (object["description"] as string) ?? "Subscription invoice",
                provider_reference: (object["id"] as string) ?? null,
              });
              if (event.type === "invoice.payment_failed") {
                await supabaseAdmin
                  .from("subscriptions")
                  .update({ status: "past_due", updated_at: new Date().toISOString() })
                  .eq("user_id", userId);
              }
            }
            break;
          }
          default:
            break;
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
