"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { blankResume } from "@/lib/resume/draft";
import { parseResume } from "@/lib/resume/schema";
import * as queries from "@/lib/resumes/queries";
import { RESUME_TITLE_MAX as TITLE_MAX, slugify } from "@/lib/resumes/slug";

// ============================================================================
// Dashboard actions. Each one: signed in? → validate input with zod → run a
// query scoped to the session's user id → refresh the dashboard. Errors come
// back as messages; nothing here trusts ids or titles from the client.
// ============================================================================

export type ActionResult = { ok: true } | { ok: false; error: string };

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

function done(): ActionResult {
  revalidatePath("/dashboard");
  return { ok: true };
}

/** How many resumes the user has, or an error when the plan's limit is reached. */
async function checkQuota(userId: string): Promise<{ used: number; error?: ActionResult }> {
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
  await queries.insertResume(user.id, { title: title.data, data, isPrimary: quota.used === 0 }, slugify(title.data));
  return done();
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
  const parsed = parseResume(source.data);
  if (!parsed.success) return { ok: false, error: "This resume couldn't be copied. Open it and save it first." };

  const title = `${source.title} (copy)`.slice(0, TITLE_MAX);
  await queries.insertResume(
    user.id,
    { title, data: parsed.data, template: source.template },
    source.slug,
  );
  return done();
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
