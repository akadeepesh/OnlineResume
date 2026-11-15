import { has } from "@/lib/resume/view";
import type { Resume } from "@/lib/resume/schema";

// ============================================================================
// Editor sections: the order, copy and "is this filled in?" rule for each step
// of the editor. Kept free of React so it can be unit-tested and reused by the
// sidebar, the mobile picker and the Back/Next buttons.
// ============================================================================

export const sectionIds = [
  "profile",
  "about",
  "experience",
  "education",
  "projects",
  "skills",
  "tools",
  "certifications",
] as const;

export type SectionId = (typeof sectionIds)[number];

export interface SectionMeta {
  id: SectionId;
  label: string;
  /** One line under the heading: what this section is for. */
  description: string;
  /** A friendly nudge, so nobody stares at a blank form. */
  tip: string;
}

export const sections: readonly SectionMeta[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your name, role and how people can reach you.",
    tip: "Use the job title you want next, not just the one you have now.",
  },
  {
    id: "about",
    label: "About",
    description: "A short summary of who you are and what you do best.",
    tip: "Two or three sentences is plenty. Lead with what makes you useful.",
  },
  {
    id: "experience",
    label: "Experience",
    description: "Jobs, internships and freelance work, newest first.",
    tip: "Start each bullet with a verb and add a number where you can.",
  },
  {
    id: "education",
    label: "Education",
    description: "Schools, degrees and courses.",
    tip: "Leave out grades unless they help your case.",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Things you've built, with links if they're public.",
    tip: "Say what problem it solved, not only what it uses.",
  },
  {
    id: "skills",
    label: "Skills",
    description: "Your main strengths, each linked to work that shows it.",
    tip: "Five strong skills beat twenty you've only touched.",
  },
  {
    id: "tools",
    label: "Tools",
    description: "Languages, frameworks and software, grouped by kind.",
    tip: "Group them (Frontend, Backend, Design) so they're quick to scan.",
  },
  {
    id: "certifications",
    label: "Certifications",
    description: "Certificates, awards and courses you've completed.",
    tip: "Add a link so people can verify it.",
  },
];

export const isSectionId = (value: string): value is SectionId =>
  (sectionIds as readonly string[]).includes(value);

/** True when the section has real content (blank strings don't count). */
export function isSectionFilled(resume: Resume, id: SectionId): boolean {
  switch (id) {
    case "profile":
      return has(resume.profile.name) && has(resume.profile.role);
    case "about":
      return has(resume.about);
    case "experience":
      return resume.experience.some((e) => has(e.title));
    case "education":
      return resume.education.some((e) => has(e.institution));
    case "projects":
      return resume.projects.some((p) => has(p.name));
    case "skills":
      return resume.skills.some((s) => has(s.name));
    case "tools":
      return resume.tools.some((t) => has(t.name) && t.skills.some(has));
    case "certifications":
      return resume.certifications.some((c) => has(c.name));
  }
}

/** The sections before and after `id`, for Back/Next buttons. */
export function neighbours(id: SectionId): { prev?: SectionMeta; next?: SectionMeta } {
  const index = sectionIds.indexOf(id);
  return { prev: sections[index - 1], next: sections[index + 1] };
}
