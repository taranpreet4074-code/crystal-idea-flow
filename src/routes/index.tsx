import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clapperboard,
  Download,
  FileText,
  Image as ImageIcon,
  Mic,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";

import productPreview from "@/assets/product-preview.jpg";
import { PricingCards } from "@/components/marketing/PricingCards";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${PRODUCT.name} — AI YouTube Story Generator` },
      { name: "description", content: PRODUCT.description },
      { property: "og:title", content: `${PRODUCT.name} — AI YouTube Story Generator` },
      { property: "og:description", content: PRODUCT.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileText, title: "Full story script", body: "A spoken-word script written for the tone and audience you pick." },
  { icon: Clapperboard, title: "Scene breakdown", body: "Every story is split into numbered scenes with visual direction." },
  { icon: Mic, title: "Narration lines", body: "Ready-to-record narration for each scene, not just a summary." },
  { icon: ImageIcon, title: "Image & video prompts", body: "Detailed prompts you can paste into your image or video tool." },
  { icon: Save, title: "History & saved results", body: "Every generation is stored so you can revisit or save the best ones." },
  { icon: Download, title: "Copy & download", body: "Copy any section or download the whole package as a text file." },
];

const steps = [
  { title: "Describe your idea", body: "One or two sentences is enough — the topic, the angle, the feeling." },
  { title: "Pick tone, audience and length", body: "Choose a style and how long the finished video should run." },
  { title: "Generate and refine", body: "Get the full package in seconds, then regenerate, save or download it." },
];

const faqs = [
  { q: "What exactly do I get from one generation?", a: "A title, hook, logline, full script, numbered scenes with narration and visuals, image and video prompts, five title options, a description, tags and thumbnail concepts." },
  { q: "How many generations do I get?", a: "The Free plan includes 3 generations per month. Pro and Pro Yearly include 100 generations per month." },
  { q: "Can I use the results commercially?", a: "Yes — the output is yours to edit and publish. You are responsible for reviewing and fact-checking anything before publishing." },
  { q: "Can I cancel any time?", a: "Yes. Subscriptions are managed through the Stripe customer portal from your billing page, and you keep access until the end of the paid period." },
  { q: "Do unused generations roll over?", a: "No. Your allowance resets at the start of each calendar month." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="hero-gradient">
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <div className="rise-in mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {PRODUCT.tagline}
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-6xl">
                Create Better Results <span className="text-gradient">With AI</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                An intelligent AI tool that helps you create high-quality results in seconds.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/auth">
                    Start for Free <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">3 free generations every month. No card required.</p>
            </div>

            <div className="rise-in mx-auto mt-16 max-w-5xl">
              <div className="surface-card overflow-hidden p-2 sm:p-3">
                <img
                  src={productPreview}
                  alt="The StoryReel AI workspace with an idea on the left and the generated script and scenes on the right"
                  width={1600}
                  height={1008}
                  className="w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">Everything a story needs, in one pass</h2>
            <p className="mt-4 text-muted-foreground">
              One idea in, a complete production package out — written, structured and ready to shoot.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="surface-card p-6 hover:-translate-y-1">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-card/50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground">Three steps from a rough idea to a shootable story.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="surface-card p-6">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">What a result looks like</h2>
              <p className="mt-4 text-muted-foreground">
                Below is the shape of every generation. The wording is written fresh for your idea, tone and audience.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Wand2 className="size-4 text-primary" /> Title, hook and logline
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Full narration script
                </li>
                <li className="flex items-center gap-2">
                  <Clapperboard className="size-4 text-primary" /> 4–8 scenes with visuals and prompts
                </li>
                <li className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" /> Titles, description, tags, thumbnail concepts
                </li>
              </ul>
            </div>
            <div className="surface-card space-y-4 p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Hook</p>
                <p className="mt-1 text-sm">"He walked into the storm with nothing but a map — and it was wrong."</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Scene 1 — The last light</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Narration, visual description, image prompt and video prompt are generated for each scene.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Title options", "Description", "Tags", "Thumbnails"].map((chip) => (
                  <span key={chip} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-card/50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Simple pricing</h2>
              <p className="mt-4 text-muted-foreground">Start free. Upgrade when you are publishing every week.</p>
            </div>
            <div className="mt-12">
              <PricingCards />
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="surface-card hero-gradient p-10 text-center sm:p-16">
            <h2 className="text-3xl font-semibold sm:text-4xl">Your next story is one idea away</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create an account and generate your first full story package in under a minute.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/auth">
                Start for Free <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
