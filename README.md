# Admissions Command

Live-call cockpit for behavioral health admissions teams — insurance intel, clinical assessment, payor playbook, AI coaching. Built on the Northbound Treatment Network platform.

Replaces the v1 single-file React+Babel build at https://ntn-admissions-command.netlify.app/. Ports the IP (5-segment call flow, objection library, SOP traffic-light, claims-tier playbook, 10-section pre-admit assessment, ROI math) into a multi-tenant Next.js 16 app on the NBTN Nocturne design system.

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components)
- **React 19** · **TypeScript** · **Tailwind 4**
- **Firebase Auth + Firestore** (per-tenant collections, security rules) — _wires up week 2_
- **AWS Lambda + Bedrock Sonnet 4.6** for AI advisor — _shared CIQ /invoke backbone_
- **AWS Comprehend Medical** for DEID-on-submit — _week 2_
- **Vercel** deploy

## Brand

NBTN Nocturne — Fraunces (display) + Inter (body) + JetBrains Mono (data); violet `#A78BFA` / copper `#C2410C` / periwinkle `#C4B5FD` accents; brain video bg + drifting orbs + aurora cards. Emerald `#10B981` is **semantic only** (success/sync); never a brand accent.

## Routes

| Route | Purpose | Auth |
| --- | --- | --- |
| `/` | Landing | public |
| `/demo` | Three live-call scenarios (Green/Yellow/Red) with timeline playback | public |
| `/roi` | Tunable ROI calculator | public |
| `/vs` | Build vs Buy math | public |
| `/app` | Call cockpit (default) | gated |
| `/app/preadmit` | 10-section clinical assessment | gated |
| `/app/payors` | Payor playbook + claims-tier strategy | gated |
| `/app/analytics` | Call log + trend analytics | gated |
| `/app/settings` | Org branding, team, payor import | gated |
| `/app/login` | Magic-link sign-in | public |
| `/api/invoke` | Lambda passthrough (advisor.coach / advisor.summary / paa.submit) | server-only |

## Dev

```bash
npm install
npm run dev     # http://localhost:3000 (or next available)
npm run build   # production build
```

## Env

```bash
# Local-dev preview without auth. Disable for production.
NEXT_PUBLIC_DEMO_MODE=true

# AWS Lambda /invoke endpoint (Bedrock-backed advisor + DEID pipeline).
# When unset, /api/invoke falls back to a deterministic mock for advisor.coach.
LAMBDA_INVOKE_URL=
LAMBDA_INVOKE_TOKEN=
```

Copy `.env.example` to `.env.local` and fill in.

## Architecture notes

- **Auth gate via `src/proxy.ts`** — Next 16's renamed middleware. Function must be named `proxy`. Lives at `src/proxy.ts` (same level as `app/`) — moving it breaks silently.
- **`/api/invoke` is the single browser → Lambda surface.** Anthropic key never ships to the client. Auth + tenant scoping happen server-side.
- **Mock advisor fallback** so the cockpit is usable in preview before AWS is wired.
- **PWA-ready** — `manifest.webmanifest`, dynamic apple-icon via `ImageResponse`, viewport-fit cover, safe-area insets, iOS Add-to-Home app shortcuts.

## What's next (week 2 → 3)

- Firebase Auth (email link + Google), `__session` cookie exchange at `/api/auth/session`.
- Per-tenant Firestore data model (`tenants/{tid}/...`) + security rules.
- Full PAA capture + DEID-on-submit pipeline (AWS Comprehend Medical + SES + audit log).
- Real-time `onSnapshot` for `active_calls` and `payors`.
- Analytics with composite-indexed filters.
- Production cutover, BAA conversation kickoff.

Plan: `~/.claude/plans/rustling-juggling-frog.md`.
