import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { authPageHref } from "@/lib/auth/redirect";

// ============================================================================
// Route protection (Next 16's proxy, formerly middleware). Only checks that a
// session cookie exists, so it's fast and never touches the database. A stale
// or forged cookie gets through here and is stopped by `requireSession` in the
// page itself, which is the real check.
// ============================================================================

export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  return NextResponse.redirect(new URL(authPageHref("sign-in", pathname + search), request.url));
}

export const config = {
  // Saved resumes in the editor; /editor itself (guest) and its preview frame stay public.
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/editor/((?!preview(?:/|$)).+)"],
};
