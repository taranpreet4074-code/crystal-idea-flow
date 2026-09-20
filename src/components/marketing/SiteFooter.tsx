import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { PRODUCT } from "@/lib/product";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-base font-semibold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            {PRODUCT.name}
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{PRODUCT.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <a href="/#features" className="transition-colors hover:text-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="transition-colors hover:text-foreground">
                How it works
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Account</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                Create account
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {PRODUCT.name}. All rights reserved.
      </div>
    </footer>
  );
}
