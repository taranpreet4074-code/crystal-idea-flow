import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "@/hooks/useAccount";
import { PRODUCT } from "@/lib/product";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Dashboard — ${PRODUCT.name}` },
      { name: "description", content: `Your ${PRODUCT.name} workspace: plan, remaining generations and story history.` },
      { property: "og:title", content: `Dashboard — ${PRODUCT.name}` },
      { property: "og:description", content: "See your plan, credits and generated stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();
  const { data: account, isLoading } = useAccount(user?.id);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const used = account?.used ?? 0;
  const allowed = account?.allowed ?? 0;

  return (
    <main className="hero-gradient min-h-screen px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">{account?.profile.email ?? user?.email}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/pricing">View plans</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="surface-card p-6">
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 text-2xl font-semibold">{account?.plan?.name ?? "Free"}</p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm text-muted-foreground">Generations this month</p>
            <p className="mt-1 text-2xl font-semibold">
              {Math.max(allowed - used, 0)} / {allowed} remaining
            </p>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">AI workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The story generator and billing pages are still being built.
          </p>
        </div>
      </div>
    </main>
  );
}
