import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type AccountData = {
  profile: { id: string; email: string | null; full_name: string | null; plan_id: string; is_disabled: boolean };
  plan: {
    id: string;
    name: string;
    price_cents: number;
    billing_interval: string;
    monthly_generations: number;
    features: unknown;
  } | null;
  subscription: {
    status: string;
    plan_id: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    stripe_customer_id: string | null;
  } | null;
  used: number;
  allowed: number;
  isAdmin: boolean;
};

export function accountQueryOptions(userId: string | undefined) {
  return {
    queryKey: ["account", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<AccountData> => {
      const periodStart = new Date();
      periodStart.setUTCDate(1);
      const period = periodStart.toISOString().slice(0, 8) + "01";

      const [profileRes, subscriptionRes, usageRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", userId!).maybeSingle(),
        supabase.from("usage").select("generations_used").eq("user_id", userId!).eq("period_start", period).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);

      const profile = profileRes.data;
      const planId = profile?.plan_id ?? "free";
      const planRes = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();

      return {
        profile: (profile ?? {
          id: userId!,
          email: null,
          full_name: null,
          plan_id: "free",
          is_disabled: false,
        }) as AccountData["profile"],
        plan: (planRes.data ?? null) as AccountData["plan"],
        subscription: (subscriptionRes.data ?? null) as AccountData["subscription"],
        used: usageRes.data?.generations_used ?? 0,
        allowed: planRes.data?.monthly_generations ?? 3,
        isAdmin: (rolesRes.data ?? []).some((row) => row.role === "admin"),
      };
    },
  };
}

export function useAccount(userId: string | undefined) {
  return useQuery(accountQueryOptions(userId));
}
