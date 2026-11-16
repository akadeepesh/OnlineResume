import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { accounts, sessions, users, verifications } from "@/lib/db/schema";
import { clientEnv, serverEnv } from "@/lib/env";
import { socialProviders } from "./providers";

// ============================================================================
// Better Auth, server side. Email + password, Google and GitHub.
//
// - Tables live in lib/db/schema.ts. The adapter finds them by Better Auth's
//   model names (user, session, account, verification).
// - Created lazily, like the database: pages that don't need accounts work
//   without DATABASE_URL, and the build never needs secrets.
// - Account linking: signing in with Google or GitHub joins an existing
//   account with the same email only when both sides have a verified email.
//   Email + password accounts stay unverified until we send emails (later
//   PR), so they don't get linked. That blocks a takeover where someone signs
//   up with another person's email and waits for them to use Google.
// ============================================================================

function createAuth() {
  const env = serverEnv();
  if (!env.BETTER_AUTH_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is not set. See docs/SETUP.md (Accounts).");
  }

  return betterAuth({
    appName: "OnlineResume",
    baseURL: env.BETTER_AUTH_URL ?? clientEnv.NEXT_PUBLIC_SITE_URL,
    // Unset only in development, where Better Auth uses a fixed dev secret.
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: { user: users, session: sessions, account: accounts, verification: verifications },
    }),
    user: {
      additionalFields: {
        // Set by our own code (onboarding, billing), never by the sign-up form.
        username: { type: "string", required: false, input: false },
        plan: { type: "string", required: false, defaultValue: "free", input: false },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    socialProviders: socialProviders(env),
    account: {
      accountLinking: { enabled: true },
    },
    session: {
      // Signed copy of the session in a cookie for 5 minutes: most requests
      // skip the database round trip.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    telemetry: { enabled: false },
    // Lets server actions set cookies (must stay last).
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

export function getAuth(): Auth {
  instance ??= createAuth();
  return instance;
}

/** Accounts need a database. Without one, auth pages explain instead of crashing. */
export function isAuthConfigured(): boolean {
  return Boolean(serverEnv().DATABASE_URL);
}
