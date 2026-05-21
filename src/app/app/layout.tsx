import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { AppNav, AppMobileNav } from "@/components/app/AppNav";
import { BrainVideo } from "@/components/marketing/BrainVideo";
import { CrisisProvider } from "@/components/app/CrisisProvider";
import { CrisisFab } from "@/components/app/CrisisFab";
import { Scratchpad } from "@/components/app/Scratchpad";
import { OnboardingTour } from "@/components/app/OnboardingTour";
import { ShortcutsOverlay } from "@/components/app/ShortcutsOverlay";
import { GoToNav } from "@/components/app/GoToNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CrisisProvider>
    <div className="relative min-h-screen overflow-hidden">
      <BrainVideo opacity={0.18} />
      <CrisisFab />
      <Scratchpad />
      <OnboardingTour />
      <ShortcutsOverlay />
      <GoToNav />
      {/* Sidebar (desktop) + content */}
      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-white/[0.06] bg-[var(--bg-deep)]/70 px-5 py-6 backdrop-blur-xl md:flex">
          <Link href="/" aria-label="Home">
            <Logo size="md" />
          </Link>
          <AppNav />
          <div className="mt-auto text-[11px] text-[var(--ink-4)]">
            <div className="font-mono tabular-nums">v0.1 · Nocturne</div>
            <div>Signed in as <span className="text-[var(--ink-2)]">demo@ntn</span></div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[var(--bg-deep)]/85 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href="/" aria-label="Home">
            <Logo size="sm" />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
            v0.1
          </span>
        </header>

        <main className="flex-1 px-4 pt-6 pb-24 md:px-8 md:py-8 md:pb-12">
          {children}
        </main>

        {/* Mobile bottom nav — the v1 bug we fixed */}
        <AppMobileNav />
      </div>
    </div>
    </CrisisProvider>
  );
}
