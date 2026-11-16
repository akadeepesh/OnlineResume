import { parseResumeDraft } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";
import { slugify } from "@/lib/resumes/slug";
import { fromJsonResume, isJsonResume, toJsonResume } from "./jsonresume";

// ============================================================================
// Resume files: our own JSON and JSON Resume, in and out. Pure functions, so
// the browser (guest editor) and the server can share them.
// ============================================================================

/** Larger files aren't resumes; refuse before parsing. */
export const MAX_IMPORT_BYTES = 1024 * 1024;

export type ImportFormat = "onlineresume" | "jsonresume";

export type ReadResult =
  | { ok: true; resume: Resume; format: ImportFormat }
  | { ok: false; error: string };

/** Read a .json file's text as a resume, whichever of the two formats it's in. */
export function readResumeJson(text: string): ReadResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: "That file is too large to be a resume (1 MB max)." };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  const external = isJsonResume(value);
  const parsed = parseResumeDraft(external ? fromJsonResume(value) : value);
  if (!parsed.success) {
    return {
      ok: false,
      error: external
        ? "That JSON Resume file has data we couldn't read."
        : "That file isn't a resume we recognise. Use an OnlineResume or JSON Resume file.",
    };
  }
  return { ok: true, resume: parsed.data, format: external ? "jsonresume" : "onlineresume" };
}

/** Our own format: the resume as stored, pretty-printed. Re-imports losslessly. */
export const toResumeJson = (resume: Resume): string => JSON.stringify(resume, null, 2);

export const toJsonResumeText = (resume: Resume): string => JSON.stringify(toJsonResume(resume), null, 2);

/** "Alex Morgan" → "alex-morgan-resume.json" (or "...-jsonresume.json"). */
export function exportFileName(resume: Resume, kind: "resume" | "jsonresume"): string {
  const base = resume.profile.name.trim() ? slugify(resume.profile.name) : "resume";
  return `${base}-${kind}.json`;
}
