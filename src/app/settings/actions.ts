"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as account from "@/lib/account";
import { getAuth } from "@/lib/auth/server";
import { getSession, getUsername } from "@/lib/auth/session";
import { validateUsername } from "@/lib/username";

export type SettingsResult = { ok: true } | { ok: false; error: string };

const SIGNED_OUT: SettingsResult = { ok: false, error: "Your session ended. Sign in again." };

const nameSchema = z.string().trim().min(1, "Enter your name.").max(100, "Keep it under 100 characters.");

export async function updateName(rawName: unknown): Promise<SettingsResult> {
  const session = await getSession();
  if (!session) return SIGNED_OUT;
  const name = nameSchema.safeParse(rawName);
  if (!name.success) return { ok: false, error: name.error.issues[0]!.message };
  // Through Better Auth, so its cached session cookie picks up the new name.
  await getAuth().api.updateUser({ body: { name: name.data }, headers: await headers() });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateUsername(rawUsername: unknown): Promise<SettingsResult> {
  const session = await getSession();
  if (!session) return SIGNED_OUT;
  const check = validateUsername(typeof rawUsername === "string" ? rawUsername : "");
  if (!check.ok) return { ok: false, error: check.reason };
  if (check.username === (await getUsername(session.user.id))) return { ok: true };

  const result = await account.changeUsername(session.user.id, check.username);
  if (!result.ok) return { ok: false, error: result.reason === "taken" ? "That username is taken." : "Account not found." };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Deletes the account and everything in it. The user confirms by typing
 * their username, checked here too so a stray request can't do it.
 */
export async function deleteAccount(rawConfirmation: unknown): Promise<SettingsResult> {
  const session = await getSession();
  if (!session) return SIGNED_OUT;
  const username = await getUsername(session.user.id);
  const typed = typeof rawConfirmation === "string" ? rawConfirmation.trim().toLowerCase() : "";
  if (!username || typed !== username) return { ok: false, error: "Type your username exactly to confirm." };

  // Sign out first, so the session cookie is cleared in this response.
  await getAuth().api.signOut({ headers: await headers() });
  await account.deleteAccount(session.user.id);
  redirect("/?deleted=1");
}
