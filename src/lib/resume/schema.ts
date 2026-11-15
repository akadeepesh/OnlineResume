import { z } from "zod";
import { migrateResume } from "./migrate";

// ============================================================================
// Resume schema: the single source of truth for resume data.
//
// Every template, importer, exporter and (later) database row is validated
// against this schema. TypeScript types are inferred from it, so the runtime
// check and the compile-time types can never drift apart.
//
// Bump RESUME_SCHEMA_VERSION whenever the shape changes in a way that needs a
// migration for previously saved/imported data, and add the step to
// `migrate.ts`. Parsing always migrates first, so old files keep loading.
// ============================================================================

export const RESUME_SCHEMA_VERSION = 2;

export const iconKeySchema = z.enum([
  "code",
  "cpu",
  "brain",
  "trophy",
  "database",
  "globe",
  "folder",
  "file",
]);

/** Plain text where **double asterisks** mark emphasis. */
export const richTextSchema = z.string();

// Sparse-data rules (imported and half-written resumes are the norm, not the
// exception):
// - Only the one field that identifies an item is required: the person's name,
//   a job title, a project name, a school, ...
// - Every other string is optional. Templates treat a missing value and a
//   blank string the same way (see `src/lib/resume/view.ts`).
// - Every list defaults to [], so a whole section can simply be left out.
const optionalText = z.string().optional();
const list = <T extends z.ZodType>(item: T) => z.array(item).default([]);

export const socialsSchema = z.object({
  github: optionalText,
  linkedin: optionalText,
  email: optionalText,
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: optionalText,
  tagline: optionalText,
  location: optionalText,
  /** Image URL or data URL. Templates show initials when it is missing. */
  avatar: optionalText,
  /** Link to a downloadable resume file. The download button hides without it. */
  resumeUrl: optionalText,
  /** Short status line, e.g. "Open to full-time roles" */
  availability: optionalText,
  socials: socialsSchema.default({}),
});

export const experienceEntrySchema = z.object({
  title: z.string(),
  company: optionalText,
  date: optionalText,
  location: optionalText,
  responsibilities: list(z.string()),
  skills: list(z.string()),
});

export const projectSchema = z.object({
  name: z.string(),
  description: optionalText,
  github: optionalText,
  demo: optionalText,
  details: list(z.string()),
  technologies: list(z.string()),
});

export const siteSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: optionalText,
  tags: list(z.string()),
});

export const skillSchema = z.object({
  name: z.string(),
  icon: iconKeySchema.default("code"),
  /** GitHub repository names (under NEXT_PUBLIC_GH_OWNER) that use this skill */
  repos: list(z.string()),
  /** Live sites built with this skill, shown instead of / alongside repos */
  sites: z.array(siteSchema).optional(),
});

export const toolCategorySchema = z.object({
  name: z.string(),
  skills: list(z.string()),
});

export const educationEntrySchema = z.object({
  institution: z.string(),
  degree: optionalText,
  period: optionalText,
  location: optionalText,
});

export const certificationSchema = z.object({
  name: z.string(),
  issuer: optionalText,
  date: optionalText,
  link: optionalText,
  icon: iconKeySchema.default("file"),
  description: optionalText,
});

// ----------------------------------------------------------------------------
// Section layout (added in v2). The profile is always the header, so it can't
// be moved or hidden; every other section can.
// ----------------------------------------------------------------------------

/** The sections a person can reorder or hide, in the default (editor) order. */
export const DEFAULT_SECTION_ORDER = [
  "about",
  "experience",
  "education",
  "projects",
  "skills",
  "tools",
  "certifications",
] as const;

export const sectionKeySchema = z.enum(DEFAULT_SECTION_ORDER);
export type SectionKey = z.infer<typeof sectionKeySchema>;

const unique = <T>(list: readonly T[]): T[] => [...new Set(list)];

/**
 * A full order, always: repeats are dropped and missing sections are added at
 * the end in their default order. A hand-edited file or a resume saved by a
 * version with fewer sections is repaired instead of rejected.
 */
export const completeSectionOrder = (order: readonly SectionKey[]): SectionKey[] => {
  const seen = unique(order);
  return [...seen, ...DEFAULT_SECTION_ORDER.filter((key) => !seen.includes(key))];
};

export const resumeSchema = z.object({
  schemaVersion: z.literal(RESUME_SCHEMA_VERSION),
  /** The order sections appear in. Templates arrange their blocks by it. */
  sectionOrder: z
    .array(sectionKeySchema)
    .default([...DEFAULT_SECTION_ORDER])
    .transform(completeSectionOrder),
  /** Sections kept in the draft but left off the resume. */
  hiddenSections: z.array(sectionKeySchema).default([]).transform(unique),
  profile: profileSchema,
  about: optionalText,
  experience: list(experienceEntrySchema),
  projects: list(projectSchema),
  skills: list(skillSchema),
  tools: list(toolCategorySchema),
  education: list(educationEntrySchema),
  certifications: list(certificationSchema),
});

export type IconKey = z.infer<typeof iconKeySchema>;
export type RichText = z.infer<typeof richTextSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Socials = z.infer<typeof socialsSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type ToolCategory = z.infer<typeof toolCategorySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Resume = z.infer<typeof resumeSchema>;
/** What `parseResume` accepts: defaulted fields may be left out. */
export type ResumeInput = z.input<typeof resumeSchema>;

export type ResumeParseResult =
  | { success: true; data: Resume }
  | { success: false; issues: { path: string; message: string }[] };

/**
 * Validate unknown input (an uploaded file, a DB row, localStorage, ...) and
 * return either typed data or a flat list of human-readable issues.
 */
export function parseResume(input: unknown): ResumeParseResult {
  const result = resumeSchema.safeParse(migrateResume(input));
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    })),
  };
}
