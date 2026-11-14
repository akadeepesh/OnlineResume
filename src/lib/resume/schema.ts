import { z } from "zod";

// ============================================================================
// Resume schema: the single source of truth for resume data.
//
// Every template, importer, exporter and (later) database row is validated
// against this schema. TypeScript types are inferred from it, so the runtime
// check and the compile-time types can never drift apart.
//
// Bump RESUME_SCHEMA_VERSION whenever the shape changes in a way that needs a
// migration for previously saved/imported data.
// ============================================================================

export const RESUME_SCHEMA_VERSION = 1;

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

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string(),
  tagline: z.string(),
  location: z.string(),
  avatar: z.string(),
  resumeUrl: z.string(),
  /** Short status line, e.g. "Open to full-time roles" */
  availability: z.string().optional(),
  socials: z.object({
    github: z.string(),
    linkedin: z.string(),
    email: z.string(),
  }),
});

export const experienceEntrySchema = z.object({
  title: z.string(),
  company: z.string(),
  date: z.string(),
  location: z.string(),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  github: z.string(),
  demo: z.string().optional(),
  details: z.array(z.string()),
  technologies: z.array(z.string()),
});

export const siteSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

export const skillSchema = z.object({
  name: z.string(),
  icon: iconKeySchema,
  /** GitHub repository names (under NEXT_PUBLIC_GH_OWNER) that use this skill */
  repos: z.array(z.string()),
  /** Live sites built with this skill, shown instead of / alongside repos */
  sites: z.array(siteSchema).optional(),
});

export const toolCategorySchema = z.object({
  name: z.string(),
  skills: z.array(z.string()),
});

export const educationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  period: z.string(),
  location: z.string(),
});

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  link: z.string(),
  icon: iconKeySchema,
  description: z.string(),
});

export const resumeSchema = z.object({
  schemaVersion: z.literal(RESUME_SCHEMA_VERSION),
  profile: profileSchema,
  about: richTextSchema,
  experience: z.array(experienceEntrySchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
  tools: z.array(toolCategorySchema),
  education: z.array(educationEntrySchema),
  certifications: z.array(certificationSchema),
});

export type IconKey = z.infer<typeof iconKeySchema>;
export type RichText = z.infer<typeof richTextSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type ToolCategory = z.infer<typeof toolCategorySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Resume = z.infer<typeof resumeSchema>;

export type ResumeParseResult =
  | { success: true; data: Resume }
  | { success: false; issues: { path: string; message: string }[] };

/**
 * Validate unknown input (an uploaded file, a DB row, localStorage, ...) and
 * return either typed data or a flat list of human-readable issues.
 */
export function parseResume(input: unknown): ResumeParseResult {
  const result = resumeSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    })),
  };
}
