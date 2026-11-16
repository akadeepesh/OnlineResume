"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { parseResumeDraft } from "@/lib/resume/draft";
import { saveResumeContent } from "@/lib/resumes/queries";
import { isTemplateSlug } from "@/templates/meta";

/** Largest resume we accept, as JSON. Photos are resized in the browser to well under this. */
const MAX_CONTENT_CHARS = 800_000;

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; reason: "conflict" | "missing" | "signed-out" | "invalid" | "too-large" };

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
