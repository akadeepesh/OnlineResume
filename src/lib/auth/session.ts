import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authPageHref } from "./redirect";
import { getAuth, isAuthConfigured } from "./server";

// ============================================================================
// Session helpers for server components, route handlers and server actions.
// `proxy.ts` only checks that a session cookie exists (fast, no database);
// these helpers do the real check, so every protected page must call one.
// ============================================================================

/** The signed-in user and session, or null. Cached per request. */
export const getSession = cache(async () => {
  if (!isAuthConfigured()) return null;
  return getAuth().api.getSession({ headers: await headers() });
});

export type SessionData = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/** The session, or a redirect to sign-in that comes back to `returnTo`. */
export async function requireSession(returnTo: string): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect(authPageHref("sign-in", returnTo));
  return session;
}
