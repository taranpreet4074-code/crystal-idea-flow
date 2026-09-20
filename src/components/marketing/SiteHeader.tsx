import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PRODUCT } from "@/lib/product";

const links = [
  { to: "/", label: "Home" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          {PRODUCT.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
            >
              {link.label}
            </Link>
          ))}
          <a href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="/#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : session ? (
            <Button asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Start for Free</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-1 text-sm">
                {link.label}
              </Link>
            ))}
            <a href="/#how-it-works" onClick={() => setOpen(false)} className="py-1 text-sm">
              How it works
            </a>
            <a href="/#faq" onClick={() => setOpen(false)} className="py-1 text-sm">
              FAQ
            </a>
            <Button asChild className="mt-2">
              <Link to={session ? "/dashboard" : "/auth"} onClick={() => setOpen(false)}>
                {session ? "Go to dashboard" : "Start for Free"}
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
