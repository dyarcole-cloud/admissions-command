import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Orbs } from "@/components/marketing/Orbs";

export const metadata: Metadata = {
  title: "Your next step",
  description: "Personalized next-step information from your admissions call.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

function pick(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function FollowUpPage(props: {
  params: Params;
  searchParams: Search;
}) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  const firstName = pick(sp, "n");
  const date = pick(sp, "d");
  const time = pick(sp, "t");
  const facility = pick(sp, "f");
  const contactName = pick(sp, "cn");
  const contactPhone = pick(sp, "cp");
  const note = pick(sp, "note");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Orbs />
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-6 md:py-8">
        <Link href="/" aria-label="Home">
          <Logo size="md" />
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)] print:hidden">
          ref · {token.slice(0, 8)}
        </span>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl space-y-6 px-6 pb-16 md:pb-24">
        <div>
          <span className="accent-line mb-4 block" />
          <span className="overline">Next step · for {firstName || "you"}</span>
          <h1
            className="font-display mt-3 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.022em] text-white"
            style={{ fontVariationSettings: "'opsz' 120" }}
          >
            We&apos;ve got you.{" "}
            <span
              className="hero-gradient-text italic"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              Here&apos;s what&apos;s next.
            </span>
          </h1>
          <p className="mt-4 text-base text-[var(--ink-2)]">
            This page was made for you after our call. Save it, screenshot it,
            share it with whoever&apos;s helping you through this — partner,
            parent, friend, sponsor. None of your private health details are on
            this page on purpose.
          </p>
        </div>

        {(date || time || facility) && (
          <Card variant="aurora">
            <div className="overline">Your appointment</div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Date
                </div>
                <div
                  className="font-display mt-1 text-2xl text-white"
                  style={{ fontVariationSettings: "'opsz' 96" }}
                >
                  {date || "TBD"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Time
                </div>
                <div className="font-mono mt-1 text-2xl tabular-nums text-white">
                  {time || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  Where
                </div>
                <div className="mt-1 text-base text-white">
                  {facility || "We'll confirm by phone"}
                </div>
              </div>
            </div>
          </Card>
        )}

        {(contactName || contactPhone) && (
          <Card variant="aurora">
            <div className="overline">Your point of contact</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span
                className="font-display text-xl text-white"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                {contactName || "Your admissions team"}
              </span>
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}
                  className="rounded-full border border-[var(--periwinkle)]/40 bg-[var(--violet)]/[0.08] px-3 py-1 font-mono text-sm text-white"
                >
                  {contactPhone}
                </a>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Call or text any time. If they&apos;re not available, leave a
              message — they will get back to you the same day.
            </p>
          </Card>
        )}

        <Card variant="aurora">
          <div className="overline mb-2">What to bring</div>
          <ul className="space-y-2 text-sm text-[var(--ink-2)]">
            {[
              "Photo ID (driver's license or state ID)",
              "Insurance card (front and back — phone photo is fine)",
              "Current medications — bottles in original packaging if possible, or a written list with name + dose + frequency",
              "A small bag: clothes for 7 days, toiletries (sealed), comfortable shoes",
              "Phone charger",
              "Names + phone numbers of people you want us to be able to talk to (parent, partner, sponsor)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs italic text-[var(--ink-3)]">
            Don&apos;t bring: outside food, alcohol, non-prescribed substances,
            weapons. We&apos;ll secure valuables on arrival.
          </p>
        </Card>

        {note && (
          <Card variant="aurora">
            <div className="overline">A note for you</div>
            <p
              className="font-display mt-2 text-[15px] italic leading-relaxed text-[var(--ink-2)]"
              style={{ fontVariationSettings: "'opsz' 72" }}
            >
              {note}
            </p>
          </Card>
        )}

        <Card variant="flat" className="border-[var(--error)]/30">
          <div className="overline mb-2">If things get hard before then</div>
          <ul className="space-y-2 text-sm text-[var(--ink-2)]">
            <li>
              <span className="text-white">988</span> — Suicide &amp; Crisis
              Lifeline. Call or text. 24/7. Free.
            </li>
            <li>
              <span className="text-white">Text HOME to 741741</span> — Crisis
              Text Line. Useful when voice is hard.
            </li>
            <li>
              <span className="text-white">911</span> — only if you or someone
              else is in immediate physical danger.
            </li>
          </ul>
          <p className="mt-3 text-xs italic text-[var(--ink-3)]">
            You don&apos;t have to white-knuckle it alone between now and your
            appointment. Use these. We&apos;d rather get a call from a hotline
            than not see you on intake day.
          </p>
        </Card>

        <Card variant="flat">
          <p className="text-sm text-[var(--ink-2)]">
            You did the hardest thing already — you called. The rest is logistics.
            We&apos;re here.
          </p>
        </Card>

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
          Powered by Northbound Treatment Network · Admissions Command
        </p>
      </section>
    </main>
  );
}
