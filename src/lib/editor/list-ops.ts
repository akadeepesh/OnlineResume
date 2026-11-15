// ============================================================================
// Pure helpers for editing lists in the editor.
//
// Resume items have no ids (they'd leak into exports and the database), but
// drag-and-drop and React keys need something stable. Each list keeps a
// parallel array of ids in the component and changes it with the same
// operations it sends to the store, so the two always line up.
// ============================================================================

/** Move one element, clamping the target like the store's `moveItem`. */
export function moveIndex<T>(list: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= list.length || !Number.isInteger(to)) return [...list];
  const target = Math.min(Math.max(to, 0), list.length - 1);
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

export const insertAt = <T>(list: readonly T[], index: number, ...items: T[]): T[] => [
  ...list.slice(0, index),
  ...items,
  ...list.slice(index),
];

export const removeAt = <T>(list: readonly T[], index: number): T[] =>
  list.filter((_, i) => i !== index);

/**
 * Line ids up with a list whose length changed without going through our
 * operations (e.g. "Start over"): keep what fits, add fresh ids for the rest.
 */
export function reconcileIds(ids: readonly string[], length: number, makeId: () => string): string[] {
  if (ids.length === length) return ids as string[];
  if (ids.length > length) return ids.slice(0, length);
  return [...ids, ...Array.from({ length: length - ids.length }, makeId)];
}

/**
 * Turn pasted text into bullets: one per line, without the bullet markers
 * people paste from Word, PDFs or old resumes ("•", "-", "*", "1.").
 */
export function splitPastedBullets(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[•●▪◦‣∙·*–—-]|\d{1,2}[.)])\s+/, "").trim())
    .filter(Boolean);
}

/** Turn "React, Node.js; SQL" into tags, skipping blanks and case-insensitive duplicates. */
export function parseTags(input: string, existing: readonly string[] = []): string[] {
  const seen = new Set(existing.map((t) => t.trim().toLowerCase()));
  const tags: string[] = [];
  for (const raw of input.split(/[,;\n]/)) {
    const tag = raw.trim();
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

/** Split a bullet at the selection, Enter-style. The new bullet doesn't start with spaces. */
export function splitBullet(text: string, start: number, end: number): [string, string] {
  return [text.slice(0, start).replace(/\s+$/, ""), text.slice(end).replace(/^\s+/, "")];
}

/**
 * Merge a bullet into the one above, Backspace-style. Adds a space at the
 * join when neither side has one, so "shipped it" + "on time" doesn't become
 * "shipped iton time". Returns where the caret should go.
 */
export function mergeBullets(above: string, below: string): { text: string; caret: number } {
  const needsSpace = above.length > 0 && below.length > 0 && !/\s$/.test(above) && !/^\s/.test(below);
  const joined = needsSpace ? `${above} ` : above;
  return { text: joined + below, caret: joined.length };
}
