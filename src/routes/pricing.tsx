import { createFileRoute } from "@tanstack/react-router";

import { PricingCards } from "@/components/marketing/PricingCards";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { PRODUCT } from "@/lib/product";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `Pricing — ${PRODUCT.name}` },
      { name: "description", content: "Free, Pro monthly and Pro yearly plans for the AI YouTube story generator." },
      { property: "og:title", content: `Pricing — ${PRODUCT.name}` },
      { property: "og:description", content: "Start free with 3 generations a month, or go Pro for 100." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="hero-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold sm:text-5xl">Pricing that scales with your channel</h1>
            <p className="mt-4 text-muted-foreground">
              Every plan includes the full story package. Paid plans simply give you more generations each month.
            </p>
          </div>
          <div className="mt-14">
            <PricingCards />
          </div>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Prices in USD. Subscriptions are billed through Stripe and can be cancelled at any time.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
