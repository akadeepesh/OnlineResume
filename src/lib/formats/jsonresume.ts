import { blankResume } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";
import { formatDateRange, fromIsoPartial, parseDateRange } from "./dates";

// ============================================================================
// JSON Resume (https://jsonresume.org/schema), the open format many resume
// tools read and write.
//
// The two models differ, so a round trip isn't lossless:
// - Our skills are single skills; JSON Resume skills are groups with
//   keywords. Groups with keywords become our tools, bare names our skills.
// - Our dates are free text; theirs are ISO ("2021-03"). Dates we can't read
//   are left out on export rather than guessed.
// - Photos stored as data URLs aren't exported (the format expects a URL).
// ============================================================================

/** The subset of the JSON Resume schema we read and write. */
export interface JsonResume {
  $schema?: string;
  basics?: {
    name?: string;
    label?: string;
    image?: string;
    email?: string;
    url?: string;
    summary?: string;
    location?: { address?: string; city?: string; region?: string; countryCode?: string };
    profiles?: { network?: string; username?: string; url?: string }[];
  };
  work?: {
    name?: string;
    position?: string;
    location?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }[];
  education?: {
    institution?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
  }[];
  projects?: {
    name?: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }[];
  skills?: { name?: string; level?: string; keywords?: string[] }[];
  certificates?: { name?: string; date?: string; issuer?: string; url?: string }[];
}

export const JSON_RESUME_SCHEMA_URL =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json";

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(text).filter((s): s is string => s !== undefined) : [];

const records = <T>(value: unknown): Partial<T>[] =>
  Array.isArray(value) ? value.filter((v): v is Partial<T> => typeof v === "object" && v !== null) : [];

/** Drop keys whose value is undefined, so exported JSON stays tidy. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

/** True when the object looks like JSON Resume rather than our own format. */
export function isJsonResume(value: unknown): value is JsonResume {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return !("schemaVersion" in v) && ("basics" in v || "work" in v);
}

export function fromJsonResume(input: JsonResume): Resume {
  const resume = blankResume();
  const basics = input.basics ?? {};
  const location = basics.location ?? {};
  const profiles = records<NonNullable<NonNullable<JsonResume["basics"]>["profiles"]>[number]>(basics.profiles);
  const profileUrl = (network: string) =>
    text(profiles.find((p) => text(p.network)?.toLowerCase() === network)?.url);

  resume.profile = {
    ...resume.profile,
    name: text(basics.name) ?? "",
    role: text(basics.label),
    avatar: text(basics.image),
    location: text(location.address) ?? ([location.city, location.region, location.countryCode].map(text).filter(Boolean).join(", ") || undefined),
    socials: compact({
      email: text(basics.email),
      github: profileUrl("github"),
      linkedin: profileUrl("linkedin"),
    }),
  };
  resume.about = text(basics.summary);

  resume.experience = records<NonNullable<JsonResume["work"]>[number]>(input.work).map((job) => ({
    title: text(job.position) ?? text(job.name) ?? "",
    company: text(job.position) ? text(job.name) : undefined,
    date: formatDateRange(text(job.startDate), text(job.endDate)) || undefined,
    location: text(job.location),
    responsibilities: [...(text(job.summary) ? [text(job.summary)!] : []), ...strings(job.highlights)],
    skills: [],
  }));

  resume.education = records<NonNullable<JsonResume["education"]>[number]>(input.education).map((school) => ({
    institution: text(school.institution) ?? "",
    degree: [text(school.studyType), text(school.area)].filter(Boolean).join(", ") || undefined,
    period: formatDateRange(text(school.startDate), text(school.endDate)) || undefined,
    location: text(school.location),
  }));

  resume.projects = records<NonNullable<JsonResume["projects"]>[number]>(input.projects).map((project) => ({
    name: text(project.name) ?? "",
    description: text(project.description),
    demo: text(project.url),
    details: strings(project.highlights),
    technologies: strings(project.keywords),
  }));

  for (const skill of records<NonNullable<JsonResume["skills"]>[number]>(input.skills)) {
    const name = text(skill.name);
    const keywords = strings(skill.keywords);
    if (keywords.length > 0) resume.tools.push({ name: name ?? "Skills", skills: keywords });
    else if (name) resume.skills.push({ name, icon: "code", repos: [] });
  }

  resume.certifications = records<NonNullable<JsonResume["certificates"]>[number]>(input.certificates).map(
    (cert) => ({
      name: text(cert.name) ?? "",
      issuer: text(cert.issuer),
      date: text(cert.date) ? fromIsoPartial(text(cert.date)!) : undefined,
      link: text(cert.url),
      icon: "file" as const,
    }),
  );

  return resume;
}

/** Only real URLs: data URLs (our resized photos) don't belong in this format. */
const urlOnly = (value: string | undefined) => (value && /^https?:\/\//i.test(value) ? value : undefined);

const listOrUndefined = <T>(list: T[]) => (list.length > 0 ? list : undefined);

export function toJsonResume(resume: Resume): JsonResume {
  const { profile } = resume;
  const profiles = [
    profile.socials.github && { network: "GitHub", url: profile.socials.github },
    profile.socials.linkedin && { network: "LinkedIn", url: profile.socials.linkedin },
  ].filter((p): p is { network: string; url: string } => Boolean(p));

  return compact({
    $schema: JSON_RESUME_SCHEMA_URL,
    basics: compact({
      name: profile.name,
      label: text(profile.role),
      image: urlOnly(text(profile.avatar)),
      email: text(profile.socials.email),
      summary: text(resume.about),
      location: text(profile.location) ? { address: text(profile.location) } : undefined,
      profiles: listOrUndefined(profiles),
    }),
    work: listOrUndefined(
      resume.experience.map((job) =>
        compact({
          name: text(job.company),
          position: text(job.title),
          location: text(job.location),
          ...parseDateRange(job.date),
          highlights: listOrUndefined(strings(job.responsibilities)),
        }),
      ),
    ),
    education: listOrUndefined(
      resume.education.map((school) =>
        compact({
          institution: text(school.institution),
          studyType: text(school.degree),
          location: text(school.location),
          ...parseDateRange(school.period),
        }),
      ),
    ),
    projects: listOrUndefined(
      resume.projects.map((project) =>
        compact({
          name: text(project.name),
          description: text(project.description),
          url: text(project.demo) ?? text(project.github),
          highlights: listOrUndefined(strings(project.details)),
          keywords: listOrUndefined(strings(project.technologies)),
        }),
      ),
    ),
    skills: listOrUndefined([
      ...resume.skills.filter((s) => text(s.name)).map((s) => ({ name: s.name.trim() })),
      ...resume.tools.map((group) => compact({ name: text(group.name), keywords: listOrUndefined(strings(group.skills)) })),
    ]),
    certificates: listOrUndefined(
      resume.certifications.map((cert) =>
        compact({
          name: text(cert.name),
          issuer: text(cert.issuer),
          date: parseDateRange(cert.date).startDate,
          url: text(cert.link),
        }),
      ),
    ),
  });
}
