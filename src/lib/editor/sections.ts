import { has } from "@/lib/resume/view";
import { DEFAULT_SECTION_ORDER, type Resume } from "@/lib/resume/schema";

// ============================================================================
// Editor sections: the order, copy and "is this filled in?" rule for each step
// of the editor. Kept free of React so it can be unit-tested and reused by the
// sidebar, the mobile picker and the Back/Next buttons.
// ============================================================================

/** Every editor step in the default order: the profile, then the resume's sections. */
export const sectionIds = ["profile", ...DEFAULT_SECTION_ORDER] as const;

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

export const sectionMeta = (id: SectionId): SectionMeta => sections.find((s) => s.id === id) ?? sections[0];

/**
 * The editor's steps for this resume: the profile, then the sections in the
 * order the person arranged them, so editing follows the resume top to bottom.
 */
export const editorOrder = (resume: Pick<Resume, "sectionOrder">): SectionId[] => [
  "profile",
  ...resume.sectionOrder,
];

/** True when the section is left off the resume. The profile can't be hidden. */
export const isSectionHidden = (resume: Resume, id: SectionId): boolean =>
  id !== "profile" && resume.hiddenSections.includes(id);

/** The sections before and after `id` in `order`, for Back/Next buttons. */
export function neighbours(
  id: SectionId,
  order: readonly SectionId[] = sectionIds,
): { prev?: SectionMeta; next?: SectionMeta } {
  const index = order.indexOf(id);
  const at = (i: number) => (i >= 0 && i < order.length ? sectionMeta(order[i]) : undefined);
  return { prev: at(index - 1), next: at(index + 1) };
}
