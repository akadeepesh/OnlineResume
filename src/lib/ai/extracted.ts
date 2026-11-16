import { blankResume, parseResumeDraft } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";

// ============================================================================
// Turning a model's JSON answer into a resume.
//
// Model output is untrusted input: it can drop fields, invent new ones, use
// numbers where we want text, or nest things oddly. Everything is read
// defensively, unknown keys are ignored, and the result goes through the
// normal draft schema like any other import.
// ============================================================================

/** Pasted text shorter than this isn't worth an AI call; longer isn't a resume. */
export const AI_TEXT_MIN = 80;
export const AI_TEXT_MAX = 20_000;

/** The shape we ask the model for. Kept small and flat on purpose. */
export const EXTRACTION_SHAPE = `{
  "name": string, "role": string, "tagline": string, "location": string,
  "email": string, "linkedin": string, "github": string,
  "summary": string,
  "experience": [{ "title": string, "company": string, "date": string, "location": string, "bullets": [string] }],
  "education": [{ "institution": string, "degree": string, "period": string, "location": string }],
  "projects": [{ "name": string, "description": string, "bullets": [string], "technologies": [string], "url": string }],
  "skills": [string],
  "toolGroups": [{ "name": string, "items": [string] }],
  "certifications": [{ "name": string, "issuer": string, "date": string, "url": string }]
}`;

type Obj = Record<string, unknown>;

const isObj = (value: unknown): value is Obj => typeof value === "object" && value !== null && !Array.isArray(value);

/** Text, or undefined. Numbers become text ("2021"); anything else is dropped. */
const str = (value: unknown, max = 2000): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
};

const strs = (value: unknown, max = 50): string[] =>
  Array.isArray(value) ? value.map((v) => str(v, 500)).filter((v): v is string => v !== undefined).slice(0, max) : [];

const objs = (value: unknown, max = 30): Obj[] => (Array.isArray(value) ? value.filter(isObj).slice(0, max) : []);

/** "https://…" stays; "linkedin.com/in/x" gets https://; anything else is dropped. */
const url = (value: unknown): string | undefined => {
  const text = str(value, 500);
  if (!text) return undefined;
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(text)) return `https://${text}`;
  return undefined;
};

const email = (value: unknown): string | undefined => {
  const text = str(value, 320);
  return text && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : undefined;
};

/** Build a resume from the model's answer. Returns null if nothing usable came back. */
export function resumeFromExtraction(raw: unknown): Resume | null {
  if (!isObj(raw)) return null;
  const resume = blankResume();

  resume.profile = {
    ...resume.profile,
    name: str(raw.name, 120) ?? "",
    role: str(raw.role, 160),
    tagline: str(raw.tagline, 300),
    location: str(raw.location, 160),
    socials: Object.fromEntries(
      Object.entries({ email: email(raw.email), linkedin: url(raw.linkedin), github: url(raw.github) }).filter(
        ([, v]) => v !== undefined,
      ),
    ),
  };
  resume.about = str(raw.summary, 4000);

  resume.experience = objs(raw.experience).map((job) => ({
    title: str(job.title, 200) ?? "",
    company: str(job.company, 200),
    date: str(job.date, 100),
    location: str(job.location, 160),
    responsibilities: strs(job.bullets),
    skills: [],
  }));
  resume.education = objs(raw.education).map((school) => ({
    institution: str(school.institution, 200) ?? "",
    degree: str(school.degree, 200),
    period: str(school.period, 100),
    location: str(school.location, 160),
  }));
  resume.projects = objs(raw.projects).map((project) => {
    const link = url(project.url);
    const isRepo = link !== undefined && /github\.com|gitlab\.com|bitbucket\.org/i.test(link);
    return {
      name: str(project.name, 200) ?? "",
      description: str(project.description, 1000),
      details: strs(project.bullets),
      technologies: strs(project.technologies, 30),
      github: isRepo ? link : undefined,
      demo: isRepo ? undefined : link,
    };
  });
  resume.skills = strs(raw.skills, 40).map((name) => ({ name, icon: "code" as const }));
  resume.tools = objs(raw.toolGroups, 15)
    .map((group) => ({ name: str(group.name, 100) ?? "", skills: strs(group.items, 40) }))
    .filter((group) => group.name || group.skills.length > 0);
  resume.certifications = objs(raw.certifications).map((cert) => ({
    name: str(cert.name, 200) ?? "",
    issuer: str(cert.issuer, 200),
    date: str(cert.date, 100),
    link: url(cert.url),
    icon: "file" as const,
  }));

  const parsed = parseResumeDraft(resume);
  if (!parsed.success) return null;
  const r = parsed.data;
  const empty =
    !r.profile.name && !r.about && r.experience.length + r.education.length + r.projects.length + r.skills.length === 0;
  return empty ? null : r;
}
