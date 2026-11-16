import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { resumeFiles, resumes, users } from "@/lib/db/schema";

// ============================================================================
// Account-level data: everything a user owns, for export and deletion.
// ============================================================================

export type UsernameChange = { ok: true } | { ok: false; reason: "taken" | "missing" };

export async function changeUsername(userId: string, username: string): Promise<UsernameChange> {
  try {
    const rows = await db().update(users).set({ username }).where(eq(users.id, userId)).returning({ id: users.id });
    return rows.length > 0 ? { ok: true } : { ok: false, reason: "missing" };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "taken" };
    throw error;
  }
}

/**
 * Everything we store about a user, as plain JSON. Original files are listed
 * with their details; their contents can be downloaded one by one.
 */
export async function exportAccount(userId: string) {
  const [user] = await db()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      username: users.username,
      plan: users.plan,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));
  const [ownResumes, files] = await Promise.all([
    db().select().from(resumes).where(eq(resumes.userId, userId)),
    db()
      .select({
        id: resumeFiles.id,
        resumeId: resumeFiles.resumeId,
        fileName: resumeFiles.fileName,
        mimeType: resumeFiles.mimeType,
        sizeBytes: resumeFiles.sizeBytes,
        allowDownload: resumeFiles.allowDownload,
        createdAt: resumeFiles.createdAt,
      })
      .from(resumeFiles)
      .where(eq(resumeFiles.userId, userId)),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    account: user ?? null,
    resumes: ownResumes,
    originalFiles: files,
  };
}

/**
 * Deletes the user. Sessions, sign-in methods, resumes, files and AI usage
 * go with it (every table references users with ON DELETE CASCADE).
 */
export async function deleteAccount(userId: string): Promise<void> {
  await db().delete(users).where(eq(users.id, userId));
}
