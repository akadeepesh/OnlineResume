import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

/** Whether a (normalized, valid) username already belongs to someone. */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const [row] = await db().select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  return Boolean(row);
}
