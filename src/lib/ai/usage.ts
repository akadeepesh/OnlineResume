import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiUsage } from "@/lib/db/schema";

/**
 * Use one of today's AI imports. Atomic: the count only goes up while it's
 * under the limit, so parallel requests can't overshoot. Counted before the
 * AI call, so failed attempts count too (they cost the same).
 * Days are UTC.
 */
export async function consumeAiImport(userId: string, dailyLimit: number): Promise<{ allowed: boolean; used: number }> {
  const rows = await db()
    .insert(aiUsage)
    .values({ userId, day: sql`(now() at time zone 'utc')::date`, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.day],
      set: { count: sql`${aiUsage.count} + 1` },
      setWhere: sql`${aiUsage.count} < ${dailyLimit}`,
    })
    .returning({ count: aiUsage.count });
  const row = rows[0];
  return row ? { allowed: true, used: row.count } : { allowed: false, used: dailyLimit };
}
