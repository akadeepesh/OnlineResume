"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { parseResumeDraft } from "@/lib/resume/draft";
import { setOriginalDownload } from "@/lib/resumes/originals";
import { saveResumeContent, updateSharing as updateSharingQuery, type SharingSettings } from "@/lib/resumes/queries";
import { allow, TOO_MANY } from "@/lib/rate-limit";
import { isTemplateSlug } from "@/templates/meta";

/** Largest resume we accept, as JSON. Photos are resized in the browser to well under this. */
const MAX_CONTENT_CHARS = 800_000;

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; reason: "conflict" | "missing" | "signed-out" | "invalid" | "too-large" | "rate-limited" };

const idSchema = z.uuid();

/**
 * Autosave from the editor. `expectedUpdatedAt` is the version the editor
 * last saw (ISO string), or null to overwrite after a conflict.
 */
export async function saveResume(
  rawId: unknown,
  content: { resume: unknown; template: unknown },
  expectedUpdatedAt: string | null,
): Promise<SaveResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (!(await allow("save", session.user.id))) return { ok: false, reason: "rate-limited" };

  const id = idSchema.safeParse(rawId);
  if (!id.success) return { ok: false, reason: "missing" };
  const template = typeof content?.template === "string" && isTemplateSlug(content.template) ? content.template : null;
  if (!template) return { ok: false, reason: "invalid" };
  if (JSON.stringify(content.resume ?? null).length > MAX_CONTENT_CHARS) return { ok: false, reason: "too-large" };

  // Drafts may have an empty name; everything else is checked strictly.
  const resume = parseResumeDraft(content.resume);
  if (!resume.success) return { ok: false, reason: "invalid" };

  const expected = expectedUpdatedAt === null ? null : new Date(expectedUpdatedAt);
  if (expected && Number.isNaN(expected.getTime())) return { ok: false, reason: "invalid" };

  const result = await saveResumeContent(session.user.id, id.data, { data: resume.data, template }, expected);
  if (result.status === "saved") return { ok: true, updatedAt: result.updatedAt.toISOString() };
  return { ok: false, reason: result.status };
}

const sharingSchema = z
  .object({ isPublished: z.boolean(), noindex: z.boolean() })
  .partial()
  .strict();

/** Publish or hide a resume, and choose whether search engines may list it. */
export async function updateSharing(
  rawId: unknown,
  rawPatch: unknown,
): Promise<{ ok: true; sharing: SharingSettings } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You were signed out. Sign in again." };
  if (!(await allow("sharing", session.user.id))) return { ok: false, error: TOO_MANY };
  const id = idSchema.safeParse(rawId);
  const patch = sharingSchema.safeParse(rawPatch);
  if (!id.success || !patch.success) return { ok: false, error: "That change isn't valid." };

  const sharing = await updateSharingQuery(session.user.id, id.data, patch.data);
  if (!sharing) return { ok: false, error: "This resume was deleted." };
  revalidatePath("/dashboard");
  return { ok: true, sharing };
}

/** Let visitors download the original file from the public page, or not. */
export async function updateOriginalDownload(
  rawId: unknown,
  rawAllow: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "You were signed out. Sign in again." };
  if (!(await allow("sharing", session.user.id))) return { ok: false, error: TOO_MANY };
  const id = idSchema.safeParse(rawId);
  if (!id.success || typeof rawAllow !== "boolean") return { ok: false, error: "That change isn't valid." };
  return (await setOriginalDownload(session.user.id, id.data, rawAllow))
    ? { ok: true }
    : { ok: false, error: "This resume has no original file." };
}
