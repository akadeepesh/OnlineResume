// ============================================================================
// Resume slugs: the second part of a public link, /<username>/<slug>.
// Unique per user. Made from the title when the resume is created and kept
// afterwards, so renaming a resume never breaks a link someone shared.
// ============================================================================

export const SLUG_MAX = 60;
export const RESUME_TITLE_MAX = 80;
const FALLBACK = "resume";

/** "Senior Engineer — 2026" → "senior-engineer-2026". Never empty. */
export function slugify(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
  return slug || FALLBACK;
}

/** `base`, or `base-2`, `base-3`, … whichever isn't taken yet. */
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, SLUG_MAX - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
