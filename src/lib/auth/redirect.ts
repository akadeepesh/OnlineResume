// ============================================================================
// Where to send people after signing in. `next` comes from the URL, so it is
// untrusted: only same-site paths are allowed, never another origin.
// ============================================================================

export const DEFAULT_AFTER_SIGN_IN = "/dashboard";

/** A same-site path from `?next=`, or the fallback. */
export function safeNext(value: string | string[] | null | undefined, fallback = DEFAULT_AFTER_SIGN_IN): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/")) return fallback;
  // "//evil.com" and "/\evil.com" are protocol-relative URLs in browsers.
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // Browsers strip tabs and newlines, turning "/\t/evil.com" into "//evil.com".
  if ([...next].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f)) return fallback;
  // Never bounce back into the auth pages themselves.
  if (/^\/(sign-in|sign-up)(\/|\?|#|$)/.test(next)) return fallback;
  return next;
}

/** "/sign-in?next=/editor", leaving out the default destination. */
export function authPageHref(page: "sign-in" | "sign-up", next: string): string {
  return next === DEFAULT_AFTER_SIGN_IN ? `/${page}` : `/${page}?next=${encodeURIComponent(next)}`;
}
