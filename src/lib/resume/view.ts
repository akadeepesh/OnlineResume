import type { Resume } from "./schema";

type Socials = Partial<Resume["profile"]["socials"]>;

// ============================================================================
// View helpers shared by every template.
//
// Resumes are often sparse (a fresh draft, an import that missed fields), so
// templates must never print "undefined", a dangling "·", an empty link or an
// empty section. These helpers give all five templates one definition of
// "is this present?" so they stay consistent.
// ============================================================================

/** True when a value is a non-blank string. Missing and "   " are both absent. */
export const has = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

/** Join only the present parts, e.g. `joinParts(["Acme", undefined, "Remote"])` → "Acme · Remote". */
export const joinParts = (parts: (string | null | undefined)[], separator = " · "): string =>
  parts.filter(has).map((p) => p.trim()).join(separator);

/** Up to two initials for an avatar fallback: "Alex Morgan" → "AM". */
export const initials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters
    .map((w) => Array.from(w)[0] ?? "")
    .join("")
    .toUpperCase();
};

/** First word of the name, for greetings like "Hi, I'm Alex." */
export const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

/** A link with the protocol and trailing slash removed, for display. */
export const displayUrl = (url: string): string =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * A link that is safe to put in an `href`, or undefined.
 *
 * Resume links are typed by users and shown on public pages, so only
 * http(s), mailto and same-site paths are allowed: `javascript:` and other
 * schemes are dropped. A bare domain ("github.com/alex") gets `https://`,
 * otherwise the browser would treat it as a relative path on our site.
 */
export function safeHref(value: string | null | undefined): string | undefined {
  if (!has(value)) return undefined;
  const link = value.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(link)?.[1]?.toLowerCase();
  if (scheme) return ["http", "https", "mailto"].includes(scheme) ? link : undefined;
  if (link.startsWith("//")) return `https:${link}`;
  if (link.startsWith("/")) return link;
  return `https://${link}`;
}

export type SocialKind = keyof Socials;

export type SocialLink = {
  kind: SocialKind;
  label: string;
  href: string;
  /** Human-friendly text: the address for email, the URL without protocol otherwise. */
  display: string;
};

const SOCIAL_LABELS: Record<SocialKind, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  email: "Email",
};

const DEFAULT_SOCIAL_ORDER: SocialKind[] = ["github", "linkedin", "email"];

/** The profile's social links that are actually filled in, in the given order. */
export function socialLinks(
  socials: Socials | undefined,
  order: SocialKind[] = DEFAULT_SOCIAL_ORDER
): SocialLink[] {
  if (!socials) return [];
  const links: SocialLink[] = [];
  for (const kind of order) {
    const value = socials[kind];
    if (!has(value)) continue;
    const trimmed = value.trim().replace(/^mailto:/i, "");
    const href = kind === "email" ? `mailto:${trimmed}` : safeHref(trimmed);
    if (!href) continue;
    links.push({
      kind,
      label: SOCIAL_LABELS[kind],
      href,
      display: kind === "email" ? trimmed : displayUrl(trimmed),
    });
  }
  return links;
}

/** The email address if one is set. */
export const emailOf = (resume: Resume): string | undefined =>
  has(resume.profile.socials.email) ? resume.profile.socials.email.trim() : undefined;

/** Which sections have anything to show. Templates skip the rest entirely. */
export function presentSections(resume: Resume) {
  return {
    about: has(resume.about),
    experience: resume.experience.length > 0,
    projects: resume.projects.length > 0,
    skills: resume.skills.length > 0,
    tools: resume.tools.length > 0,
    education: resume.education.length > 0,
    certifications: resume.certifications.length > 0,
  };
}

export type PresentSections = ReturnType<typeof presentSections>;

// ----------------------------------------------------------------------------
// What a visitor should see of a draft.
//
// The editor adds empty items the moment someone clicks "Add", and leaves
// blank bullets and tags while they type. None of that should reach a
// template: an item with nothing in it would render an empty card or a
// section heading with nothing under it. Items with *some* content stay, even
// without their title yet, so half-written work doesn't vanish from the
// preview.
// ----------------------------------------------------------------------------

const presentStrings = (list: string[]) => list.filter(has);

/**
 * True when any string field of the item has text, or any list has a
 * non-blank entry. `icon` is ignored: it always has a default value.
 */
export const itemHasContent = (item: object): boolean =>
  Object.entries(item).some(([key, value]) =>
    key === "icon"
      ? false
      : typeof value === "string"
        ? has(value)
        : Array.isArray(value)
          ? value.some((v) => (typeof v === "string" ? has(v) : v != null))
          : false
  );
const hasContent = itemHasContent;

export function visibleResume(resume: Resume): Resume {
  return {
    ...resume,
    experience: resume.experience
      .map((e) => ({ ...e, responsibilities: presentStrings(e.responsibilities), skills: presentStrings(e.skills) }))
      .filter(hasContent),
    projects: resume.projects
      .map((p) => ({ ...p, details: presentStrings(p.details), technologies: presentStrings(p.technologies) }))
      .filter(hasContent),
    skills: resume.skills
      .map((s) => ({ ...s, repos: presentStrings(s.repos) }))
      .filter(hasContent),
    tools: resume.tools.map((t) => ({ ...t, skills: presentStrings(t.skills) })).filter(hasContent),
    education: resume.education.filter(hasContent),
    certifications: resume.certifications.filter(hasContent),
  };
}
