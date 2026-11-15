import type { SocialKind } from "@/lib/resume/view";

// ============================================================================
// Small helpers for form input: tidy what people type, and spot likely typos.
// They run when a field loses focus, never while typing, so the cursor
// doesn't jump.
// ============================================================================

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Accept a username or a link and turn it into a full link. */
export function normalizeSocial(kind: SocialKind, value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (kind === "email") return v.replace(/^mailto:/i, "");

  const handle = v.replace(/^@/, "");
  if (kind === "github" && /^[a-z0-9](?:[a-z0-9-]{0,38})$/i.test(handle)) {
    return `https://github.com/${handle}`;
  }
  if (kind === "linkedin" && /^[a-z0-9][a-z0-9_-]{1,99}$/i.test(handle)) {
    return `https://www.linkedin.com/in/${handle}`;
  }
  if (HAS_SCHEME.test(v) || v.startsWith("/")) return v;
  return `https://${v.replace(/^\/\//, "")}`;
}

/** Loose check: something@something.tld, no spaces. Only used for a hint. */
export const looksLikeEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Loose check for a link we'd accept (http/https or a bare domain). */
export const looksLikeLink = (value: string): boolean => {
  const v = value.trim();
  if (!v) return true;
  if (HAS_SCHEME.test(v)) return /^https?:\/\/[^\s]+\.[^\s]+/i.test(v);
  return /^[^\s/]+\.[^\s]+/.test(v);
};
