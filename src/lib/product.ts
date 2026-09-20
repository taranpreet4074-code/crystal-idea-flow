/**
 * Central product + pricing configuration.
 * Prices shown in the UI come from the `plans` table in the database;
 * these values are the fallback/display defaults used before data loads.
 */

export const PRODUCT = {
  name: "StoryReel AI",
  tagline: "AI YouTube story generator",
  description:
    "Turn one idea into a full YouTube story: script, scene breakdown, narration and image & video prompts.",
} as const;

export type PlanId = "free" | "pro_monthly" | "pro_yearly";

export type PlanConfig = {
  id: PlanId;
  name: string;
  priceCents: number;
  interval: "month" | "year";
  monthlyGenerations: number;
  description: string;
  features: string[];
  highlight?: boolean;
  savingsNote?: string;
};

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    priceCents: 0,
    interval: "month",
    monthlyGenerations: 3,
    description: "Try the generator with a few stories each month.",
    features: ["3 AI story generations per month", "Script, scenes and narration", "Generation history"],
  },
  {
    id: "pro_monthly",
    name: "Pro",
    priceCents: 1900,
    interval: "month",
    monthlyGenerations: 100,
    description: "For creators publishing every week.",
    highlight: true,
    features: [
      "100 AI story generations per month",
      "Scene-by-scene breakdown",
      "Image and video prompts",
      "Priority processing",
      "Saved results",
      "Download results",
    ],
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    priceCents: 19000,
    interval: "year",
    monthlyGenerations: 100,
    description: "Everything in Pro, billed once a year.",
    savingsNote: "Save $38 — 2 months free",
    features: [
      "Everything in Pro",
      "100 generations every month",
      "Annual billing",
      "Priority support",
    ],
  },
];

export function planById(id: string): PlanConfig | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function formatPrice(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const TONES = [
  "Cinematic",
  "Documentary",
  "Mysterious",
  "Inspirational",
  "Comedic",
  "Educational",
] as const;

export const AUDIENCES = ["General", "Kids", "Teens", "Gaming", "Business", "True crime fans"] as const;

export const LENGTHS = [
  { id: "short", label: "Short (~60s)", scenes: 4 },
  { id: "medium", label: "Medium (3-5 min)", scenes: 6 },
  { id: "long", label: "Long (8-12 min)", scenes: 8 },
] as const;
