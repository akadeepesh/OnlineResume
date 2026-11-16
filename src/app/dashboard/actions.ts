"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { blankResume, parseResumeDraft } from "@/lib/resume/draft";
import { AI_TEXT_MAX, AI_TEXT_MIN, resumeFromExtraction } from "@/lib/ai/extracted";
import { DEFAULT_GROQ_MODEL, ExtractionError, groqExtractor } from "@/lib/ai/groq";
import { consumeAiImport } from "@/lib/ai/usage";
import { serverEnv } from "@/lib/env";
import { buildEditedOriginal } from "@/lib/export/original";
import { limitsFor } from "@/lib/limits";
import * as queries from "@/lib/resumes/queries";
import { allow, TOO_MANY } from "@/lib/rate-limit";
import { RESUME_TITLE_MAX as TITLE_MAX, slugify } from "@/lib/resumes/slug";
import { isTemplateSlug } from "@/templates/meta";

// ============================================================================
// Dashboard actions. Each one: signed in? → validate input with zod → run a
// query scoped to the session's user id → refresh the dashboard. Errors come
// back as messages; nothing here trusts ids or titles from the client.
// ============================================================================

/** `id` is set when a resume was created (create, duplicate, import). */
export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const idSchema = z.uuid();
const titleSchema = z
  .string()
  .trim()
  .min(1, "Give it a title.")
  .max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters.`);

const SIGNED_OUT: ActionResult = { ok: false, error: "Your session ended. Sign in again." };
const NOT_FOUND: ActionResult = { ok: false, error: "That resume doesn't exist anymore." };

async function currentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

function done(id?: string): ActionResult {
  revalidatePath("/dashboard");
  return id ? { ok: true, id } : { ok: true };
}

/** How many resumes the user has, or an error when the plan's limit is reached. */
async function checkQuota(userId: string): Promise<{ used: number; error?: ActionResult }> {
  // Every path that creates a resume comes through here.
  if (!(await allow("createResume", userId))) return { used: 0, error: { ok: false, error: TOO_MANY } };
  const { used, limit } = await queries.resumeQuota(userId);
  if (used < limit) return { used };
  return { used, error: { ok: false, error: `You can keep up to ${limit} resumes. Delete one to make room.` } };
}

export async function createResume(rawTitle: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const title = titleSchema.safeParse(rawTitle);
  if (!title.success) return { ok: false, error: title.error.issues[0]!.message };

  const quota = await checkQuota(user.id);
  if (quota.error) return quota.error;

  const data = blankResume();
  data.profile.name = user.name;
  const id = await queries.insertResume(
    user.id,
    { title: title.data, data, isPrimary: quota.used === 0 },
    slugify(title.data),
  );
  return done(id);
}

export async function renameResume(rawId: unknown, rawTitle: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const id = idSchema.safeParse(rawId);
  const title = titleSchema.safeParse(rawTitle);
  if (!id.success) return NOT_FOUND;
  if (!title.success) return { ok: false, error: title.error.issues[0]!.message };

  return (await queries.renameResume(user.id, id.data, title.data)) ? done() : NOT_FOUND;
}

export async function duplicateResume(rawId: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const id = idSchema.safeParse(rawId);
  if (!id.success) return NOT_FOUND;

  const source = await queries.getOwnedResume(user.id, id.data);
  if (!source) return NOT_FOUND;
  const quota = await checkQuota(user.id);
  if (quota.error) return quota.error;

  // Rows are input like any other: parse (and migrate) before copying.
  const parsed = parseResumeDraft(source.data);
  if (!parsed.success) return { ok: false, error: "This resume couldn't be copied. Open it and save it first." };

  const title = `${source.title} (copy)`.slice(0, TITLE_MAX);
  const copyId = await queries.insertResume(
    user.id,
    { title, data: parsed.data, template: source.template },
    source.slug,
  );
  return done(copyId);
}

export async function setPrimaryResume(rawId: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const id = idSchema.safeParse(rawId);
  if (!id.success) return NOT_FOUND;
  return (await queries.setPrimaryResume(user.id, id.data)) ? done() : NOT_FOUND;
}

export async function deleteResume(rawId: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const id = idSchema.safeParse(rawId);
  if (!id.success) return NOT_FOUND;
  return (await queries.deleteResume(user.id, id.data)) ? done() : NOT_FOUND;
}

/**
 * Save a whole resume as a new one: the guest draft from this browser, or a
 * file import. Validated like any other input.
 */
export async function importResume(rawResume: unknown, rawTemplate: unknown, rawTitle?: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const parsed = parseResumeDraft(rawResume);
  if (!parsed.success) return { ok: false, error: "That resume has data we can't read." };
  if (JSON.stringify(parsed.data).length > 800_000) {
    return { ok: false, error: "This resume is too large to save. Try a smaller photo." };
  }
  const template = typeof rawTemplate === "string" && isTemplateSlug(rawTemplate) ? rawTemplate : "classic";

  const fallbackTitle = parsed.data.profile.name.trim() || "My resume";
  const title = titleSchema.safeParse(rawTitle ?? fallbackTitle);
  const finalTitle = title.success ? title.data : fallbackTitle.slice(0, TITLE_MAX);

  const quota = await checkQuota(user.id);
  if (quota.error) return quota.error;

  const id = await queries.insertResume(
    user.id,
    { title: finalTitle, data: parsed.data, template, isPrimary: quota.used === 0 },
    slugify(finalTitle),
  );
  return done(id);
}

/**
 * AI-assisted import: pasted resume text → structured resume → new resume.
 * Counts against the plan's daily AI limit before calling the model.
 */
export async function importFromText(rawText: unknown): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return SIGNED_OUT;
  const { GROQ_API_KEY, GROQ_MODEL } = serverEnv();
  if (!GROQ_API_KEY) return { ok: false, error: "AI import isn't available here." };

  const text = typeof rawText === "string" ? rawText.trim() : "";
  if (text.length < AI_TEXT_MIN) return { ok: false, error: "Paste a bit more of your resume first." };
  if (text.length > AI_TEXT_MAX) return { ok: false, error: `That's too long. Paste up to ${AI_TEXT_MAX.toLocaleString("en")} characters.` };

  const quota = await checkQuota(user.id);
  if (quota.error) return quota.error;

  const daily = limitsFor(await queries.userPlan(user.id)).aiImportsPerDay;
  const usage = await consumeAiImport(user.id, daily);
  if (!usage.allowed) return { ok: false, error: `You've used today's ${daily} AI imports. Try again tomorrow.` };

  let extracted: unknown;
  try {
    extracted = await groqExtractor(GROQ_API_KEY, GROQ_MODEL ?? DEFAULT_GROQ_MODEL).extract(text);
  } catch (error) {
    console.error("AI import failed", error instanceof ExtractionError ? error.message : error);
    return { ok: false, error: "The AI couldn't read that right now. Try again, or fill in the editor yourself." };
  }
  const resume = resumeFromExtraction(extracted);
  if (!resume) return { ok: false, error: "We couldn't find a resume in that text." };

  const title = (resume.profile.name.trim() || "Imported resume").slice(0, TITLE_MAX);
  const id = await queries.insertResume(
    user.id,
    { title, data: resume, isPrimary: quota.used === 0 },
    slugify(title),
  );
  return done(id);
}

export type EditedOriginalReport =
  | { ok: true; applied: number; unapplied: { label: string; to: string }[] }
  | { ok: false; error: string };

/** What "Download edited original" will change, and what it can't place. */
export async function editedOriginalReport(rawId: unknown): Promise<EditedOriginalReport> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Your session ended. Sign in again." };
  if (!(await allow("sharing", user.id))) return { ok: false, error: TOO_MANY };
  const id = idSchema.safeParse(rawId);
  if (!id.success) return { ok: false, error: "That resume doesn't exist anymore." };
  const result = await buildEditedOriginal(user.id, id.data);
  if (!result.ok) return { ok: false, error: result.error };
  return {
    ok: true,
    applied: result.plan.applied.length,
    unapplied: result.plan.unapplied.map((change) => ({ label: change.label, to: change.to })),
  };
}
