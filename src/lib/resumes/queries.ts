import { and, count, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { resumes, users, type NewResumeRow } from "@/lib/db/schema";
import { limitsFor } from "@/lib/limits";
import { uniqueSlug } from "./slug";

// ============================================================================
// Resume data access. Every function takes the owner's id and puts it in the
// WHERE clause, so a resume id from the client can never reach another
// user's row. Callers pass the id from the session, never from input.
// ============================================================================

/** Leaves `updated_at` alone: flags like "primary" aren't edits. */
const keepUpdatedAt = { updatedAt: sql`${resumes.updatedAt}` };

const owned = (userId: string, id: string) => and(eq(resumes.userId, userId), eq(resumes.id, id));

/** Dashboard rows, most recently edited first. No resume data. */
export function listResumes(userId: string) {
  return db()
    .select({
      id: resumes.id,
      title: resumes.title,
      slug: resumes.slug,
      template: resumes.template,
      isPrimary: resumes.isPrimary,
      isPublished: resumes.isPublished,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt));
}

export type ResumeListItem = Awaited<ReturnType<typeof listResumes>>[number];

export async function getOwnedResume(userId: string, id: string) {
  const [row] = await db().select().from(resumes).where(owned(userId, id)).limit(1);
  return row ?? null;
}

/** How many resumes the user has and how many their plan allows. */
export async function resumeQuota(userId: string): Promise<{ used: number; limit: number }> {
  const [[usage], [user]] = await Promise.all([
    db().select({ used: count() }).from(resumes).where(eq(resumes.userId, userId)),
    db().select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1),
  ]);
  return { used: usage?.used ?? 0, limit: limitsFor(user?.plan).resumes };
}

/**
 * Insert a resume with a slug that's free for this user. If someone else's
 * request takes the same slug in between, the unique index rejects it and we
 * pick the next one.
 */
export async function insertResume(
  userId: string,
  values: Omit<NewResumeRow, "userId" | "slug">,
  baseSlug: string,
): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const taken = await db().select({ slug: resumes.slug }).from(resumes).where(eq(resumes.userId, userId));
    const slug = uniqueSlug(baseSlug, new Set(taken.map((row) => row.slug)));
    try {
      const [row] = await db()
        .insert(resumes)
        .values({ ...values, userId, slug })
        .returning({ id: resumes.id });
      return row!.id;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) throw error;
    }
  }
  throw new Error("unreachable");
}

export async function renameResume(userId: string, id: string, title: string): Promise<boolean> {
  const rows = await db().update(resumes).set({ title }).where(owned(userId, id)).returning({ id: resumes.id });
  return rows.length > 0;
}

/** Makes one resume the primary (shown at /<username>). One batch = one transaction. */
export async function setPrimaryResume(userId: string, id: string): Promise<boolean> {
  // Check ownership first: otherwise a foreign id would clear the current primary.
  const [target] = await db().select({ id: resumes.id }).from(resumes).where(owned(userId, id)).limit(1);
  if (!target) return false;
  await db().batch([
    db()
      .update(resumes)
      .set({ isPrimary: false, ...keepUpdatedAt })
      .where(and(eq(resumes.userId, userId), eq(resumes.isPrimary, true), ne(resumes.id, id))),
    db()
      .update(resumes)
      .set({ isPrimary: true, ...keepUpdatedAt })
      .where(owned(userId, id)),
  ]);
  return true;
}

/** Deletes a resume. If it was the primary, the most recently edited other one takes over. */
export async function deleteResume(userId: string, id: string): Promise<boolean> {
  const [target] = await db()
    .select({ isPrimary: resumes.isPrimary })
    .from(resumes)
    .where(owned(userId, id))
    .limit(1);
  if (!target) return false;

  const remove = db().delete(resumes).where(owned(userId, id));
  if (!target.isPrimary) {
    await remove;
    return true;
  }
  const successor = db()
    .select({ id: resumes.id })
    .from(resumes)
    .where(and(eq(resumes.userId, userId), ne(resumes.id, id)))
    .orderBy(desc(resumes.updatedAt))
    .limit(1);
  await db().batch([
    remove,
    db()
      .update(resumes)
      .set({ isPrimary: true, ...keepUpdatedAt })
      .where(inArray(resumes.id, successor)),
  ]);
  return true;
}
