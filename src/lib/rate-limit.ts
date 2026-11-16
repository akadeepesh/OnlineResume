import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

// ============================================================================
// Fixed-window rate limits for server actions, stored in Postgres so every
// serverless instance shares them. One upsert per check: the window restarts
// once it has passed, otherwise the count goes up.
//
// Keys are "<action>:<user id>", so the table holds one row per user and
// action at most.
// ============================================================================

export interface Limit {
  /** Requests allowed per window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

/** Limits per action. Generous for normal use, tight enough to stop abuse. */
export const LIMITS = {
  /** Autosave sends at most about one request a second while typing. */
  save: { max: 120, windowSeconds: 60 },
  usernameCheck: { max: 60, windowSeconds: 60 },
  usernameChange: { max: 10, windowSeconds: 3600 },
  createResume: { max: 30, windowSeconds: 3600 },
  sharing: { max: 60, windowSeconds: 60 },
  export: { max: 10, windowSeconds: 3600 },
} satisfies Record<string, Limit>;

export type LimitName = keyof typeof LIMITS;

/** Count one request. Returns false when the limit for this window is used up. */
export async function allow(name: LimitName, subject: string): Promise<boolean> {
  const { max, windowSeconds } = LIMITS[name];
  const key = `${name}:${subject}`;
  const expired = sql`${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds})`;
  const [row] = await db()
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: sql`now()` })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });
  return (row?.count ?? 1) <= max;
}

export const TOO_MANY = "You're doing that too often. Wait a little and try again.";
