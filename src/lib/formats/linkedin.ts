import { blankResume, parseResumeDraft } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";
import { openZip, type ZipArchive } from "@/lib/zip/zip";
import { csvKey, csvRecords } from "./csv";

// ============================================================================
// LinkedIn data export ("Settings → Data privacy → Get a copy of your data").
// It's a ZIP of CSV files; we read the ones a resume needs. Everything runs
// in the browser: the archive itself is never uploaded.
//
// Column names change over time, so they're matched loosely (`csvKey`), and
// every file is optional.
// ============================================================================

type Row = Record<string, string>;

/** First non-empty value among the given column names. */
const pick = (row: Row, ...columns: string[]) => {
  for (const column of columns) {
    const value = row[csvKey(column)];
    if (value) return value;
  }
  return undefined;
};

/** "Mar 2021" + "" → "Mar 2021 – Present"; "2019" + "2021" → "2019 – 2021". */
function dateRange(start?: string, end?: string, ongoing = true): string | undefined {
  if (!start && !end) return undefined;
  if (!start) return end;
  if (!end) return ongoing ? `${start} – Present` : start;
  return start === end ? start : `${start} – ${end}`;
}

/** A free-text description → bullets: one per line, list markers removed. */
const bullets = (text?: string) =>
  (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-•*·]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 30);

/** Find a CSV in the archive by file name, in any folder, ignoring case. */
async function readCsv(zip: ZipArchive, fileName: string): Promise<Row[]> {
  const wanted = fileName.toLowerCase();
  const name = zip.names.find((n) => n.split("/").pop()?.toLowerCase() === wanted);
  if (!name) return [];
  const text = await zip.text(name);
  return text ? csvRecords(text) : [];
}

/** True when the archive looks like a LinkedIn export. */
export const isLinkedInExport = (zip: ZipArchive) =>
  zip.names.some((name) => /(^|\/)(profile|positions)\.csv$/i.test(name));

export function resumeFromLinkedIn(files: {
  profile: Row[];
  positions: Row[];
  education: Row[];
  skills: Row[];
  projects: Row[];
  certifications: Row[];
  emails: Row[];
}): Resume {
  const resume = blankResume();
  const profile = files.profile[0] ?? {};
  const name = [pick(profile, "First Name"), pick(profile, "Last Name")].filter(Boolean).join(" ");
  const primaryEmail =
    files.emails.find((row) => /yes|true/i.test(pick(row, "Primary") ?? "")) ?? files.emails[0] ?? {};

  resume.profile = {
    ...resume.profile,
    name,
    role: pick(profile, "Headline"),
    location: pick(profile, "Geo Location", "Location"),
    socials: Object.fromEntries(
      Object.entries({ email: pick(primaryEmail, "Email Address") }).filter(([, v]) => v),
    ),
  };
  resume.about = pick(profile, "Summary");

  resume.experience = files.positions.map((row) => ({
    title: pick(row, "Title") ?? "",
    company: pick(row, "Company Name", "Company"),
    location: pick(row, "Location"),
    date: dateRange(pick(row, "Started On", "Start Date"), pick(row, "Finished On", "End Date")),
    responsibilities: bullets(pick(row, "Description")),
    skills: [],
  }));

  resume.education = files.education.map((row) => ({
    institution: pick(row, "School Name", "School") ?? "",
    degree: [pick(row, "Degree Name", "Degree"), pick(row, "Field Of Study")].filter(Boolean).join(", ") || undefined,
    period: dateRange(pick(row, "Start Date", "Started On"), pick(row, "End Date", "Finished On"), false),
  }));

  resume.skills = files.skills
    .map((row) => pick(row, "Name", "Skill"))
    .filter((skill): skill is string => Boolean(skill))
    .slice(0, 40)
    .map((skill) => ({ name: skill, icon: "code" as const }));

  resume.projects = files.projects.map((row) => {
    const url = pick(row, "Url", "URL");
    return {
      name: pick(row, "Title", "Name") ?? "",
      description: pick(row, "Description"),
      demo: url && /^https?:\/\//i.test(url) ? url : undefined,
      details: [],
      technologies: [],
    };
  });

  resume.certifications = files.certifications.map((row) => {
    const url = pick(row, "Url", "URL");
    return {
      name: pick(row, "Name") ?? "",
      issuer: pick(row, "Authority", "Issuer"),
      date: pick(row, "Started On", "Issued On"),
      link: url && /^https?:\/\//i.test(url) ? url : undefined,
      icon: "file" as const,
    };
  });

  return resume;
}

export type LinkedInResult = { ok: true; resume: Resume } | { ok: false; error: string };

/** Read a LinkedIn export ZIP into a resume. */
export async function readLinkedInExport(bytes: Uint8Array): Promise<LinkedInResult> {
  let zip: ZipArchive;
  try {
    zip = await openZip(bytes);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "That file couldn't be opened." };
  }
  if (!isLinkedInExport(zip)) {
    return { ok: false, error: "That ZIP isn't a LinkedIn data export (no Profile.csv or Positions.csv)." };
  }
  try {
    const [profile, positions, education, skills, projects, certifications, emails] = await Promise.all([
      readCsv(zip, "Profile.csv"),
      readCsv(zip, "Positions.csv"),
      readCsv(zip, "Education.csv"),
      readCsv(zip, "Skills.csv"),
      readCsv(zip, "Projects.csv"),
      readCsv(zip, "Certifications.csv"),
      readCsv(zip, "Email Addresses.csv"),
    ]);
    const parsed = parseResumeDraft(
      resumeFromLinkedIn({ profile, positions, education, skills, projects, certifications, emails }),
    );
    if (!parsed.success) return { ok: false, error: "Some data in that export couldn't be read." };
    return { ok: true, resume: parsed.data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "That export couldn't be read." };
  }
}
