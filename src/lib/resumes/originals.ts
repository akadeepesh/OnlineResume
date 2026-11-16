import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { resumeFiles, resumes } from "@/lib/db/schema";
import type { SourceMap } from "@/lib/import/source-map";

// ============================================================================
// Original files a resume was imported from, kept for "Download original".
// One per resume (unique resume_id). Owner-scoped like every other query.
// ============================================================================

export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const PDF_MIME = "application/pdf";

/** File types we store and serve back. Anything else is never served. */
export const ORIGINAL_TYPES: Record<string, { extension: string }> = {
  [DOCX_MIME]: { extension: "docx" },
  [PDF_MIME]: { extension: "pdf" },
};

export async function saveOriginal(
  userId: string,
  resumeId: string,
  file: { fileName: string; mimeType: string; content: Uint8Array; sourceMap?: SourceMap },
): Promise<void> {
  await db().insert(resumeFiles).values({
    userId,
    resumeId,
    fileName: file.fileName,
    mimeType: file.mimeType,
    sizeBytes: file.content.length,
    content: file.content,
    sourceMap: file.sourceMap ?? null,
  });
}

/** File names of the user's originals, by resume id (for the dashboard). */
export async function originalNames(userId: string, resumeIds: string[]): Promise<Map<string, string>> {
  if (resumeIds.length === 0) return new Map();
  const rows = await db()
    .select({ resumeId: resumeFiles.resumeId, fileName: resumeFiles.fileName })
    .from(resumeFiles)
    .where(and(eq(resumeFiles.userId, userId), inArray(resumeFiles.resumeId, resumeIds)));
  return new Map(rows.map((row) => [row.resumeId, row.fileName]));
}

/** Whether a resume has an original, and whether visitors may download it. */
export async function originalInfo(userId: string, resumeId: string) {
  const [row] = await db()
    .select({ fileName: resumeFiles.fileName, allowDownload: resumeFiles.allowDownload })
    .from(resumeFiles)
    .where(and(eq(resumeFiles.userId, userId), eq(resumeFiles.resumeId, resumeId)))
    .limit(1);
  return row ?? null;
}

export async function setOriginalDownload(userId: string, resumeId: string, allow: boolean): Promise<boolean> {
  const rows = await db()
    .update(resumeFiles)
    .set({ allowDownload: allow })
    .where(and(eq(resumeFiles.userId, userId), eq(resumeFiles.resumeId, resumeId)))
    .returning({ id: resumeFiles.id });
  return rows.length > 0;
}

/** The file plus what's needed to decide who may download it. */
export async function originalForDownload(resumeId: string) {
  const [row] = await db()
    .select({
      fileName: resumeFiles.fileName,
      mimeType: resumeFiles.mimeType,
      content: resumeFiles.content,
      allowDownload: resumeFiles.allowDownload,
      ownerId: resumes.userId,
      isPublished: resumes.isPublished,
    })
    .from(resumeFiles)
    .innerJoin(resumes, eq(resumes.id, resumeFiles.resumeId))
    .where(eq(resumeFiles.resumeId, resumeId))
    .limit(1);
  return row ?? null;
}

/** Visitors may see the original's link only for published resumes that allow it. */
export async function publicOriginal(resumeId: string): Promise<{ fileName: string } | null> {
  const [row] = await db()
    .select({ fileName: resumeFiles.fileName })
    .from(resumeFiles)
    .where(and(eq(resumeFiles.resumeId, resumeId), eq(resumeFiles.allowDownload, true)))
    .limit(1);
  return row ?? null;
}
