import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Orbs } from "@/components/marketing/Orbs";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Orbs />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link href="/" aria-label="Admissions Command home">
          <Logo size="md" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/demo"
            className="text-sm text-[var(--ink-2)] transition hover:text-white"
          >
            Demo
          </Link>
          <Link
            href="/roi"
            className="text-sm text-[var(--ink-2)] transition hover:text-white"
          >
            ROI
          </Link>
          <Link
            href="/vs"
            className="text-sm text-[var(--ink-2)] transition hover:text-white"
          >
            Build vs Buy
          </Link>
          <Link href="/app">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
        </nav>
        <Link href="/app" className="md:hidden">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-xs text-[var(--ink-3)] md:px-10">
        <span>© Northbound Treatment Network</span>
        <div className="flex items-center gap-6">
          <Link href="/demo" className="transition hover:text-white">
            Demo
          </Link>
          <Link href="/roi" className="transition hover:text-white">
            ROI
          </Link>
          <Link href="/vs" className="transition hover:text-white">
            Build vs Buy
          </Link>
        </div>
        <span className="font-mono tabular-nums">v0.1 · Nocturne</span>
      </footer>
    </div>
  );
}
