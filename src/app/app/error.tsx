"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/app/* error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-16">
      <Card variant="aurora" className="space-y-3">
        <span className="overline">Something tripped</span>
        <h2
          className="font-display text-2xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          The cockpit hit a snag.
        </h2>
        <p className="text-sm text-[var(--ink-2)]">
          A render error stopped this view. Your draft assessments and call log
          are local — they&apos;re still safe. Try the recover button below; if
          it keeps happening, refresh the page or jump to a different surface.
        </p>
        <pre className="font-mono max-h-32 overflow-y-auto rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/[0.06] p-3 text-xs leading-relaxed whitespace-pre-wrap text-[var(--error-soft)]">
          {error.message}
          {error.digest ? `\n[digest ${error.digest}]` : ""}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/app">
            <Button variant="ghost">Back to cockpit</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Landing</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
