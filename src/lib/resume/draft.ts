import { z } from "zod";
import {
  RESUME_SCHEMA_VERSION,
  profileSchema,
  resumeSchema,
  type Resume,
  type ResumeParseResult,
} from "./schema";

// ============================================================================
// Drafts: resumes that are still being written.
//
// A saved or published resume must have a name. A draft in the editor may not
// have one yet: "Start blank" gives an empty name, and so does clearing the
// field while retyping it. If drafts had to pass the strict schema, reloading
// the page at that moment would throw the whole draft away.
//
// So drafts are checked with a copy of the schema that allows an empty name.
// Everything else (types, lists, icons, version) is checked as strictly.
// ============================================================================

export const resumeDraftSchema = resumeSchema.extend({
  profile: profileSchema.extend({ name: z.string() }),
});

/** Validate a draft (e.g. from localStorage). Same result shape as `parseResume`. */
export function parseResumeDraft(input: unknown): ResumeParseResult {
  const result = resumeDraftSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    })),
  };
}

/** An empty resume for "Start blank". Valid as a draft, not as a saved resume. */
export function blankResume(): Resume {
  return {
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: { name: "", socials: {} },
    experience: [],
    projects: [],
    skills: [],
    tools: [],
    education: [],
    certifications: [],
  };
}
