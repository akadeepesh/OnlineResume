/** Postgres error code for a unique constraint violation. */
const UNIQUE_VIOLATION = "23505";

/**
 * True when a query failed on a unique constraint. Drizzle wraps driver errors
 * (`DrizzleQueryError.cause`), so this walks the cause chain.
 */
export function isUniqueViolation(error: unknown): boolean {
  for (let current = error, depth = 0; current && depth < 5; depth++) {
    if (typeof current !== "object") return false;
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
