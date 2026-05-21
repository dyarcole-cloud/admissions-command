"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CLAIMS_TIERS } from "@/lib/data/claimsTiers";
import {
  pushRecent,
  readFavorites,
  readRecent,
  toggleFavorite,
} from "@/lib/data/payorPrefs";
import type { Payor } from "@/lib/data/payors";

type SearchResponse = { ok: true; count: number; total: number; results: Payor[] };

type Props = {
  value: Payor | null;
  onSelect: (p: Payor | null) => void;
};

export function InsuranceIntel({ value, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Payor[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [pinned, setPinned] = useState<Payor[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate recent + favorites and fetch their full Payor records
  useEffect(() => {
    const recent = readRecent();
    const f = readFavorites();
    setFavs(f);
    const ids = Array.from(new Set([...f, ...recent])).slice(0, 10);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) =>
        fetch(`/api/payors?q=${encodeURIComponent(id)}&limit=20`)
          .then((r) => r.json() as Promise<SearchResponse>)
          .then((j) => (j.ok ? j.results.find((p) => p.id === id) : null))
          .catch(() => null)
      )
    ).then((arr) => {
      const found = arr.filter((p): p is Payor => p !== null);
      setPinned(found);
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (value) return; // suppress search when a payor is locked in
    debounce.current = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const r = await fetch(`/api/payors?q=${encodeURIComponent(q)}&limit=8`);
        const j = (await r.json()) as SearchResponse;
        if (j.ok) {
          setResults(j.results);
          setTotal(j.total);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, value]);

  // Load total count on mount for placeholder hint
  useEffect(() => {
    fetch("/api/payors?limit=1")
      .then((r) => r.json() as Promise<SearchResponse>)
      .then((j) => j.ok && setTotal(j.total))
      .catch(() => {});
  }, []);

  const tier = value ? CLAIMS_TIERS[value.light] : null;

  const handleSelect = (p: Payor | null) => {
    if (p) {
      pushRecent(p.id);
    }
    onSelect(p);
    setQuery("");
    setResults([]);
  };

  const handleToggleFav = (id: string) => {
    const next = toggleFavorite(id);
    setFavs(next);
  };

  return (
    <Card variant="aurora" className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <div className="overline">Insurance intel</div>
          {total !== null && (
            <div className="font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
              {total} payors loaded
            </div>
          )}
        </div>
        <Input
          ref={inputRef}
          placeholder="Cigna MRC, Aetna FCR, UHC Navigate, Anthem Blue Cross…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {!value && !query && pinned.length > 0 && (
          <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-baseline justify-between px-3 pt-2 pb-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                Pinned + recent
              </span>
              <span className="font-mono text-[10px] tabular-nums text-[var(--ink-4)]">
                {pinned.length}
              </span>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {pinned.map((p) => {
                const isFav = favs.includes(p.id);
                return (
                  <li key={p.id} className="group">
                    <div className="flex w-full items-stretch gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelect(p)}
                        className="flex flex-1 items-start justify-between gap-3 px-3 py-2 text-left transition hover:bg-white/[0.03]"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm text-white">
                            {p.plan || p.parent}
                          </div>
                          <div className="truncate text-[11px] text-[var(--ink-3)]">
                            {p.parent} · {p.rowCategory}
                          </div>
                        </div>
                        <Badge tone={p.light}>{p.light}</Badge>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFav(p.id)}
                        aria-label={
                          isFav ? "Unfavorite this payor" : "Favorite this payor"
                        }
                        className={`px-2 text-base transition ${
                          isFav
                            ? "text-[var(--gold-bright)]"
                            : "text-[var(--ink-4)] hover:text-[var(--periwinkle)]"
                        }`}
                      >
                        {isFav ? "★" : "☆"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!value && query && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
            {loading && (
              <div className="px-3 py-2 text-xs text-[var(--ink-3)]">
                searching…
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-3 py-2 text-xs text-[var(--ink-3)]">
                no matches
              </div>
            )}
            <ul className="divide-y divide-white/[0.04]">
              {results.map((p) => {
                const isFav = favs.includes(p.id);
                return (
                  <li key={p.id}>
                    <div className="flex w-full items-stretch gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelect(p)}
                        className="flex flex-1 items-start justify-between gap-3 px-3 py-2 text-left transition hover:bg-white/[0.03]"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm text-white">
                            {p.plan || p.parent}
                          </div>
                          <div className="truncate text-[11px] text-[var(--ink-3)]">
                            {p.parent} · {p.rowCategory}
                          </div>
                        </div>
                        <Badge tone={p.light}>{p.light}</Badge>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFav(p.id)}
                        aria-label={
                          isFav ? "Unfavorite this payor" : "Favorite this payor"
                        }
                        className={`px-2 text-base transition ${
                          isFav
                            ? "text-[var(--gold-bright)]"
                            : "text-[var(--ink-4)] hover:text-[var(--periwinkle)]"
                        }`}
                      >
                        {isFav ? "★" : "☆"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {value ? (
        <>
          <div className="flex items-start justify-between border-t border-white/[0.06] pt-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                {value.parent}
              </div>
              <div
                className="font-display mt-1 truncate text-xl text-white"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                {value.plan || value.parent}
              </div>
              {value.cardClues && (
                <div className="mt-1 text-[11px] text-[var(--ink-3)]">
                  Card: <span className="text-[var(--ink-2)]">{value.cardClues}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleFav(value.id)}
                  aria-label={
                    favs.includes(value.id)
                      ? "Unfavorite this payor"
                      : "Favorite this payor"
                  }
                  className={`text-base transition ${
                    favs.includes(value.id)
                      ? "text-[var(--gold-bright)]"
                      : "text-[var(--ink-4)] hover:text-[var(--periwinkle)]"
                  }`}
                >
                  {favs.includes(value.id) ? "★" : "☆"}
                </button>
                <Badge tone={value.light}>{value.light}</Badge>
              </div>
              {value.confidenceTag && (
                <span className="text-[9px] uppercase tracking-[0.16em] text-[var(--ink-4)]">
                  {value.confidenceTag.replace(" (pre-2026 matrix)", "")}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["OON %", value.oonPct],
              ["Admit rule", value.admitRule],
              ["LOS sweet spot", value.losDays ? `${value.losDays} days` : ""],
              ["Est. / day", value.estPerDay],
              ["Denial pattern", value.denialPattern],
              ["Appeal ROI", value.appealRoi],
              ["Prior auth", value.priorAuthRequired],
              ["Timely filing", value.timelyFilingDays ? `${value.timelyFilingDays} days` : ""],
              ["Exception authority", value.exceptionAuthority],
              ["Med necessity", value.medNecessityThreshold],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
                >
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                    {k}
                  </div>
                  <div className="mt-0.5 font-mono text-[12px] tabular-nums text-white">
                    {v}
                  </div>
                </div>
              ))}
          </div>

          {value.appealNotes && (
            <div className="rounded-lg border border-[var(--periwinkle)]/20 bg-[var(--violet)]/[0.06] px-3 py-2 text-xs italic leading-relaxed text-[var(--ink-2)]">
              {value.appealNotes}
            </div>
          )}

          {tier && (
            <div className="border-t border-white/[0.06] pt-4">
              <div className="overline mb-2">Claims playbook · {tier.label}</div>
              <p className="mb-3 text-xs italic text-[var(--ink-2)]">
                {tier.strategy}
              </p>
              <ol className="space-y-2">
                {tier.phases.map((p) => (
                  <li
                    key={p.phase}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-xs"
                  >
                    <div className="flex-1">
                      <div className="text-white">{p.phase}</div>
                      <div className="text-[var(--ink-3)]">{p.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[11px] tabular-nums text-[var(--periwinkle)]">
                        {p.timeline}
                      </div>
                      <div className="font-mono text-[11px] tabular-nums text-white">
                        {p.rate}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-left text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-white"
          >
            Clear payor →
          </button>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] px-3 py-6 text-center text-xs text-[var(--ink-3)]">
          Type any plan name to search the ANTN payor matrix.
        </div>
      )}
    </Card>
  );
}
