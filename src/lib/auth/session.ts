import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { authPageHref, onboardingHref } from "./redirect";
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

/**
 * The user's username, read from the database rather than the session: the
 * session cookie caches the user for a few minutes, so right after onboarding
 * it would still say "no username". Cached per request.
 */
export const getUsername = cache(async (userId: string): Promise<string | null> => {
  const [row] = await db().select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.username ?? null;
});

/** Like `requireSession`, and sends users without a username to onboarding first. */
export async function requireOnboarded(returnTo: string): Promise<SessionData & { username: string }> {
  const session = await requireSession(returnTo);
  const username = await getUsername(session.user.id);
  if (!username) redirect(onboardingHref(returnTo));
  return { ...session, username };
}
