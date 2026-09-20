import { Link } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { createCheckoutSession } from "@/lib/billing.functions";
import { PLANS, formatPrice } from "@/lib/product";

export function PricingCards({ currentPlanId }: { currentPlanId?: string }) {
  const { session } = useAuth();
  const [pending, setPending] = useState<string | null>(null);

  async function startCheckout(planId: "pro_monthly" | "pro_yearly") {
    setPending(planId);
    try {
      const result = await createCheckoutSession({ data: { planId, origin: window.location.origin } });
      if (!result.configured || !result.url) {
        toast.info("Payments are not connected yet", {
          description: "Add your Stripe keys and price IDs to enable checkout. See the README for the steps.",
        });
        return;
      }
      window.location.href = result.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrent = currentPlanId === plan.id;
        return (
          <div
            key={plan.id}
            className={`surface-card relative flex flex-col p-7 hover:-translate-y-1 ${
              plan.highlight ? "ring-2 ring-primary/40" : ""
            }`}
          >
            {plan.highlight ? (
              <Badge className="absolute -top-3 left-7">Most popular</Badge>
            ) : null}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold">{formatPrice(plan.priceCents)}</span>
              <span className="text-sm text-muted-foreground">/{plan.interval}</span>
            </div>
            {plan.savingsNote ? <p className="mt-2 text-sm font-medium text-primary">{plan.savingsNote}</p> : null}

            <ul className="mt-6 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {plan.id === "free" ? (
                <Button asChild variant={plan.highlight ? "default" : "outline"} className="w-full" disabled={isCurrent}>
                  <Link to={session ? "/dashboard" : "/auth"}>{isCurrent ? "Current plan" : "Start for Free"}</Link>
                </Button>
              ) : session ? (
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={isCurrent || pending === plan.id}
                  onClick={() => startCheckout(plan.id as "pro_monthly" | "pro_yearly")}
                >
                  {pending === plan.id ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                </Button>
              ) : (
                <Button asChild className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  <Link to="/auth">Create account to upgrade</Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
