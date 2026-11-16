import { blankResume, parseResumeDraft } from "@/lib/resume/draft";
import type { Resume } from "@/lib/resume/schema";

// ============================================================================
// Rule-based resume parsing: plain text (from a Word file, a PDF or a paste)
// → a resume. No AI, no network. It won't be perfect, so the result always
// opens in the editor for the person to check; the goal is that most of the
// typing is already done.
//
// How it reads a resume:
// 1. Contacts (email, LinkedIn, GitHub) are found anywhere in the text.
// 2. The header (before the first section heading) gives the name, role and
//    location.
// 3. Known headings ("Experience", "Education", "Skills"…) split the rest
//    into sections, each read by its own small parser.
// ============================================================================

type SectionName = "about" | "experience" | "education" | "projects" | "skills" | "tools" | "certifications";

const HEADINGS: [SectionName, RegExp][] = [
  ["about", /^(summary|profile|about( me)?|professional summary|career summary|objective|career objective|overview)$/],
  ["experience", /^((work|professional|relevant|employment|career) )?(experience|history)$|^employment( history)?$|^work$/],
  ["education", /^(education|academic background|academics|education and training|qualifications)$/],
  ["projects", /^((personal|selected|key|side|academic) )?projects$/],
  ["skills", /^((technical|core|key|professional) )?(skills|competencies|expertise)( (and|&) (tools|technologies))?$/],
  ["tools", /^(tools|technologies|tech stack|tools (and|&) technologies|software)$/],
  ["certifications", /^(certifications?|certificates?|licen[cs]es?( (and|&) certifications)?|awards( (and|&) certifications)?|courses)$/],
];

const BULLET = /^\s*(?:[•●▪◦‣∙·*–—-]|\d{1,2}[.)])\s+/;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const LINKEDIN = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?/i;
const GITHUB = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9-]+\/?(?![\w/])/i;
const URL = /(?:https?:\/\/|www\.)[^\s|,;]+/i;
const PHONE = /\+?\d[\d\s().-]{7,}\d/;
const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const DATE_PART = `(?:${MONTH}\\s+)?(?:\\d{1,2}[/.])?(?:19|20)\\d{2}`;
const DATE_RANGE = new RegExp(
  `(${DATE_PART})(?:\\s*(?:–|—|-|to)\\s*(${DATE_PART}|present|current|now|today))?`,
  "i",
);

const withHttps = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, "")}`);
const clean = (text: string) => text.replace(/\s+/g, " ").trim();
const stripBullet = (line: string) => line.replace(BULLET, "").trim();

/** Which section a line starts, if it's a heading. */
function headingOf(line: string): SectionName | null {
  const text = line.replace(/[:\s]+$/, "").trim();
  if (text.length > 40 || BULLET.test(line)) return null;
  const key = text.toLowerCase().replace(/\s+/g, " ");
  for (const [name, pattern] of HEADINGS) if (pattern.test(key)) return name;
  return null;
}

/** "Mar 2021 – Present" (normalised dash), or undefined. */
function findDate(line: string): { date?: string; rest: string } {
  const match = DATE_RANGE.exec(line);
  if (!match) return { rest: line };
  const [whole, start, end] = match;
  const date = end ? `${clean(start!)} – ${/^(present|current|now|today)$/i.test(end) ? "Present" : clean(end)}` : clean(start!);
  const rest = clean(line.replace(whole, " ").replace(/[|,·•–—-]\s*$/, "").replace(/^\s*[|,·•–—-]/, ""));
  return { date, rest };
}

/** Split a header line like "Engineer at Acme" / "Acme | Engineer" / "Engineer, Acme". */
function splitRole(line: string): { title: string; company?: string } {
  const at = /^(.+?)\s+(?:at|@)\s+(.+)$/i.exec(line);
  if (at) return { title: clean(at[1]!), company: clean(at[2]!) };
  const parts = line.split(/\s+[|–—-]\s+|\s*,\s+/).map(clean).filter(Boolean);
  return parts.length >= 2 ? { title: parts[0]!, company: parts.slice(1).join(", ") } : { title: clean(line) };
}

/**
 * Group lines into entries: a new entry starts at a non-bullet line that
 * follows bullets (or at the first line). Wrapped bullet lines (starting
 * lowercase) are joined back onto their bullet.
 */
function entries(lines: string[]): { head: string[]; bullets: string[] }[] {
  const out: { head: string[]; bullets: string[] }[] = [];
  for (const line of lines) {
    const isBullet = BULLET.test(line);
    const current = out[out.length - 1];
    if (isBullet) {
      if (!current) out.push({ head: [], bullets: [stripBullet(line)] });
      else current.bullets.push(stripBullet(line));
    } else if (current && current.bullets.length > 0 && /^[a-z(]/.test(line.trim())) {
      current.bullets[current.bullets.length - 1] += ` ${line.trim()}`;
    } else if (!current || current.bullets.length > 0 || current.head.length >= 3) {
      out.push({ head: [line.trim()], bullets: [] });
    } else {
      current.head.push(line.trim());
    }
  }
  return out;
}

function parseExperience(lines: string[]): Resume["experience"] {
  return entries(lines).map(({ head, bullets }) => {
    let date: string | undefined;
    const rest: string[] = [];
    for (const line of head) {
      const found = date ? { rest: line } : findDate(line);
      if (found.date) date = found.date;
      if (found.rest) rest.push(found.rest);
    }
    const first = splitRole(rest[0] ?? "");
    const company = first.company ?? rest[1];
    const location = first.company ? rest[1] : rest[2];
    // Lines after the header that aren't bullets are often a one-line description.
    const extra = rest.slice(first.company ? 2 : 3);
    return {
      title: first.title,
      company,
      date,
      location: location && location.length <= 60 ? location : undefined,
      responsibilities: [...extra, ...bullets].filter(Boolean),
      skills: [],
    };
  }).filter((job) => job.title || job.responsibilities.length > 0);
}

function parseEducation(lines: string[]): Resume["education"] {
  return entries(lines).map(({ head, bullets }) => {
    let period: string | undefined;
    const rest: string[] = [];
    for (const line of [...head, ...bullets]) {
      const found = period ? { rest: line } : findDate(line);
      if (found.date) period = found.date;
      if (found.rest) rest.push(found.rest);
    }
    const school = rest.find((l) => /universit|college|school|institut|academy|polytechnic/i.test(l)) ?? rest[0] ?? "";
    const degree = rest.find((l) => l !== school);
    return { institution: school, degree, period };
  }).filter((school) => school.institution);
}

function parseProjects(lines: string[]): Resume["projects"] {
  return entries(lines).map(({ head, bullets }) => {
    const all = [...head, ...bullets];
    const link = all.map((l) => URL.exec(l)?.[0] ?? GITHUB.exec(l)?.[0]).find(Boolean);
    const url = link ? withHttps(link.replace(/[).,]+$/, "")) : undefined;
    const isRepo = url !== undefined && /github\.com|gitlab\.com/i.test(url);
    const [nameLine = "", ...more] = head;
    const [name, description] = nameLine.split(/\s+[|–—-]\s+|:\s+/, 2).map((s) => clean(s.replace(URL, "")));
    const techLine = all.find((l) => /^(tech(nologies)?|stack|built with|tools)\s*:/i.test(stripBullet(l)));
    const technologies = techLine
      ? stripBullet(techLine).replace(/^[^:]+:\s*/, "").split(/\s*[,|/·•]\s*/).map(clean).filter(Boolean)
      : [];
    return {
      name: name ?? "",
      description: description || more.filter((l) => !URL.test(l)).join(" ") || undefined,
      details: bullets.filter((l) => l !== techLine && !URL.test(l) && l !== stripBullet(techLine ?? "")),
      technologies,
      github: isRepo ? url : undefined,
      demo: isRepo ? undefined : url,
    };
  }).filter((project) => project.name);
}

/** "Languages: Python, Go" → a group; "Python, Go, SQL" → plain skills. */
function parseSkills(lines: string[]): { skills: string[]; tools: Resume["tools"] } {
  const skills: string[] = [];
  const tools: Resume["tools"] = [];
  for (const raw of lines) {
    const line = stripBullet(raw);
    const group = /^([^:]{2,40}):\s*(.+)$/.exec(line);
    const items = (group ? group[2]! : line).split(/\s*[,|;·•]\s*|\s{2,}|\t/).map(clean).filter((s) => s && s.length <= 50);
    if (group) tools.push({ name: clean(group[1]!), skills: items });
    else skills.push(...items);
  }
  return { skills: [...new Set(skills)].slice(0, 40), tools };
}

function parseCertifications(lines: string[]): Resume["certifications"] {
  return lines.map((raw) => {
    const { date, rest } = findDate(stripBullet(raw));
    const link = URL.exec(rest)?.[0];
    const text = clean(rest.replace(URL, ""));
    const [name, issuer] = text.split(/\s+[|–—-]\s+|,\s+(?=[A-Z])/, 2).map(clean);
    return { name: name ?? "", issuer: issuer || undefined, date, link: link ? withHttps(link) : undefined, icon: "file" as const };
  }).filter((cert) => cert.name);
}

/** Name, role and location from the lines before the first heading. */
function parseHeader(lines: string[]) {
  const tokens = lines
    .flatMap((line) => line.split(/\s*[|•·]\s*|\s{3,}|\t/))
    .map(clean)
    .filter((t) => t && !EMAIL.test(t) && !LINKEDIN.test(t) && !GITHUB.test(t) && !URL.test(t) && !PHONE.test(t));
  const looksLikeName = (t: string) =>
    /^[\p{L}][\p{L}'.-]*(?:\s+[\p{L}][\p{L}'.-]*){1,4}$/u.test(t) && t.length <= 60 && !headingOf(t);
  const name = tokens.find(looksLikeName) ?? "";
  const others = tokens.filter((t) => t !== name);
  const location = others.find((t) => /^[\p{L} .'-]+,\s*[\p{L} .'-]+$/u.test(t) && t.length <= 60);
  const role = others.find((t) => t !== location && t.length <= 80 && !/\d{3,}/.test(t));
  return { name, role, location };
}

export function resumeFromText(text: string): Resume | null {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim() !== "");
  if (lines.length === 0) return null;

  const sections = new Map<SectionName, string[]>();
  const header: string[] = [];
  let current: SectionName | null = null;
  for (const line of lines) {
    const heading = headingOf(line);
    if (heading) {
      current = heading;
      if (!sections.has(heading)) sections.set(heading, []);
      continue;
    }
    if (current) sections.get(current)!.push(line);
    else header.push(line);
  }

  const resume = blankResume();
  const email = EMAIL.exec(text)?.[0];
  const linkedin = LINKEDIN.exec(text)?.[0];
  const github = GITHUB.exec(text)?.[0];
  const { name, role, location } = parseHeader(header.slice(0, 8));
  resume.profile = {
    ...resume.profile,
    name,
    role,
    location,
    socials: Object.fromEntries(
      Object.entries({
        email,
        linkedin: linkedin ? withHttps(linkedin) : undefined,
        github: github ? withHttps(github) : undefined,
      }).filter(([, v]) => v),
    ),
  };

  // No headings at all: keep the text as the summary rather than lose it.
  const about = sections.get("about") ?? (sections.size === 0 ? header.slice(1) : []);
  resume.about = about.length ? about.map(stripBullet).join(" ").slice(0, 4000) : undefined;
  resume.experience = parseExperience(sections.get("experience") ?? []);
  resume.education = parseEducation(sections.get("education") ?? []);
  resume.projects = parseProjects(sections.get("projects") ?? []);
  const skills = parseSkills([...(sections.get("skills") ?? [])]);
  const tools = parseSkills(sections.get("tools") ?? []);
  resume.skills = skills.skills.map((skill) => ({ name: skill, icon: "code" as const }));
  resume.tools = [...skills.tools, ...tools.tools, ...(tools.skills.length ? [{ name: "Tools", skills: tools.skills }] : [])];
  resume.certifications = parseCertifications(sections.get("certifications") ?? []);

  const parsed = parseResumeDraft(resume);
  if (!parsed.success) return null;
  const r = parsed.data;
  const empty = !r.profile.name && !r.about && r.experience.length + r.education.length + r.skills.length === 0;
  return empty ? null : r;
}
