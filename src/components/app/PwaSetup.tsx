"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaSetup() {
  const [offline, setOffline] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);
  const [recentlyOnline, setRecentlyOnline] = useState<number | null>(null);

  // Register service worker
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  // Online/offline events
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      setRecentlyOnline(Date.now());
      setTimeout(() => setRecentlyOnline(null), 3000);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // PWA install prompt
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      const dismissed = localStorage.getItem("acmd:pwa:dismissed");
      if (dismissed) return;
      setInstallPrompt(ev);
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstallable(false);
      setInstallPrompt(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      try {
        localStorage.setItem("acmd:pwa:dismissed", String(Date.now()));
      } catch {}
    }
    setInstallable(false);
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setInstallable(false);
    try {
      localStorage.setItem("acmd:pwa:dismissed", String(Date.now()));
    } catch {}
  };

  return (
    <>
      {/* Offline indicator */}
      {offline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[80] flex items-center justify-center gap-2 border-b border-[var(--warning)]/30 bg-[var(--warning)]/[0.10] px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--warning)] backdrop-blur-xl print:hidden"
        >
          <span className="inline-block size-1.5 rounded-full bg-[var(--warning)]" />
          <span>Offline — using cached data</span>
        </div>
      )}
      {recentlyOnline && !offline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[80] flex items-center justify-center gap-2 border-b border-[var(--success)]/30 bg-[var(--success)]/[0.10] px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--success)] backdrop-blur-xl print:hidden"
        >
          <span className="inline-block size-1.5 rounded-full bg-[var(--success)]" />
          <span>Back online — syncing</span>
        </div>
      )}

      {/* Install prompt — small unobtrusive banner */}
      {installable && (
        <div
          role="region"
          aria-label="Install app prompt"
          className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] right-4 z-30 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[var(--periwinkle)]/30 bg-[var(--bg-deep)]/95 p-3 backdrop-blur-xl md:bottom-20 print:hidden"
          style={{
            boxShadow:
              "0 0 24px rgba(167,139,250,0.22), 0 12px 32px -12px rgba(0,0,0,0.5)",
          }}
        >
          <div className="font-display text-sm text-white">
            Install Admissions Command
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--ink-3)]">
            Add to home screen for offline cockpit access + native feel.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={triggerInstall}
              className="btn-primary text-xs"
              style={{ padding: "6px 14px" }}
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-white"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
