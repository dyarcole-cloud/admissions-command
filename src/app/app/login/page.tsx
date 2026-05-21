import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Orbs } from "@/components/marketing/Orbs";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="relative -m-4 flex min-h-screen items-center justify-center px-6 py-12 md:-m-8">
      <Orbs />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <Link href="/" aria-label="Home">
          <Logo size="md" />
        </Link>
        <Card variant="aurora">
          <span className="overline mb-2 block">Sign in</span>
          <h1
            className="font-display text-2xl text-white"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            We&apos;ll send a magic link to your work email. Auth wiring lands
            in week 2 — for now you can preview the cockpit with the public link.
          </p>

          <form className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@facility.com"
                disabled
              />
            </div>
            <Button className="w-full" disabled>
              Email magic link (coming soon)
            </Button>
          </form>

          <Link href="/app" className="mt-6 block">
            <Button variant="ghost" className="w-full">
              Preview cockpit →
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
