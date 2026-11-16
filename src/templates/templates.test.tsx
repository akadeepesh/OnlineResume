import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sampleResume } from "@/lib/resume/sample";
import {
  DEFAULT_SECTION_ORDER,
  parseResume,
  RESUME_SCHEMA_VERSION,
  type Resume,
  type ResumeInput,
  type SectionKey,
} from "@/lib/resume/schema";
import { emptyItem } from "@/lib/store/editor";
import { templates, type TemplateSlug } from "./index";

// ============================================================================
// Every template must render sparse resumes without broken UI: no
// "undefined", no empty links, no dangling separators and no headings for
// sections that have nothing in them. A fresh draft or a partial import must
// look intentional, not broken.
// ============================================================================

const parse = (input: ResumeInput): Resume => {
  const result = parseResume(input);
  if (!result.success) throw new Error(JSON.stringify(result.issues));
  return result.data;
};

/** The smallest resume the schema accepts: just a name. */
const minimal = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Sam Lee" },
});

/** What the editor produces once a user clears fields: present but blank. */
const blank = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: {
    name: "Sam Lee",
    role: "",
    tagline: " ",
    location: "",
    avatar: "",
    resumeUrl: "",
    availability: "",
    socials: { github: "", linkedin: " ", email: "" },
  },
  about: "   ",
});

/** One item per section, each with only its identifying field. */
const bareItems = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Sam Lee" },
  experience: [{ title: "Barista" }],
  projects: [{ name: "Recipe Box" }],
  skills: [{ name: "Latte Art" }],
  tools: [{ name: "Espresso Machines" }],
  education: [{ institution: "Riverside College" }],
  certifications: [{ name: "Food Safety Level 2" }],
});

/**
 * What the editor holds right after clicking "Add" in every section, plus an
 * empty bullet and tag: items exist, but nothing has been typed into them.
 */
const freshlyAdded = parse({
  schemaVersion: RESUME_SCHEMA_VERSION,
  profile: { name: "Sam Lee" },
  experience: [{ ...emptyItem.experience(), responsibilities: [""], skills: [" "] }],
  projects: [{ ...emptyItem.projects(), details: [""] }],
  skills: [emptyItem.skills()],
  tools: [{ ...emptyItem.tools(), skills: [""] }],
  education: [emptyItem.education()],
  certifications: [emptyItem.certifications()],
});

const slugs = Object.keys(templates) as TemplateSlug[];
const TEMPLATES_WITH_AVATAR: TemplateSlug[] = ["classic", "spotlight", "bento"];

const render = (slug: TemplateSlug, data: Resume) => {
  const Template = templates[slug];
  return renderToStaticMarkup(<Template data={data} />);
};

/** Visible text only, with tags and React's text separators removed. */
const textOf = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Words used as section headings across the templates. */
const SECTION_HEADINGS = [
  "About",
  "Profile",
  "Experience",
  "Projects",
  "Selected Work",
  "Skills",
  "Expertise",
  "Tools",
  "Toolbox",
  "Education",
  "Credentials",
  "Certifications",
  "Honours",
  "Based in",
  "Get in touch",
  "Download Resume",
  "Résumé",
  "resume.pdf",
];

function expectNoBrokenMarkup(html: string) {
  const text = textOf(html);
  expect(text).not.toMatch(/\bundefined\b/);
  expect(text).not.toMatch(/\bnull\b/);
  expect(text).not.toMatch(/\bNaN\b/);
  // Empty or half-built links and images
  expect(html).not.toMatch(/\s(href|src)=""/);
  expect(html).not.toMatch(/href="mailto:"/);
  expect(html).not.toContain("mailto:undefined");
  // A separator right after an opening tag or right before a closing tag means
  // one side of "a · b" was missing.
  expect(html).not.toMatch(/<[a-z][^>]*>\s*(<!-- -->)?\s*[·•,]/);
  expect(html).not.toMatch(/[·•,]\s*(<!-- -->)?\s*<\//);
}

describe.each(slugs)("%s template", (slug) => {
  it("renders the full sample resume", () => {
    const html = render(slug, sampleResume);
    expect(textOf(html)).toContain("Alex Morgan");
    const text = textOf(html);
    expect(text).not.toMatch(/\bundefined\b/);
  });

  for (const [label, data] of [
    ["a minimal resume (name only)", minimal],
    ["a resume with blank strings", blank],
    ["freshly added, still empty items", freshlyAdded],
  ] as const) {
    it(`renders ${label} with no broken UI or empty sections`, () => {
      const html = render(slug, data);
      expectNoBrokenMarkup(html);

      const text = textOf(html);
      expect(text).toContain("Sam Lee");
      for (const heading of SECTION_HEADINGS) {
        expect(text, `"${heading}" should not render without content`).not.toMatch(
          new RegExp(`(^|[^\\w])${heading}($|[^\\w])`)
        );
      }
      // Templates with a photo fall back to initials instead of a broken image
      if (TEMPLATES_WITH_AVATAR.includes(slug)) expect(text).toContain("SL");
      expect(html).not.toContain("<img");
    });
  }

  it("renders items that only have their identifying field", () => {
    const html = render(slug, bareItems);
    expectNoBrokenMarkup(html);
    const text = textOf(html);
    const expected = ["Barista", "Latte Art", "Riverside College", "Food Safety Level 2"];
    if (slug === "terminal") {
      // The terminal lists projects as directories, and only shows tools when
      // a visitor runs `tools`.
      expected.push("recipe-box/");
    } else {
      expected.push("Recipe Box", "Espresso Machines");
    }
    for (const value of expected) {
      expect(text, `${value} should be shown`).toContain(value);
    }
  });
});

describe("rich text in every template", () => {
  // Bold is stored as **double asterisks** (the editor's B button writes them).
  // Every field the editor offers bold for must render it, never show the marks.
  const bolded = parse({
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: { name: "Sam Lee" },
    about: "About with **bold about**.",
    experience: [
      { title: "Engineer", company: "Acme", responsibilities: ["Grew sales by **40%** in a year."] },
    ],
    projects: [{ name: "Tool", details: ["Handles **2M requests**."] }],
  });

  // Terminal is plain text by design: it drops the marks instead of bolding.
  const plainTemplates: TemplateSlug[] = ["terminal"];

  it.each(Object.keys(templates) as TemplateSlug[])("%s renders bold marks, never the raw **", (slug) => {
    const Template = templates[slug];
    const html = renderToStaticMarkup(<Template data={bolded} />);
    expect(html).not.toContain("**");
    for (const phrase of ["bold about", "40%", "2M requests"]) {
      if (!html.includes(phrase)) continue; // some templates don't show every field
      if (plainTemplates.includes(slug)) expect(html).not.toMatch(new RegExp(`<strong[^>]*>${phrase}`));
      else expect(html).toMatch(new RegExp(`<strong[^>]*>${phrase}</strong>`));
    }
    expect(html).toContain("40%"); // every template shows experience bullets
  });

  it.each(Object.keys(templates) as TemplateSlug[])("%s shows no raw marks for the sample", (slug) => {
    const Template = templates[slug];
    expect(renderToStaticMarkup(<Template data={sampleResume} />)).not.toContain("**");
  });
});

describe("links typed by users", () => {
  // Every link field a user can fill in, with values that must never reach an href.
  const hostile = parse({
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: {
      name: "Sam Lee",
      resumeUrl: "javascript:alert('resume')",
      avatar: "javascript:alert('avatar')",
      socials: { github: "javascript:alert('gh')", linkedin: "data:text/html,<script>alert(1)</script>" },
    },
    projects: [{ name: "Tool", github: "JavaScript:alert('src')", demo: "vbscript:msgbox", details: [] }],
    skills: [{ name: "Go" }],
    certifications: [{ name: "Cert", link: " javascript:alert('cert')" }],
  });

  const bare = parse({
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: { name: "Sam Lee", resumeUrl: "example.com/cv.pdf" },
    projects: [{ name: "Tool", github: "github.com/sam/tool", demo: "tool.example.com" }],
    certifications: [{ name: "Cert", link: "certs.example.com/123" }],
  });

  it.each(slugs)("%s never renders a dangerous link", (slug) => {
    const html = render(slug, hostile);
    expect(html.toLowerCase()).not.toMatch(/(href|src)="\s*(javascript|vbscript|data:text)/);
    expect(textOf(html)).toMatch(/tool/i); // the item still shows (Terminal lowercases names)
  });

  it.each(slugs)("%s turns bare domains into https links", (slug) => {
    const html = render(slug, bare);
    expect(html).not.toMatch(/href="(github\.com|tool\.example|certs\.example|example\.com)/);
    for (const href of html.match(/href="[^"#]+"/g) ?? []) {
      expect(href, href).toMatch(/^href="(https:\/\/|mailto:|\/)/);
    }
  });
});

describe("section order and hidden sections", () => {
  // One unmistakable marker per section, so its position in the HTML can be found.
  const MARK = (key: SectionKey) => `Mark${key[0].toUpperCase()}${key.slice(1)}`;
  const marked = parse({
    schemaVersion: RESUME_SCHEMA_VERSION,
    profile: { name: "Sam Lee", availability: "Open to work" },
    about: MARK("about"),
    experience: [{ title: MARK("experience") }],
    education: [{ institution: MARK("education") }],
    projects: [{ name: MARK("projects") }],
    skills: [{ name: MARK("skills") }],
    tools: [{ name: MARK("tools"), skills: ["Figma"] }],
    certifications: [{ name: MARK("certifications") }],
  });

  /**
   * Layout a template keeps no matter the order:
   * - columns: Classic always puts skills, tools and education in its sidebar.
   * - groups: sections shown under one heading (Editorial's "Expertise" is
   *   skills + tools). A group sits where its first section is, and its
   *   sections follow the person's order inside it.
   */
  const LAYOUT: Partial<Record<TemplateSlug, { columns?: SectionKey[][]; groups?: SectionKey[][] }>> = {
    classic: {
      columns: [
        ["about", "experience", "projects", "certifications"],
        ["skills", "tools", "education"],
      ],
    },
    editorial: { groups: [["skills", "tools"]] },
    spotlight: { groups: [["skills", "tools"], ["education", "certifications"]] },
  };

  const expectedOrder = (slug: TemplateSlug, order: SectionKey[]) => {
    const { columns = [[...DEFAULT_SECTION_ORDER]], groups = [] } = LAYOUT[slug] ?? {};
    const groupOf = (key: SectionKey) => groups.find((g) => g.includes(key)) ?? [key];
    return columns.flatMap((column) => {
      const inColumn = order.filter((key) => column.includes(key));
      const seen = new Set<SectionKey>();
      return inColumn.flatMap((key) => {
        if (seen.has(key)) return [];
        const members = inColumn.filter((k) => groupOf(key).includes(k));
        members.forEach((k) => seen.add(k));
        return members;
      });
    });
  };

  // Case-insensitive: Terminal shows project names as lowercase directories.
  const at = (html: string, key: SectionKey) => html.toLowerCase().indexOf(MARK(key).toLowerCase());
  const shows = (html: string, key: SectionKey) => at(html, key) >= 0;

  /** Sections in the order their markers first appear in the HTML. */
  const renderedOrder = (html: string) =>
    DEFAULT_SECTION_ORDER.filter((key) => shows(html, key)).sort((a, b) => at(html, a) - at(html, b));

  const orders: SectionKey[][] = [
    [...DEFAULT_SECTION_ORDER],
    [...DEFAULT_SECTION_ORDER].reverse(),
    ["projects", "about", "certifications", "skills", "experience", "tools", "education"],
    ["tools", "education", "about", "certifications", "projects", "experience", "skills"],
  ];

  it.each(slugs)("%s follows the person's section order", (slug) => {
    for (const sectionOrder of orders) {
      const rendered = renderedOrder(render(slug, { ...marked, sectionOrder }));
      // Terminal only shows tools when a visitor runs `tools`.
      expect(rendered.length, sectionOrder.join(",")).toBeGreaterThanOrEqual(slug === "terminal" ? 6 : 7);
      const expected = expectedOrder(slug, sectionOrder).filter((key) => rendered.includes(key));
      expect(rendered, `order ${sectionOrder.join(",")}`).toEqual(expected);
    }
  });

  it.each(slugs)("%s leaves hidden sections out completely", (slug) => {
    const hiddenSections: SectionKey[] = ["about", "experience", "tools", "certifications"];
    const html = render(slug, { ...marked, hiddenSections });
    expectNoBrokenMarkup(html);
    for (const key of hiddenSections) expect(shows(html, key), key).toBe(false);
    for (const key of ["education", "projects", "skills"] as const) expect(shows(html, key), key).toBe(true);
    // Spotlight's About block also shows availability; hiding About hides it all.
    expect(html).not.toContain('id="about"');
  });

  it.each(slugs)("%s shows only the profile when every section is hidden", (slug) => {
    const html = render(slug, { ...marked, hiddenSections: [...DEFAULT_SECTION_ORDER] });
    expectNoBrokenMarkup(html);
    expect(renderedOrder(html)).toEqual([]);
    expect(textOf(html)).toContain("Sam Lee");
  });
});
