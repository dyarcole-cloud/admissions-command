import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Orbs } from "@/components/marketing/Orbs";
import { createT, type Locale } from "@/lib/data/i18n";

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
  const lang = (pick(sp, "lang") === "es" ? "es" : "en") as Locale;
  const t = createT(lang);

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

      <section className="relative z-10 mx-auto max-w-3xl space-y-6 px-6 pb-16 md:pb-24" lang={lang}>
        <div>
          <span className="accent-line mb-4 block" />
          <span className="overline">
            {t("fu.next_step_for")} {firstName || t("fu.you")}
          </span>
          <h1
            className="font-display mt-3 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.022em] text-white"
            style={{ fontVariationSettings: "'opsz' 120" }}
          >
            {t("fu.headline_1")}{" "}
            <span
              className="hero-gradient-text italic"
              style={{ fontVariationSettings: "'opsz' 96" }}
            >
              {t("fu.headline_2")}
            </span>
          </h1>
          <p className="mt-4 text-base text-[var(--ink-2)]">{t("fu.intro")}</p>
        </div>

        {(date || time || facility) && (
          <Card variant="aurora">
            <div className="overline">{t("fu.appointment")}</div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  {t("fu.date")}
                </div>
                <div
                  className="font-display mt-1 text-2xl text-white"
                  style={{ fontVariationSettings: "'opsz' 96" }}
                >
                  {date || t("fu.tbd")}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  {t("fu.time")}
                </div>
                <div className="font-mono mt-1 text-2xl tabular-nums text-white">
                  {time || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
                  {t("fu.where")}
                </div>
                <div className="mt-1 text-base text-white">
                  {facility || t("fu.confirm_by_phone")}
                </div>
              </div>
            </div>
          </Card>
        )}

        {(contactName || contactPhone) && (
          <Card variant="aurora">
            <div className="overline">{t("fu.contact")}</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span
                className="font-display text-xl text-white"
                style={{ fontVariationSettings: "'opsz' 72" }}
              >
                {contactName || t("fu.admissions_team")}
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
              {t("fu.contact_blurb")}
            </p>
          </Card>
        )}

        <Card variant="aurora">
          <div className="overline mb-2">{t("fu.what_to_bring")}</div>
          <ul className="space-y-2 text-sm text-[var(--ink-2)]">
            {[
              "fu.item_id",
              "fu.item_insurance",
              "fu.item_meds",
              "fu.item_bag",
              "fu.item_charger",
              "fu.item_contacts",
            ].map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs italic text-[var(--ink-3)]">
            {t("fu.dont_bring")}
          </p>
        </Card>

        {note && (
          <Card variant="aurora">
            <div className="overline">{t("fu.note")}</div>
            <p
              className="font-display mt-2 text-[15px] italic leading-relaxed text-[var(--ink-2)]"
              style={{ fontVariationSettings: "'opsz' 72" }}
            >
              {note}
            </p>
          </Card>
        )}

        <Card variant="flat" className="border-[var(--error)]/30">
          <div className="overline mb-2">{t("fu.crisis_heading")}</div>
          <ul className="space-y-2 text-sm text-[var(--ink-2)]">
            <li>{t("fu.crisis_988")}</li>
            <li>{t("fu.crisis_text")}</li>
            <li>{t("fu.crisis_911")}</li>
          </ul>
          <p className="mt-3 text-xs italic text-[var(--ink-3)]">
            {t("fu.crisis_blurb")}
          </p>
        </Card>

        <Card variant="flat">
          <p className="text-sm text-[var(--ink-2)]">{t("fu.close")}</p>
        </Card>

        <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-[var(--ink-4)]">
          <span className="font-mono">{t("fu.footer")}</span>
          <span className="flex gap-2">
            <Link
              href={`/follow-up/${token}?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(sp).flatMap(([k, v]) =>
                    typeof v === "string" ? [[k, v]] : []
                  )
                ),
                lang: "en",
              }).toString()}`}
              className={lang === "en" ? "text-white" : "hover:text-white"}
            >
              EN
            </Link>
            <span className="text-[var(--ink-4)]">·</span>
            <Link
              href={`/follow-up/${token}?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries(sp).flatMap(([k, v]) =>
                    typeof v === "string" ? [[k, v]] : []
                  )
                ),
                lang: "es",
              }).toString()}`}
              className={lang === "es" ? "text-white" : "hover:text-white"}
            >
              ES
            </Link>
          </span>
        </div>
      </section>
    </main>
  );
}
