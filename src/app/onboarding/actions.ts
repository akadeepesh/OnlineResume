"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth/redirect";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { users } from "@/lib/db/schema";
import { isUsernameTaken } from "@/lib/db/usernames";
import { validateUsername } from "@/lib/username";

export type Availability =
  | { status: "available"; username: string }
  | { status: "taken" | "invalid"; message: string };

const TAKEN = "That username is taken.";

/** Live check while typing. Signed-in users only. */
export async function checkUsername(raw: string): Promise<Availability> {
  if (!(await getSession())) return { status: "invalid", message: "Sign in again to continue." };
  if (typeof raw !== "string") return { status: "invalid", message: "Enter a username." };

  const check = validateUsername(raw);
  if (!check.ok) return { status: "invalid", message: check.reason };

  return (await isUsernameTaken(check.username))
    ? { status: "taken", message: TAKEN }
    : { status: "available", username: check.username };
}

export interface ClaimState {
  error?: string;
}

/**
 * Claims the username once. Changing it later belongs in account settings.
 * The unique index decides races: two people submitting the same name at once
 * get one success and one "taken".
 */
export async function claimUsername(form: FormData): Promise<ClaimState> {
  const session = await getSession();
  if (!session) return { error: "Sign in again to continue." };

  const check = validateUsername(String(form.get("username") ?? ""));
  if (!check.ok) return { error: check.reason };

  try {
    await db()
      .update(users)
      .set({ username: check.username })
      .where(and(eq(users.id, session.user.id), isNull(users.username)));
  } catch (error) {
    if (isUniqueViolation(error)) return { error: TAKEN };
    throw error;
  }
  // No row updated means a username was already set: either way, move on.
  redirect(safeNext(String(form.get("next") ?? "")));
}
