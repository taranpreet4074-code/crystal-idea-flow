import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT } from "@/lib/product";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Reset password — ${PRODUCT.name}` },
      { name: "description", content: `Choose a new password for your ${PRODUCT.name} account.` },
      { property: "og:title", content: `Reset password — ${PRODUCT.name}` },
      { property: "og:description", content: "Choose a new password and get back to creating." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="hero-gradient flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="surface-card w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Open this page from the reset link in your email, then set a new password.
        </p>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Update password
        </Button>
      </form>
    </main>
  );
}
