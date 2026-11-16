import type { Resume } from "@/lib/resume/schema";

// ============================================================================
// "Edited original": which texts changed since the import, and where each one
// sits in the original file.
//
// 1. `textChanges` compares the resume as imported with the resume now, field
//    by field (list items by position), and lists every text that changed.
// 2. `planPatches` finds each old text in the original's lines (Word
//    paragraphs or PDF lines): an exact line first, then a line containing
//    it. Several changes can land in one line (title and company often share
//    one). Whatever can't be placed is reported, never silently dropped.
// ============================================================================

export interface TextChange {
  /** Where in the resume, e.g. "experience[0].title". */
  path: string;
  /** Human label for the report, e.g. "Experience 1: title". */
  label: string;
  from: string;
  to: string;
}

const SECTION_LABELS: Record<string, string> = {
  experience: "Experience",
  education: "Education",
  projects: "Project",
  skills: "Skill",
  tools: "Tools",
  certifications: "Certification",
};

const norm = (text: string | undefined) => (text ?? "").replace(/\s+/g, " ").trim();

/** Every text field of a resume, by path. Lists of tags are compared as one text. */
function texts(resume: Resume): Map<string, { label: string; value: string }> {
  const out = new Map<string, { label: string; value: string }>();
  const put = (path: string, label: string, value: string | undefined) => out.set(path, { label, value: norm(value) });

  const { profile } = resume;
  put("profile.name", "Name", profile.name);
  put("profile.role", "Role", profile.role);
  put("profile.tagline", "Tagline", profile.tagline);
  put("profile.location", "Location", profile.location);
  put("profile.socials.email", "Email", profile.socials.email);
  put("profile.socials.linkedin", "LinkedIn", profile.socials.linkedin);
  put("profile.socials.github", "GitHub", profile.socials.github);
  put("about", "Summary", resume.about);

  const list = <T extends object>(section: string, items: T[], fields: (keyof T & string)[], bullets?: keyof T & string) =>
    items.forEach((item, i) => {
      const prefix = `${SECTION_LABELS[section]} ${i + 1}`;
      for (const field of fields) {
        const value = item[field];
        put(`${section}[${i}].${field}`, `${prefix}: ${field}`, Array.isArray(value) ? value.join(", ") : (value as string | undefined));
      }
      if (bullets) {
        const lines = (item[bullets] as unknown as string[]) ?? [];
        lines.forEach((line, j) => put(`${section}[${i}].${bullets}[${j}]`, `${prefix}: bullet ${j + 1}`, line));
      }
    });

  list("experience", resume.experience, ["title", "company", "date", "location"], "responsibilities");
  list("education", resume.education, ["institution", "degree", "period", "location"]);
  list("projects", resume.projects, ["name", "description"], "details");
  list("skills", resume.skills, ["name"]);
  list("tools", resume.tools, ["name", "skills"]);
  list("certifications", resume.certifications, ["name", "issuer", "date"]);
  return out;
}

/** Texts that differ between the imported resume and the current one. */
export function textChanges(imported: Resume, current: Resume): TextChange[] {
  const before = texts(imported);
  const after = texts(current);
  const changes: TextChange[] = [];
  for (const [path, { label, value }] of after) {
    const from = before.get(path)?.value ?? "";
    if (from !== value) changes.push({ path, label, from, to: value });
  }
  // Removed items: their texts are gone from `current` entirely.
  for (const [path, { label, value }] of before) {
    if (!after.has(path) && value) changes.push({ path, label, from: value, to: "" });
  }
  return changes;
}

export interface PatchPlan {
  /** New text for each line that changes, by line index. */
  lines: Map<number, string>;
  applied: TextChange[];
  /** Changes we couldn't place: new text with nothing to replace, or old text not found. */
  unapplied: TextChange[];
}

export function planPatches(originalLines: string[], changes: TextChange[]): PatchPlan {
  const current = originalLines.map(norm);
  const touched = new Map<number, string>();
  const applied: TextChange[] = [];
  const unapplied: TextChange[] = [];

  for (const change of changes) {
    if (!change.from) {
      unapplied.push(change); // added text: there's no place for it in the original
      continue;
    }
    let index = current.findIndex((line) => line === change.from);
    if (index < 0) index = current.findIndex((line) => line.includes(change.from));
    if (index < 0) {
      unapplied.push(change);
      continue;
    }
    const next = norm(current[index]!.replace(change.from, change.to));
    current[index] = next;
    touched.set(index, next);
    applied.push(change);
  }
  return { lines: touched, applied, unapplied };
}
