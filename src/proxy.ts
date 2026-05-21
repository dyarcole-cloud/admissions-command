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
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  const session = req.cookies.get("__session")?.value;
  if (session && session.length > 8) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/app/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|ntn-brain.mp4|.*\\..*).*)"],
};
