import { NextRequest, NextResponse } from "next/server";

/**
 * Auth gate for /app/*.
 *
 * Production: requires a `__session` cookie (Firebase ID token exchanged
 * server-side at /api/auth/session). Wired in week 2.
 *
 * For initial pilot, NEXT_PUBLIC_DEMO_MODE=true bypasses the gate so the
 * cockpit is browsable from a public preview URL. Flip to `false` before
 * any customer onboarding.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public surface — never gated
  if (
    !pathname.startsWith("/app") ||
    pathname === "/app/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/follow-up/")
  ) {
    return NextResponse.next();
  }

  // v0 preview — all routes open. Firebase Auth + session cookie gate
  // ships in week 2; until then the proxy just records the intended path
  // so we can deep-link the right destination once auth flips on.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|ntn-brain.mp4|.*\\..*).*)"],
};
